import { z } from "zod";

/**
 * KONTRAK KETAT "NO AI MATH" (PRD F2):
 * Vision AI dilarang mengembalikan angka kalori, protein, karbohidrat, atau lemak.
 * Menggunakan `.strict()` agar field ilegal dari LLM langsung ditolak.
 */
export const FoodCategorySchema = z.enum([
  "karbo",
  "protein_hewani",
  "protein_nabati",
  "sayur",
  "sambal_pelengkap",
]);

export const CookingMethodSchema = z.enum([
  "kukus_rebus",
  "panggang",
  "tumis",
  "goreng",
  "goreng_tepung",
  "balado",
  "santan",
  "kecap_manis",
]);

export const PortionUnitSchema = z.enum([
  "centong",
  "potong",
  "sdm",
  "butir",
  "mangkuk",
]);

export const ReferenceObjectTypeSchema = z.enum([
  "sendok",
  "piring",
  "keduanya",
  "tidak_ada",
]);

export const DetectedVisionItemSchema = z
  .object({
    raw_name: z.string().trim().min(1).max(120),
    matched_category: FoodCategorySchema,
    cooking_method: CookingMethodSchema,
    estimated_grams: z.number().positive().max(2000),
    portion_unit_type: PortionUnitSchema,
    estimated_unit_qty: z.number().positive().max(50),
    confidence: z.number().min(0).max(1),
    reference_object_found: z.boolean(),
  })
  .strict();

export const VisionOutputSchema = z
  .object({
    reference_object_type: ReferenceObjectTypeSchema.optional().default("tidak_ada"),
    detected_items: z.array(DetectedVisionItemSchema).min(1).max(15),
  })
  .strict();

export type DetectedVisionItem = z.infer<typeof DetectedVisionItemSchema>;
export type VisionOutput = z.infer<typeof VisionOutputSchema>;
