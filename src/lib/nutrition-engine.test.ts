import { describe, expect, it } from "vitest";
import {
  COOKING_MODIFIERS,
  PORTION_CHIP_PRESETS,
  buildCalculatedItem,
  calculateFoodMacros,
  convertPortionToGrams,
  recalculateItemByCookingMethod,
  recalculateItemByUnitQty,
  sumMealMacros,
} from "./nutrition-engine";
import { matchTkpiFood } from "./tkpi-matcher";
import { buildProteinGapAdvice } from "./protein-advisor";
import {
  calculateBodyMetricsAndTargets,
  evaluateStreakProgress,
  getFlameEvolutionTier,
} from "./body-profile-engine";
import { getMockVisionOutput, DEFAULT_TKPI_FOODS } from "./mock-fallback";
import { VisionOutputSchema } from "@/schemas/vision-output.schema";
import type { CookingMethod, TkpiFood } from "@/types/nutrition.types";

const NASI_PUTIH: TkpiFood = {
  id: "nasi-putih",
  name: "Nasi Putih",
  aliases: ["nasi"],
  category: "karbo",
  kcal_per_100g: 130,
  protein_per_100g: 2.4,
  carbs_per_100g: 28.6,
  fat_per_100g: 0.2,
  default_unit_type: "centong",
  grams_per_unit: 100,
};

const DADA_AYAM: TkpiFood = {
  id: "dada-ayam",
  name: "Dada Ayam (Tanpa Kulit)",
  aliases: ["ayam dada"],
  category: "protein_hewani",
  kcal_per_100g: 165,
  protein_per_100g: 31.0,
  carbs_per_100g: 0,
  fat_per_100g: 3.6,
  default_unit_type: "potong",
  grams_per_unit: 100,
};

const TEMPE_OREK: TkpiFood = {
  id: "tempe-orek",
  name: "Tempe Orek (Potong Kecil)",
  aliases: ["orek tempe"],
  category: "protein_nabati",
  kcal_per_100g: 193,
  protein_per_100g: 19.0,
  carbs_per_100g: 12.7,
  fat_per_100g: 7.7,
  default_unit_type: "sdm",
  grams_per_unit: 30,
};

const TELUR_AYAM: TkpiFood = {
  id: "telur-ayam",
  name: "Telur Ayam",
  aliases: ["telur balado"],
  category: "protein_hewani",
  kcal_per_100g: 155,
  protein_per_100g: 12.6,
  carbs_per_100g: 1.1,
  fat_per_100g: 10.6,
  default_unit_type: "butir",
  grams_per_unit: 55,
};

