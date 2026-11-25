import { NextResponse } from "next/server";
import { DEFAULT_TKPI_FOODS } from "@/lib/mock-fallback";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { searchTkpiFoods } from "@/lib/tkpi-matcher";
import type { FoodCategory, TkpiFood } from "@/types/nutrition.types";

const VALID_CATEGORIES = new Set<string>([
  "semua",
  "karbo",
  "protein_hewani",
  "protein_nabati",
  "sayur",
  "sambal_pelengkap",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const rawCategory = searchParams.get("category") ?? "semua";
  const category = VALID_CATEGORIES.has(rawCategory)
    ? (rawCategory as FoodCategory | "semua")
    : "semua";

  const supabase = getSupabaseServerClient();
  let catalog: TkpiFood[] = DEFAULT_TKPI_FOODS;
  let source: "supabase" | "local_fallback" = "local_fallback";

  if (supabase) {
    const { data, error } = await supabase
      .from("tkpi_foods")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      catalog = data.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        aliases: Array.isArray(row.aliases) ? row.aliases.map(String) : [],
        category: row.category,
        kcal_per_100g: Number(row.kcal_per_100g),
        protein_per_100g: Number(row.protein_per_100g),
        carbs_per_100g: Number(row.carbs_per_100g),
        fat_per_100g: Number(row.fat_per_100g),
        default_unit_type: row.default_unit_type,
        grams_per_unit: Number(row.grams_per_unit),
      }));
      source = "supabase";
    }
  }

  const foods = searchTkpiFoods(q, category, catalog);
  return NextResponse.json({ foods, source });
}
