import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDefaultUserProfile,
  calculateBodyMetricsAndTargets,
} from "@/lib/body-profile-engine";
import {
  getFallbackUserProfile,
  updateFallbackUserTarget,
  upsertFallbackUserProfile,
} from "@/lib/mock-fallback";
import { getAuthenticatedRequestContext } from "@/lib/supabase/server";
import type { UserProfileRow } from "@/types/database.types";

const SaveBodyProfileSchema = z.object({
  display_name: z.string().max(80).nullable().optional(),
  gender: z.enum(["pria", "wanita"]),
  age: z.number().int().min(12).max(100),
  weight_kg: z.number().min(30).max(250),
  height_cm: z.number().min(120).max(230),
  activity_level: z.enum(["sedentary", "light", "moderate", "active"]),
  goal_program: z.enum(["cutting", "bulking", "rekomposisi"]),
});

const PatchStreakProfileSchema = z.object({
  current_streak: z.number().int().min(0).optional(),
  longest_streak: z.number().int().min(0).optional(),
  last_logged_date: z.string().nullable().optional(),
  streak_history: z.array(z.string()).optional(),
  last_celebrated_month: z.number().int().min(0).optional(),
  onboarding_completed: z.boolean().optional(),
});

function normalizeProfileRow(
  userId: string,
  row: Record<string, unknown>
): UserProfileRow {
  const rawHistory = row.streak_history;
  const streakHistory = Array.isArray(rawHistory)
    ? rawHistory.map(String)
    : [];

  return {
    user_id: userId,
    display_name: row.display_name ? String(row.display_name) : null,
    gender: row.gender === "wanita" ? "wanita" : "pria",
    age: Number(row.age ?? 25),
    weight_kg: Number(row.weight_kg ?? 68),
    height_cm: Number(row.height_cm ?? 170),
    activity_level:
      (row.activity_level as UserProfileRow["activity_level"]) ?? "moderate",
    goal_program:
      (row.goal_program as UserProfileRow["goal_program"]) ?? "rekomposisi",
    bmi: Number(row.bmi ?? 23.5),
    tdee_kcal: Number(row.tdee_kcal ?? 2200),
    target_kcal: Number(row.target_kcal ?? 2200),
    target_protein_g: Number(row.target_protein_g ?? 136),
    target_carbs_g: Number(row.target_carbs_g ?? 235),
    target_fat_g: Number(row.target_fat_g ?? 65),
    current_streak: Number(row.current_streak ?? 0),
    longest_streak: Number(row.longest_streak ?? 0),
    last_logged_date: row.last_logged_date
      ? String(row.last_logged_date).slice(0, 10)
      : null,
    streak_history: streakHistory,
    last_celebrated_month: Number(row.last_celebrated_month ?? 0),
    onboarding_completed: Boolean(row.onboarding_completed),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sesi login diperlukan." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;
  if (!supabase) {
    return NextResponse.json({
      profile: getFallbackUserProfile(userId),
      source: "local_fallback",
    });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({
      profile: getFallbackUserProfile(userId),
      source: "local_fallback",
    });
  }

  if (!data) {
    return NextResponse.json({
      profile: buildDefaultUserProfile(userId),
      source: "supabase_default",
    });
  }

  return NextResponse.json({
    profile: normalizeProfileRow(userId, data as Record<string, unknown>),
    source: "supabase",
  });
}

/**
 * PUT /api/profile — Simpan profil tubuh dari 3D Body Scanner,
 * hitung otomatis target Mifflin-St Jeor, dan sinkronkan ke user_targets!
 */
export async function PUT(request: Request) {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sesi login diperlukan." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;

  try {
    const body: unknown = await request.json();
    const parsed = SaveBodyProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data profil tubuh di luar batas wajar.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const calc = calculateBodyMetricsAndTargets({
      gender: input.gender,
      age: input.age,
      weightKg: input.weight_kg,
      heightCm: input.height_cm,
      activityLevel: input.activity_level,
      goalProgram: input.goal_program,
    });

    const targetPayload = {
      daily_kcal: calc.targetKcal,
      daily_protein_g: calc.targetProteinG,
      daily_carbs_g: calc.targetCarbsG,
      daily_fat_g: calc.targetFatG,
    };

    const profilePatch: Partial<UserProfileRow> = {
      display_name: input.display_name ?? null,
      gender: input.gender,
      age: input.age,
      weight_kg: input.weight_kg,
      height_cm: input.height_cm,
      activity_level: input.activity_level,
      goal_program: input.goal_program,
      bmi: calc.bmi,
      tdee_kcal: calc.tdeeKcal,
      target_kcal: calc.targetKcal,
      target_protein_g: calc.targetProteinG,
      target_carbs_g: calc.targetCarbsG,
      target_fat_g: calc.targetFatG,
      onboarding_completed: true,
    };

    if (!supabase) {
      const updatedProfile = upsertFallbackUserProfile(userId, profilePatch);
      updateFallbackUserTarget(userId, targetPayload);
      return NextResponse.json({
        profile: updatedProfile,
        target: targetPayload,
        source: "local_fallback",
      });
    }

    // Sinkronkan juga ke tabel user_targets agar seluruh halaman & Coach langsung update
    await supabase.from("user_targets").upsert(
      {
        id: userId,
        user_id: userId,
        ...targetPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          ...profilePatch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (error || !data) {
      const fallbackProfile = upsertFallbackUserProfile(userId, profilePatch);
      updateFallbackUserTarget(userId, targetPayload);
      return NextResponse.json({
        profile: fallbackProfile,
        target: targetPayload,
        source: "local_fallback",
      });
    }

    return NextResponse.json({
      profile: normalizeProfileRow(userId, data as Record<string, unknown>),
      target: targetPayload,
      source: "supabase",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan profil tubuh." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile — Update cepat data streak harian & last_celebrated_month.
 */
export async function PATCH(request: Request) {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sesi login diperlukan." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;

  try {
    const body: unknown = await request.json();
    const parsed = PatchStreakProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload streak tidak valid." },
        { status: 400 }
      );
    }

    const patchData = parsed.data;

    if (!supabase) {
      const updated = upsertFallbackUserProfile(userId, patchData);
      return NextResponse.json({ profile: updated, source: "local_fallback" });
    }

    const { data: existing } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const baseRow = existing
      ? {}
      : (() => {
          const def = buildDefaultUserProfile(userId);
          return {
            gender: def.gender,
            age: def.age,
            weight_kg: def.weight_kg,
            height_cm: def.height_cm,
            activity_level: def.activity_level,
            goal_program: def.goal_program,
            bmi: def.bmi,
            tdee_kcal: def.tdee_kcal,
            target_kcal: def.target_kcal,
            target_protein_g: def.target_protein_g,
            target_carbs_g: def.target_carbs_g,
            target_fat_g: def.target_fat_g,
          };
        })();

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          ...baseRow,
          ...patchData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();

    if (error || !data) {
      const fallbackUpdated = upsertFallbackUserProfile(userId, patchData);
      return NextResponse.json({
        profile: fallbackUpdated,
        source: "local_fallback",
      });
    }

    return NextResponse.json({
      profile: normalizeProfileRow(userId, data as Record<string, unknown>),
      source: "supabase",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui konsistensi harian." },
      { status: 500 }
    );
  }
}
