import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeMealImageWithVision } from "@/lib/gemini-vision";
import { DEFAULT_TKPI_FOODS } from "@/lib/mock-fallback";
import { buildCalculatedItem, sumMealMacros } from "@/lib/nutrition-engine";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { matchTkpiFood } from "@/lib/tkpi-matcher";
import type {
  AnalyzeMealResponse,
  ReferenceObjectType,
  TkpiFood,
} from "@/types/nutrition.types";

const AnalyzeRequestSchema = z.object({
  imageBase64: z.string().min(16, "Data gambar tidak valid atau kosong."),
  mimeType: z
    .enum(["image/webp", "image/jpeg", "image/png"])
    .optional()
    .default("image/webp"),
});

async function loadTkpiCatalog(): Promise<TkpiFood[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return DEFAULT_TKPI_FOODS;
  }

  const { data, error } = await supabase.from("tkpi_foods").select("*");
  if (error || !data || data.length === 0) {
    return DEFAULT_TKPI_FOODS;
  }

  return data.map((row) => ({
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
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedReq = AnalyzeRequestSchema.safeParse(body);

    if (!parsedReq.success) {
      return NextResponse.json(
        {
          error: "Format gambar tidak terbaca. Silakan foto ulang atau catat manual.",
          code: "INVALID_IMAGE_PAYLOAD",
        },
        { status: 400 }
      );
    }

    const cleanBase64 = parsedReq.data.imageBase64.includes(",")
      ? parsedReq.data.imageBase64.split(",")[1]!
      : parsedReq.data.imageBase64;

    const [visionResult, tkpiCatalog] = await Promise.all([
      analyzeMealImageWithVision({
        base64Data: cleanBase64,
        mimeType: parsedReq.data.mimeType,
      }),
      loadTkpiCatalog(),
    ]);

    const { vision, source } = visionResult;

    const calculatedItems = vision.detected_items.map((detected, index) => {
      const { food, matchScore } = matchTkpiFood(
        detected.raw_name,
        detected.matched_category,
        tkpiCatalog
      );

      // Gabungkan confidence deteksi visual dengan skor kecocokan database TKPI
      const effectiveConfidence =
        Math.round(Math.min(detected.confidence, matchScore + 0.15) * 100) /
        100;

      return buildCalculatedItem({
        clientId: `scan-${Date.now()}-${index}`,
        food,
        rawName: detected.raw_name,
        displayName: detected.raw_name,
        cookingMethod: detected.cooking_method,
        portionUnitType: detected.portion_unit_type,
        unitQty: detected.estimated_unit_qty,
        explicitGrams: detected.estimated_grams,
        confidence: effectiveConfidence,
        referenceObjectFound: detected.reference_object_found,
      });
    });

    const summary = sumMealMacros(calculatedItems);
    const anyRefFound =
      vision.reference_object_type !== "tidak_ada" ||
      calculatedItems.some((item) => item.reference_object_found);

    const referenceObjectType: ReferenceObjectType =
      vision.reference_object_type !== "tidak_ada"
        ? vision.reference_object_type
        : anyRefFound
          ? "piring"
          : "tidak_ada";

    const payload: AnalyzeMealResponse = {
      items: calculatedItems,
      summary,
      reference_calibrated: anyRefFound,
      reference_object_type: referenceObjectType,
      source,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal menganalisis foto makanan saat ini.";
    return NextResponse.json(
      {
        error: message,
        code: "VISION_ANALYSIS_FAILED",
      },
      { status: 502 }
    );
  }
}
