import { NextResponse } from "next/server";
import { UserTargetPayloadSchema } from "@/schemas/meal-payload.schema";
import {
  getFallbackUserTarget,
  updateFallbackUserTarget,
} from "@/lib/mock-fallback";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      target: getFallbackUserTarget(),
      source: "local_fallback",
    });
  }

  const { data, error } = await supabase
    .from("user_targets")
    .select("*")
    .eq("id", "default-user")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({
      target: getFallbackUserTarget(),
      source: "local_fallback",
    });
  }

  return NextResponse.json({
    target: {
      id: String(data.id),
      daily_kcal: Number(data.daily_kcal),
      daily_protein_g: Number(data.daily_protein_g),
      daily_carbs_g: Number(data.daily_carbs_g),
      daily_fat_g: Number(data.daily_fat_g),
    },
    source: "supabase",
  });
}

export async function PUT(request: Request) {
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

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      const updated = updateFallbackUserTarget(parsed.data);
      return NextResponse.json({
        target: updated,
        source: "local_fallback",
      });
    }

    const { data, error } = await supabase
      .from("user_targets")
      .upsert(
        {
          id: "default-user",
          ...parsed.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (error || !data) {
      const fallbackUpdated = updateFallbackUserTarget(parsed.data);
      return NextResponse.json({
        target: fallbackUpdated,
        source: "local_fallback",
      });
    }

    return NextResponse.json({
      target: {
        id: String(data.id),
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
