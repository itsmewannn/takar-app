export type FoodCategory =
  | "karbo"
  | "protein_hewani"
  | "protein_nabati"
  | "sayur"
  | "sambal_pelengkap";

export type CookingMethod =
  | "kukus_rebus"
  | "panggang"
  | "tumis"
  | "goreng"
  | "goreng_tepung"
  | "balado"
  | "santan"
  | "kecap_manis";

export type PortionUnit = "centong" | "potong" | "sdm" | "butir" | "mangkuk";

export type MealType = "sarapan" | "makan_siang" | "makan_malam" | "camilan";

export type ReferenceObjectType =
  | "sendok"
  | "piring"
  | "keduanya"
  | "tidak_ada";

export interface TkpiFood {
  id: string;
  name: string;
  aliases: string[];
  category: FoodCategory;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_unit_type: PortionUnit;
  grams_per_unit: number;
}

export interface CookingModifier {
  method_key: CookingMethod;
  label: string;
  extra_fat_per_100g: number;
  extra_carbs_per_100g: number;
  extra_kcal_per_100g: number;
}

export interface MacroBreakdown {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface PortionChipOption {
  label: string;
  unit_qty: number;
}

export interface CalculatedItem {
  client_id: string;
  tkpi_food_id: string;
  raw_name: string;
  display_name: string;
  category: FoodCategory;
  cooking_method: CookingMethod;
  portion_unit_type: PortionUnit;
  unit_qty: number;
  grams_per_unit: number;
  grams: number;
  confidence: number;
  reference_object_found: boolean;
  base_macro: MacroBreakdown;
  hidden_macro: MacroBreakdown;
  total_macro: MacroBreakdown;
  hidden_kcal: number;
  tkpi_reference: TkpiFood;
}

export interface AnalyzeMealResponse {
  items: CalculatedItem[];
  summary: MacroBreakdown & { hidden_kcal: number };
  reference_calibrated: boolean;
  reference_object_type: ReferenceObjectType;
  source: "gemini_vision" | "mock_fallback";
}
