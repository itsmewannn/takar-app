import { NextResponse } from "next/server";
import { UpdateMealPayloadSchema } from "@/schemas/meal-payload.schema";
import {
  deleteFallbackMeal,
  updateFallbackMeal,
} from "@/lib/mock-fallback";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const deleted = deleteFallbackMeal(id);
    return NextResponse.json({ deleted, source: "local_fallback" });
  }

  const { error } = await supabase.from("meal_logs").delete().eq("id", id);
  if (error) {
    const deleted = deleteFallbackMeal(id);
    return NextResponse.json({ deleted, source: "local_fallback" });
  }

  return NextResponse.json({ deleted: true, source: "supabase" });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body: unknown = await request.json();
    const parsed = UpdateMealPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload update tidak valid." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      const updated = updateFallbackMeal(id, parsed.data);
      if (!updated) {
        return NextResponse.json(
          { error: "Catatan makan tidak ditemukan." },
          { status: 404 }
        );
      }
      return NextResponse.json({ meal: updated, source: "local_fallback" });
    }

    const { data, error } = await supabase
      .from("meal_logs")
      .update(parsed.data)
      .eq("id", id)
      .select("*, meal_items(*)")
      .single();

    if (error || !data) {
      const fallbackUpdated = updateFallbackMeal(id, parsed.data);
      if (!fallbackUpdated) {
        return NextResponse.json(
          { error: "Catatan makan tidak ditemukan." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        meal: fallbackUpdated,
        source: "local_fallback",
      });
    }

    return NextResponse.json({ meal: data, source: "supabase" });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui catatan makan." },
      { status: 500 }
    );
  }
}