describe("nutrition-engine — deterministic TKPI + cooking modifiers", () => {
  it("calculates all 8 cooking_method modifiers accurately per 100g", () => {
    const expectations: Record<
      CookingMethod,
      { extraFat: number; extraCarbs: number; extraKcal: number }
    > = {
      kukus_rebus: { extraFat: 0, extraCarbs: 0, extraKcal: 0 },
      panggang: { extraFat: 0, extraCarbs: 0, extraKcal: 0 },
      tumis: { extraFat: 4, extraCarbs: 0, extraKcal: 36 },
      goreng: { extraFat: 9, extraCarbs: 0, extraKcal: 81 },
      balado: { extraFat: 9, extraCarbs: 0, extraKcal: 81 },
      goreng_tepung: { extraFat: 12, extraCarbs: 10, extraKcal: 148 },
      santan: { extraFat: 8, extraCarbs: 0, extraKcal: 72 },
      kecap_manis: { extraFat: 4, extraCarbs: 6, extraKcal: 60 },
    };

    const allMethods = Object.keys(COOKING_MODIFIERS) as CookingMethod[];
    expect(allMethods).toHaveLength(8);

    for (const method of allMethods) {
      const result = calculateFoodMacros({
        food: DADA_AYAM,
        grams: 100,
        cookingMethod: method,
      });

      const exp = expectations[method];
      expect(result.base_macro).toEqual({
        kcal: 165,
        protein_g: 31,
        carbs_g: 0,
        fat_g: 3.6,
      });
      expect(result.hidden_macro).toEqual({
        kcal: exp.extraKcal,
        protein_g: 0,
        carbs_g: exp.extraCarbs,
        fat_g: exp.extraFat,
      });
      expect(result.total_macro.kcal).toBe(165 + exp.extraKcal);
      expect(result.total_macro.protein_g).toBe(31);
      expect(result.total_macro.carbs_g).toBe(exp.extraCarbs);
      expect(result.total_macro.fat_g).toBeCloseTo(3.6 + exp.extraFat, 1);
    }
  });

  it("scales Tempe Orek 2 sdm (60g) with kecap_manis transparently", () => {
    const item = buildCalculatedItem({
      clientId: "item-1",
      food: TEMPE_OREK,
      cookingMethod: "kecap_manis",
      portionUnitType: "sdm",
      unitQty: 2,
    });

    expect(item.grams).toBe(60);
    expect(item.base_macro.kcal).toBe(116);
    expect(item.base_macro.protein_g).toBe(11.4);
    expect(item.hidden_macro.kcal).toBe(36);
    expect(item.hidden_macro.fat_g).toBe(2.4);
    expect(item.hidden_macro.carbs_g).toBe(3.6);
    expect(item.total_macro.kcal).toBe(
      item.base_macro.kcal + item.hidden_macro.kcal
    );
  });

  it("converts local Indonesian portion units accurately", () => {
    expect(convertPortionToGrams("centong", 1.5, 100)).toBe(150);
    expect(convertPortionToGrams("potong", 0.7, 100)).toBe(70);
    expect(convertPortionToGrams("potong", 1.4, 100)).toBe(140);
    expect(convertPortionToGrams("butir", 2, 55)).toBe(110);
    expect(convertPortionToGrams("sdm", 3, 30)).toBe(90);
    expect(convertPortionToGrams("mangkuk", 1.5, 180)).toBe(270);
    expect(convertPortionToGrams("centong", 0, 100)).toBe(0);
  });

  it("exposes all 1-tap portion chip presets required by PRD F4", () => {
    expect(PORTION_CHIP_PRESETS.centong.map((c) => c.unit_qty)).toEqual([
      0.5, 1, 1.5, 2,
    ]);
    expect(PORTION_CHIP_PRESETS.potong.map((c) => c.unit_qty)).toEqual([
      0.7, 1, 1.4,
    ]);
    expect(PORTION_CHIP_PRESETS.sdm.map((c) => c.unit_qty)).toEqual([1, 2, 3]);
    expect(PORTION_CHIP_PRESETS.butir.map((c) => c.unit_qty)).toEqual([
      0.5, 1, 2,
    ]);
  });

  it("recalculates portion and cooking method instantaneously and sums plate totals", () => {
    const nasi = buildCalculatedItem({
      clientId: "nasi",
      food: NASI_PUTIH,
      cookingMethod: "kukus_rebus",
      unitQty: 1,
    });
    const nasiSatuSetengah = recalculateItemByUnitQty(nasi, 1.5);
    expect(nasiSatuSetengah.grams).toBe(150);
    expect(nasiSatuSetengah.total_macro.kcal).toBe(195);
    expect(nasiSatuSetengah.total_macro.protein_g).toBe(3.6);

    const telurRebus = buildCalculatedItem({
      clientId: "telur",
      food: TELUR_AYAM,
      cookingMethod: "kukus_rebus",
      unitQty: 1,
    });
    expect(telurRebus.hidden_kcal).toBe(0);

    const telurBalado = recalculateItemByCookingMethod(telurRebus, "balado");
    expect(telurBalado.hidden_kcal).toBe(45);
    expect(telurBalado.total_macro.kcal).toBe(
      telurRebus.base_macro.kcal + 45
    );

    const plateTotal = sumMealMacros([nasiSatuSetengah, telurBalado]);
    expect(plateTotal.kcal).toBe(
      nasiSatuSetengah.total_macro.kcal + telurBalado.total_macro.kcal
    );
    expect(plateTotal.protein_g).toBeCloseTo(
      nasiSatuSetengah.total_macro.protein_g + telurBalado.total_macro.protein_g,
      1
    );
    expect(plateTotal.hidden_kcal).toBe(45);
  });

  it("strictly enforces No AI Math in VisionOutputSchema and seeds >= 40 TKPI foods", () => {
    expect(DEFAULT_TKPI_FOODS.length).toBeGreaterThanOrEqual(40);

    const validMock = getMockVisionOutput();
    expect(validMock.detected_items.length).toBeGreaterThan(0);

    // Apabila LLM mencoba menyelipkan kalori/protein, Zod strict wajib menolak!
    const rogueAiPayload = {
      reference_object_type: "sendok",
      detected_items: [
        {
          ...validMock.detected_items[0],
          calories: 250,
        },
      ],
    };
    expect(VisionOutputSchema.safeParse(rogueAiPayload).success).toBe(false);
  });

  it("matches Indonesian warteg dish names accurately and builds protein gap advice", () => {
    expect(matchTkpiFood("Orek Tempe Basah", "protein_nabati").food.id).toBe(
      "tempe-orek"
    );
    expect(matchTkpiFood("Ayam Goreng Lengkuas", "protein_hewani").food.id).toBe(
      "paha-ayam"
    );
    expect(matchTkpiFood("Tumis Kangkung", "sayur").food.id).toBe("kangkung");

    const gap32 = buildProteinGapAdvice({
      consumedProteinG: 98,
      targetProteinG: 130,
    });
    expect(gap32.deficit_g).toBe(32);
    expect(gap32.is_met).toBe(false);
    expect(gap32.headline).toContain("32g");

    const met = buildProteinGapAdvice({
      consumedProteinG: 135,
      targetProteinG: 130,
    });
    expect(met.is_met).toBe(true);
    expect(met.deficit_g).toBe(0);
  });

  it("calculates V2 Mifflin-St Jeor targets and Consistency Streak evolution tiers", () => {
    const cutMale = calculateBodyMetricsAndTargets({
      gender: "pria",
      age: 25,
      weightKg: 70,
      heightCm: 172,
      activityLevel: "moderate",
      goalProgram: "cutting",
    });
    const bulkMale = calculateBodyMetricsAndTargets({
      gender: "pria",
      age: 25,
      weightKg: 70,
      heightCm: 172,
      activityLevel: "moderate",
      goalProgram: "bulking",
    });
    expect(cutMale.targetKcal).toBe(cutMale.tdeeKcal - 350);
    expect(bulkMale.targetKcal).toBe(bulkMale.tdeeKcal + 300);
    expect(cutMale.targetProteinG).toBeGreaterThanOrEqual(140);

    // 5-tier Heat Flame Evolution (Kuning, Oren, Merah, Biru, Hijau)
    expect(getFlameEvolutionTier(5).key).toBe("yellow");
    expect(getFlameEvolutionTier(14).key).toBe("orange");
    expect(getFlameEvolutionTier(30).key).toBe("red");
    expect(getFlameEvolutionTier(95).key).toBe("blue");
    expect(getFlameEvolutionTier(365).key).toBe("green");

    // Streak increments +1 on consecutive day within <= 135% calorie cap
    const day2 = evaluateStreakProgress({
      currentStreak: 29,
      longestStreak: 29,
      lastLoggedDate: "2026-11-25",
      streakHistory: ["2026-11-25"],
      todayYmd: "2026-11-26",
      mealsCountToday: 1,
      totalKcalToday: 1850,
      targetKcal: 2000,
    });
    expect(day2.current_streak).toBe(30);
    expect(day2.longest_streak).toBe(30);

    // Extreme calorie > 135% blocks streak increment
    const extreme = evaluateStreakProgress({
      currentStreak: 5,
      longestStreak: 5,
      lastLoggedDate: "2026-11-25",
      streakHistory: ["2026-11-25"],
      todayYmd: "2026-11-26",
      mealsCountToday: 3,
      totalKcalToday: 3100,
      targetKcal: 2000,
    });
    expect(extreme.current_streak).toBe(5);
  });
});
