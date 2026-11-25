import type {
  CalculatedItem,
  CookingMethod,
  CookingModifier,
  MacroBreakdown,
  PortionChipOption,
  PortionUnit,
  TkpiFood,
} from "@/types/nutrition.types";

/**
 * Tabel deterministik pengali kalori tersembunyi per 100g bahan (PRD F3).
 * DILARANG menggunakan AI untuk menghitung nilai ini.
 */
export const COOKING_MODIFIERS: Record<CookingMethod, CookingModifier> = {
  kukus_rebus: {
    method_key: "kukus_rebus",
    label: "Kukus / Rebus",
    extra_fat_per_100g: 0,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 0,
  },
  panggang: {
    method_key: "panggang",
    label: "Bakar / Panggang",
    extra_fat_per_100g: 0,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 0,
  },
  tumis: {
    method_key: "tumis",
    label: "Tumis",
    extra_fat_per_100g: 4,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 36,
  },
  goreng: {
    method_key: "goreng",
    label: "Goreng",
    extra_fat_per_100g: 9,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 81,
  },
  balado: {
    method_key: "balado",
    label: "Balado / Sambal",
    extra_fat_per_100g: 9,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 81,
  },
  goreng_tepung: {
    method_key: "goreng_tepung",
    label: "Goreng Tepung",
    extra_fat_per_100g: 12,
    extra_carbs_per_100g: 10,
    extra_kcal_per_100g: 148,
  },
  santan: {
    method_key: "santan",
    label: "Kuah Santan",
    extra_fat_per_100g: 8,
    extra_carbs_per_100g: 0,
    extra_kcal_per_100g: 72,
  },
  kecap_manis: {
    method_key: "kecap_manis",
    label: "Masak Kecap",
    extra_fat_per_100g: 4,
    extra_carbs_per_100g: 6,
    extra_kcal_per_100g: 60,
  },
};

export const DEFAULT_UNIT_GRAMS: Record<PortionUnit, number> = {
  centong: 100,
  potong: 75,
  sdm: 30,
  butir: 55,
  mangkuk: 180,
};

/**
 * Opsi chip 1-tap sesuai satuan porsi lokal (PRD F4).
 */
export const PORTION_CHIP_PRESETS: Record<PortionUnit, PortionChipOption[]> = {
  centong: [
    { label: "0.5 ctg", unit_qty: 0.5 },
    { label: "1 ctg", unit_qty: 1 },
    { label: "1.5 ctg", unit_qty: 1.5 },
    { label: "2 ctg", unit_qty: 2 },
  ],
  potong: [
    { label: "Kecil (0.7x)", unit_qty: 0.7 },
    { label: "Sedang (1x)", unit_qty: 1 },
    { label: "Besar (1.4x)", unit_qty: 1.4 },
  ],
  sdm: [
    { label: "1 sdm", unit_qty: 1 },
    { label: "2 sdm", unit_qty: 2 },
    { label: "3 sdm", unit_qty: 3 },
  ],
  butir: [
    { label: "0.5 btr", unit_qty: 0.5 },
    { label: "1 btr", unit_qty: 1 },
    { label: "2 btr", unit_qty: 2 },
  ],
  mangkuk: [
    { label: "0.5 mgk", unit_qty: 0.5 },
    { label: "1 mgk", unit_qty: 1 },
    { label: "1.5 mgk", unit_qty: 1.5 },
  ],
};

export function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

/**
 * Konversi kuantitas satuan lokal ke gramasi aktual.
 * Contoh: 1.5 centong nasi (100g/centong) -> 150g.
 */
export function convertPortionToGrams(
  unitType: PortionUnit,
  unitQty: number,
  foodGramsPerUnit?: number
): number {
  if (unitQty <= 0 || !Number.isFinite(unitQty)) {
    return 0;
  }
  const baseGrams =
    foodGramsPerUnit && foodGramsPerUnit > 0
      ? foodGramsPerUnit
      : DEFAULT_UNIT_GRAMS[unitType];
  return roundToOneDecimal(unitQty * baseGrams);
}

/**
 * Menghitung Base Macro (TKPI murni) dan Hidden Oil/Sauce Macro secara terpisah & deterministik.
 * Total dijamin identik dengan penjumlahan Base + Hidden.
 */
export function calculateFoodMacros(params: {
  food: Pick<
    TkpiFood,
    "kcal_per_100g" | "protein_per_100g" | "carbs_per_100g" | "fat_per_100g"
  >;
  grams: number;
  cookingMethod: CookingMethod;
  modifiersMap?: Record<CookingMethod, CookingModifier>;
}): {
  base_macro: MacroBreakdown;
  hidden_macro: MacroBreakdown;
  total_macro: MacroBreakdown;
} {
  const { food, grams, cookingMethod, modifiersMap = COOKING_MODIFIERS } = params;
  const safeGrams = Math.max(0, Number.isFinite(grams) ? grams : 0);
  const ratio = safeGrams / 100;
  const modifier = modifiersMap[cookingMethod] ?? COOKING_MODIFIERS.kukus_rebus;

  const base_macro: MacroBreakdown = {
    kcal: Math.round(ratio * food.kcal_per_100g),
    protein_g: roundToOneDecimal(ratio * food.protein_per_100g),
    carbs_g: roundToOneDecimal(ratio * food.carbs_per_100g),
    fat_g: roundToOneDecimal(ratio * food.fat_per_100g),
  };

  const hiddenFat = roundToOneDecimal(ratio * modifier.extra_fat_per_100g);
  const hiddenCarbs = roundToOneDecimal(ratio * modifier.extra_carbs_per_100g);
  const hiddenKcal = Math.round(ratio * modifier.extra_kcal_per_100g);

  const hidden_macro: MacroBreakdown = {
    kcal: hiddenKcal,
    protein_g: 0,
    carbs_g: hiddenCarbs,
    fat_g: hiddenFat,
  };

  const total_macro: MacroBreakdown = {
    kcal: base_macro.kcal + hidden_macro.kcal,
    protein_g: base_macro.protein_g,
    carbs_g: roundToOneDecimal(base_macro.carbs_g + hidden_macro.carbs_g),
    fat_g: roundToOneDecimal(base_macro.fat_g + hidden_macro.fat_g),
  };

  return { base_macro, hidden_macro, total_macro };
}

