import { roundToOneDecimal } from "./nutrition-engine";

export interface ProteinGapAdvice {
  deficit_g: number;
  is_met: boolean;
  headline: string;
  suggestions: Array<{
    label: string;
    protein_g: number;
    kcal: number;
  }>;
}

/**
 * Menghitung kekurangan protein harian dan merangkai saran konkret berbasis makanan lokal TKPI.
 * Gaya bahasa: Warm Editorial Utilitarian (ringkas, membumi, tanpa emoji).
 */
export function buildProteinGapAdvice(params: {
  consumedProteinG: number;
  targetProteinG: number;
}): ProteinGapAdvice {
  const deficit = roundToOneDecimal(
    Math.max(0, params.targetProteinG - params.consumedProteinG)
  );

  if (deficit <= 0) {
    return {
      deficit_g: 0,
      is_met: true,
      headline:
        "Target protein harian tercapai. Pertahankan porsi lauk bersih untuk sisa hari ini.",
      suggestions: [],
    };
  }

  // Kecil: <= 15g protein
  if (deficit <= 15) {
    const eggsNeeded = deficit <= 8 ? 1 : 2;
    const eggProtein = roundToOneDecimal(eggsNeeded * 6.9);
    const eggKcal = Math.round(eggsNeeded * 85);

    return {
      deficit_g: deficit,
      is_met: false,
      headline: `Kurang ${deficit}g protein — ${eggsNeeded} butir telur rebus (+${eggProtein}g P) atau 2 potong tempe kukus (+19g P) cukup buat nutup target.`,
      suggestions: [
        {
          label: `${eggsNeeded} butir telur rebus`,
          protein_g: eggProtein,
          kcal: eggKcal,
        },
        {
          label: "2 potong tempe panggang (100g)",
          protein_g: 19.0,
          kcal: 193,
        },
      ],
    };
  }

  // Sedang: 15.1g - 38g protein (sesuai contoh DESIGN_SYSTEM.md & PRD F5)
  if (deficit <= 38) {
    return {
      deficit_g: deficit,
      is_met: false,
      headline: `Kurang ${deficit}g protein — 1 dada ayam bakar (+31g P) atau 2 telur rebus + 2 potong tempe (+32.8g P) cukup buat nutup target.`,
      suggestions: [
        {
          label: "1 potong dada ayam bakar (100g)",
          protein_g: 31.0,
          kcal: 165,
        },
        {
          label: "2 butir telur rebus + 100g tempe",
          protein_g: 32.8,
          kcal: 364,
        },
        {
          label: "2 potong ikan tongkol pindang (150g)",
          protein_g: 36.0,
          kcal: 203,
        },
      ],
    };
  }

  // Besar: > 38g protein — bagi ke 1-2 sesi makan lokal
  const chickenPortions = deficit > 65 ? "2 potong" : "1.5 potong";
  const chickenGrams = deficit > 65 ? 200 : 150;
  const chickenProtein = roundToOneDecimal((chickenGrams / 100) * 31);
  const chickenKcal = Math.round((chickenGrams / 100) * 165);

  return {
    deficit_g: deficit,
    is_met: false,
    headline: `Kurang ${deficit}g protein — bagi ke makan berikutnya: ${chickenPortions} dada ayam bakar (+${chickenProtein}g P) ditambah tahu/tempe pendamping.`,
    suggestions: [
      {
        label: `${chickenPortions} dada ayam bakar (${chickenGrams}g)`,
        protein_g: chickenProtein,
        kcal: chickenKcal,
      },
      {
        label: "1 porsi ikan kembung bakar + 2 potong tempe",
        protein_g: 37.1,
        kcal: 299,
      },
    ],
  };
}
