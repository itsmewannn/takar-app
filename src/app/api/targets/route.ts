import { NextResponse } from "next/server";
import { UserTargetPayloadSchema } from "@/schemas/meal-payload.schema";
import {
  getFallbackUserTarget,
  updateFallbackUserTarget,
} from "@/lib/mock-fallback";
import { getAuthenticatedRequestContext } from "@/lib/supabase/server";

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
      target: getFallbackUserTarget(userId),
      source: "local_fallback",
    });
  }

  const { data, error } = await supabase
    .from("user_targets")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      target: getFallbackUserTarget(userId),
      source: "local_fallback",
    });
  }

  return NextResponse.json({
    target: {
      id: String(data.id),
      user_id: userId,
      daily_kcal: Number(data.daily_kcal),
      daily_protein_g: Number(data.daily_protein_g),
      daily_carbs_g: Number(data.daily_carbs_g),
      daily_fat_g: Number(data.daily_fat_g),
    },
    source: "supabase",
  });
}

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
    const parsed = UserTargetPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Nilai target harian di luar batas wajar.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (!supabase) {
      const updated = updateFallbackUserTarget(userId, parsed.data);
      return NextResponse.json({
        target: updated,
        source: "local_fallback",
      });
    }

    // Coba simpan lengkap dengan kolom user_id; jika skema lama belum memiliki kolom user_id, simpan dengan id = userId
    let { data, error } = await supabase
      .from("user_targets")
      .upsert(
        {
          id: userId,
          user_id: userId,
          ...parsed.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error) {
      const retry = await supabase
        .from("user_targets")
        .upsert(
          {
            id: userId,
            ...parsed.data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("*")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      const fallbackUpdated = updateFallbackUserTarget(userId, parsed.data);
      return NextResponse.json({
        target: fallbackUpdated,
        source: "local_fallback",
      });
    }

    return NextResponse.json({
      target: {
        id: String(data.id),
        user_id: userId,
        daily_kcal: Number(data.daily_kcal),
        daily_protein_g: Number(data.daily_protein_g),
        daily_carbs_g: Number(data.daily_carbs_g),
        daily_fat_g: Number(data.daily_fat_g),
      },
      source: "supabase",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan target harian." },
      { status: 500 }
    );
  }
}