/**
 * Membangun objek CalculatedItem lengkap untuk state review & kalkulasi klien (<16ms).
 */
export function buildCalculatedItem(params: {
  clientId: string;
  food: TkpiFood;
  rawName?: string;
  displayName?: string;
  cookingMethod: CookingMethod;
  portionUnitType?: PortionUnit;
  unitQty?: number;
  explicitGrams?: number;
  confidence?: number;
  referenceObjectFound?: boolean;
}): CalculatedItem {
  const {
    clientId,
    food,
    rawName,
    displayName,
    cookingMethod,
    portionUnitType = food.default_unit_type,
    confidence = 1,
    referenceObjectFound = false,
  } = params;

  const effectiveGramsPerUnit =
    portionUnitType === food.default_unit_type
      ? food.grams_per_unit
      : DEFAULT_UNIT_GRAMS[portionUnitType];

  let grams: number;
  let unitQty: number;

  if (typeof params.explicitGrams === "number" && params.explicitGrams > 0) {
    grams = roundToOneDecimal(params.explicitGrams);
    unitQty =
      typeof params.unitQty === "number" && params.unitQty > 0
        ? roundToOneDecimal(params.unitQty)
        : roundToOneDecimal(grams / effectiveGramsPerUnit);
  } else {
    unitQty =
      typeof params.unitQty === "number" && params.unitQty > 0
        ? roundToOneDecimal(params.unitQty)
        : 1;
    grams = convertPortionToGrams(
      portionUnitType,
      unitQty,
      effectiveGramsPerUnit
    );
  }

  const { base_macro, hidden_macro, total_macro } = calculateFoodMacros({
    food,
    grams,
    cookingMethod,
  });

  return {
    client_id: clientId,
    tkpi_food_id: food.id,
    raw_name: rawName ?? food.name,
    display_name: displayName ?? food.name,
    category: food.category,
    cooking_method: cookingMethod,
    portion_unit_type: portionUnitType,
    unit_qty: unitQty,
    grams_per_unit: effectiveGramsPerUnit,
    grams,
    confidence,
    reference_object_found: referenceObjectFound,
    base_macro,
    hidden_macro,
    total_macro,
    hidden_kcal: hidden_macro.kcal,
    tkpi_reference: food,
  };
}

/**
 * Update porsi 1-tap secara instan di sisi klien tanpa memanggil ulang Vision AI.
 */
export function recalculateItemByUnitQty(
  item: CalculatedItem,
  nextUnitQty: number
): CalculatedItem {
  const safeQty = Math.max(0.1, roundToOneDecimal(nextUnitQty));
  const grams = convertPortionToGrams(
    item.portion_unit_type,
    safeQty,
    item.grams_per_unit
  );
  const { base_macro, hidden_macro, total_macro } = calculateFoodMacros({
    food: item.tkpi_reference,
    grams,
    cookingMethod: item.cooking_method,
  });

  return {
    ...item,
    unit_qty: safeQty,
    grams,
    base_macro,
    hidden_macro,
    total_macro,
    hidden_kcal: hidden_macro.kcal,
  };
}

/**
 * Update metode masak secara instan di sisi klien tanpa memanggil ulang Vision AI.
 */
export function recalculateItemByCookingMethod(
  item: CalculatedItem,
  nextMethod: CookingMethod
): CalculatedItem {
  const { base_macro, hidden_macro, total_macro } = calculateFoodMacros({
    food: item.tkpi_reference,
    grams: item.grams,
    cookingMethod: nextMethod,
  });

  return {
    ...item,
    cooking_method: nextMethod,
    base_macro,
    hidden_macro,
    total_macro,
    hidden_kcal: hidden_macro.kcal,
  };
}

/**
 * Menjumlahkan seluruh item dalam satu piring makan.
 */
export function sumMealMacros(
  items: Pick<CalculatedItem, "total_macro" | "hidden_kcal">[]
): MacroBreakdown & { hidden_kcal: number } {
  let kcal = 0;
  let protein_g = 0;
  let carbs_g = 0;
  let fat_g = 0;
  let hidden_kcal = 0;

  for (const item of items) {
    kcal += item.total_macro.kcal;
    protein_g += item.total_macro.protein_g;
    carbs_g += item.total_macro.carbs_g;
    fat_g += item.total_macro.fat_g;
    hidden_kcal += item.hidden_kcal;
  }

  return {
    kcal: Math.round(kcal),
    protein_g: roundToOneDecimal(protein_g),
    carbs_g: roundToOneDecimal(carbs_g),
    fat_g: roundToOneDecimal(fat_g),
    hidden_kcal: Math.round(hidden_kcal),
  };
}
