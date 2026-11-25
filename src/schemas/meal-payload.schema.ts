import { z } from "zod";
import { CookingMethodSchema } from "./vision-output.schema";

export const MealTypeSchema = z.enum([
  "sarapan",
  "makan_siang",
  "makan_malam",
  "camilan",
]);

export const MealItemPayloadSchema = z.object({
  tkpi_food_id: z.string().min(1),
  display_name: z.string().trim().min(1).max(120),
  cooking_method: CookingMethodSchema,
  grams: z.number().positive().max(3000),
  kcal: z.number().int().nonnegative().max(10000),
  protein_g: z.number().nonnegative().max(1000),
  carbs_g: z.number().nonnegative().max(1000),
  fat_g: z.number().nonnegative().max(1000),
  hidden_kcal: z.number().int().nonnegative().max(5000),
});

export const CreateMealPayloadSchema = z.object({
  meal_type: MealTypeSchema.default("makan_siang"),
  image_url: z.string().nullable().optional(),
  reference_calibrated: z.boolean().default(false),
  total_kcal: z.number().int().nonnegative(),
  total_protein_g: z.number().nonnegative(),
  total_carbs_g: z.number().nonnegative(),
  total_fat_g: z.number().nonnegative(),
  items: z.array(MealItemPayloadSchema).min(1),
});

export const UpdateMealPayloadSchema = z.object({
  meal_type: MealTypeSchema.optional(),
  total_kcal: z.number().int().nonnegative().optional(),
  total_protein_g: z.number().nonnegative().optional(),
  total_carbs_g: z.number().nonnegative().optional(),
  total_fat_g: z.number().nonnegative().optional(),
});

export const UserTargetPayloadSchema = z.object({
  daily_kcal: z.number().int().min(800).max(8000),
  daily_protein_g: z.number().int().min(30).max(500),
  daily_carbs_g: z.number().int().min(0).max(1000),
  daily_fat_g: z.number().int().min(10).max(400),
});

export type CreateMealPayload = z.infer<typeof CreateMealPayloadSchema>;
export type UpdateMealPayload = z.infer<typeof UpdateMealPayloadSchema>;
export type UserTargetPayload = z.infer<typeof UserTargetPayloadSchema>;
