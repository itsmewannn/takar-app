import { NextResponse } from "next/server";
import { CreateMealPayloadSchema } from "@/schemas/meal-payload.schema";
import {
  createFallbackMeal,
  listFallbackMealsForDate,
} from "@/lib/mock-fallback";
import { getAuthenticatedRequestContext } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sesi login diperlukan. Silakan masuk ke akun TAKAR." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") ?? undefined;

  if (!supabase) {
    return NextResponse.json({
      meals: listFallbackMealsForDate(userId, dateParam),
      source: "local_fallback",
    });
  }

  let query = supabase
    .from("meal_logs")
    .select("*, meal_items(*)")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false });

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    query = query
      .gte("logged_at", `${dateParam}T00:00:00.000Z`)
      .lte("logged_at", `${dateParam}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error || !data) {
    return NextResponse.json({
      meals: listFallbackMealsForDate(userId, dateParam),
      source: "local_fallback",
    });
  }

  return NextResponse.json({
    meals: data,
    source: "supabase",
  });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return NextResponse.json(
      { error: "Sesi login diperlukan. Silakan masuk ke akun TAKAR." },
      { status: 401 }
    );
  }

  const { supabase, userId } = auth;

  try {
    const body: unknown = await request.json();
    const parsed = CreateMealPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data catatan makan tidak valid.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    if (!supabase) {
      const created = createFallbackMeal(userId, payload);
      return NextResponse.json(
        { meal: created, source: "local_fallback" },
        { status: 201 }
      );
    }

    const { data: mealRow, error: mealError } = await supabase
      .from("meal_logs")
      .insert({
        user_id: userId,
        meal_type: payload.meal_type,
        image_url: payload.image_url ?? null,
        total_kcal: payload.total_kcal,
        total_protein_g: payload.total_protein_g,
        total_carbs_g: payload.total_carbs_g,
        total_fat_g: payload.total_fat_g,
        reference_calibrated: payload.reference_calibrated,
      })
      .select("*")
      .single();

    if (mealError || !mealRow) {
      const fallbackCreated = createFallbackMeal(userId, payload);
      return NextResponse.json(
        { meal: fallbackCreated, source: "local_fallback" },
        { status: 201 }
      );
    }

    const itemsToInsert = payload.items.map((item) => ({
      meal_log_id: mealRow.id,
      tkpi_food_id: item.tkpi_food_id,
      display_name: item.display_name,
      cooking_method: item.cooking_method,
      grams: item.grams,
      kcal: item.kcal,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      hidden_kcal: item.hidden_kcal,
    }));

    const { data: insertedItems } = await supabase
      .from("meal_items")
      .insert(itemsToInsert)
      .select("*");

    return NextResponse.json(
      {
        meal: {
          ...mealRow,
          meal_items: insertedItems ?? [],
        },
        source: "supabase",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan catatan makan." },
      { status: 500 }
    );
  }
}
