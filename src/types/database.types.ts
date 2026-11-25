import type {
  CookingMethod,
  FoodCategory,
  MealType,
  PortionUnit,
} from "./nutrition.types";

export interface TkpiFoodRow {
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
  created_at?: string;
}

export interface CookingModifierRow {
  method_key: CookingMethod;
  label: string;
  extra_fat_per_100g: number;
  extra_carbs_per_100g: number;
  extra_kcal_per_100g: number;
}

export interface UserTargetRow {
  id: string;
  user_id?: string;
  daily_kcal: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
  updated_at?: string;
}

export interface MealItemRow {
  id: string;
  meal_log_id: string;
  tkpi_food_id: string;
  display_name: string;
  cooking_method: CookingMethod;
  grams: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  hidden_kcal: number;
}

export interface MealLogRow {
  id: string;
  user_id?: string;
  logged_at: string;
  meal_type: MealType;
  image_url: string | null;
  total_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  reference_calibrated: boolean;
}

export interface MealLogWithItems extends MealLogRow {
  meal_items: MealItemRow[];
}

export type GenderType = "pria" | "wanita";
export type ActivityLevelType = "sedentary" | "light" | "moderate" | "active";
export type GoalProgramType = "cutting" | "bulking" | "rekomposisi";

export interface UserProfileRow {
  user_id: string;
  display_name: string | null;
  gender: GenderType;
  age: number;
  weight_kg: number;
  height_cm: number;
  activity_level: ActivityLevelType;
  goal_program: GoalProgramType;
  bmi: number;
  tdee_kcal: number;
  target_kcal: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  current_streak: number;
  longest_streak: number;
  last_logged_date: string | null;
  streak_history: string[];
  last_celebrated_month: number;
  onboarding_completed: boolean;
  updated_at?: string;
}
