import { roundToOneDecimal } from "./nutrition-engine";
import type {
  ActivityLevelType,
  GenderType,
  GoalProgramType,
  UserProfileRow,
} from "@/types/database.types";

export const ACTIVITY_MULTIPLIERS: Record<
  ActivityLevelType,
  { factor: number; label: string; shortLabel: string }
> = {
  sedentary: {
    factor: 1.2,
    label: "Santai / Duduk Kantoran",
    shortLabel: "Santai",
  },
  light: {
    factor: 1.375,
    label: "Ringan (Olahraga 1-2x/mg)",
    shortLabel: "1-2x/mg",
  },
  moderate: {
    factor: 1.55,
    label: "Aktif (Olahraga 3-4x/mg)",
    shortLabel: "3-4x/mg",
  },
  active: {
    factor: 1.725,
    label: "Intens (Olahraga 5-6x/mg)",
    shortLabel: "5-6x/mg",
  },
};

export interface BodyCalculationResult {
  bmi: number;
  bmiCategory: "Underweight" | "Ideal" | "Overweight" | "Obesitas";
  bmrKcal: number;
  tdeeKcal: number;
  targetKcal: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

/**
 * Kalkulasi deterministik BMI, BMR, TDEE, dan target makronutrisi harian
 * menggunakan rumus klinis Mifflin-St Jeor (100% bebas AI math).
 */
export function calculateBodyMetricsAndTargets(params: {
  gender: GenderType;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevelType;
  goalProgram: GoalProgramType;
}): BodyCalculationResult {
  const safeWeight = Math.min(250, Math.max(30, params.weightKg));
  const safeHeight = Math.min(230, Math.max(120, params.heightCm));
  const safeAge = Math.min(100, Math.max(12, Math.round(params.age)));

  const heightM = safeHeight / 100;
  const bmi = roundToOneDecimal(safeWeight / (heightM * heightM));

  let bmiCategory: BodyCalculationResult["bmiCategory"] = "Ideal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25.0) bmiCategory = "Ideal";
  else if (bmi < 30.0) bmiCategory = "Overweight";
  else bmiCategory = "Obesitas";

  // Mifflin-St Jeor Equation
  const rawBmr =
    params.gender === "pria"
      ? 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5
      : 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge - 161;

  const bmrKcal = Math.round(rawBmr);
  const multiplier =
    ACTIVITY_MULTIPLIERS[params.activityLevel]?.factor ?? 1.55;
  const tdeeKcal = Math.round(rawBmr * multiplier);

  let targetKcal: number;
  let proteinMultiplier: number;
  let fatCalorieShare: number;

  if (params.goalProgram === "cutting") {
    targetKcal = Math.max(1200, tdeeKcal - 350);
    proteinMultiplier = 2.1;
    fatCalorieShare = 0.25;
  } else if (params.goalProgram === "bulking") {
    targetKcal = tdeeKcal + 300;
    proteinMultiplier = 1.9;
    fatCalorieShare = 0.25;
  } else {
    targetKcal = tdeeKcal;
    proteinMultiplier = 2.0;
    fatCalorieShare = 0.27;
  }

  const targetProteinG = Math.max(60, Math.round(safeWeight * proteinMultiplier));
  const targetFatG = Math.max(
    35,
    Math.round((targetKcal * fatCalorieShare) / 9)
  );
  const remainingKcalForCarbs =
    targetKcal - targetProteinG * 4 - targetFatG * 9;
  const targetCarbsG = Math.max(50, Math.round(remainingKcalForCarbs / 4));

  return {
    bmi,
    bmiCategory,
    bmrKcal,
    tdeeKcal,
    targetKcal,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

export type FlameTierKey = "ember" | "orange" | "blue" | "purple" | "gold";

export interface FlameTierInfo {
  key: FlameTierKey;
  title: string;
  subtitle: string;
  nextMilestoneDays: number;
  primaryHex: string;
  secondaryHex: string;
  pillBgClass: string;
  pillTextClass: string;
  ringClass: string;
}

/**
 * Evolusi Warna & Aura Api berdasarkan durasi konsistensi harian:
 * - 0 hari: Belum menyala
 * - 1–6 hari: Api Oranye Hangat (Pemula Konsisten)
 * - 7–29 hari: Api Biru Neon (Ritme Terbentuk)
 * - 30–89 hari: Api Ungu Plasma (Disiplin Bulanan)
 * - 90+ hari: Api Emas Hologram (Elite TAKAR)
 */
export function getFlameEvolutionTier(streakDays: number): FlameTierInfo {
  if (streakDays <= 0) {
    return {
      key: "ember",
      title: "Mulai Konsistensi",
      subtitle: "Catat makan pertamamu hari ini untuk menyalakan api streak!",
      nextMilestoneDays: 7,
      primaryHex: "#94A3B8",
      secondaryHex: "#CBD5E1",
      pillBgClass: "bg-subtle",
      pillTextClass: "text-ink-secondary",
      ringClass: "ring-slate-200",
    };
  }

  if (streakDays <= 6) {
    return {
      key: "orange",
      title: "Pemula Konsisten",
      subtitle: "Api Oranye Hangat • Pertahankan hingga 7 hari untuk Api Biru!",
      nextMilestoneDays: 7,
      primaryHex: "#F97316",
      secondaryHex: "#FBBF24",
      pillBgClass: "bg-orange-50",
      pillTextClass: "text-orange-600",
      ringClass: "ring-orange-300/60",
    };
  }

  if (streakDays <= 29) {
    return {
      key: "blue",
      title: "Ritme Terbentuk",
      subtitle: "Api Biru Neon • Menuju 30 hari untuk Api Ungu Plasma!",
      nextMilestoneDays: 30,
      primaryHex: "#06B6D4",
      secondaryHex: "#3B82F6",
      pillBgClass: "bg-cyan-50",
      pillTextClass: "text-cyan-700",
      ringClass: "ring-cyan-300/70",
    };
  }

  if (streakDays <= 89) {
    const next30 = (Math.floor(streakDays / 30) + 1) * 30;
    return {
      key: "purple",
      title: "Disiplin Bulanan",
      subtitle: "Api Ungu Plasma • Menuju 90 hari untuk Api Emas Hologram!",
      nextMilestoneDays: next30,
      primaryHex: "#8B5CF6",
      secondaryHex: "#E879F9",
      pillBgClass: "bg-violet-50",
      pillTextClass: "text-violet-700",
      ringClass: "ring-violet-300/70",
    };
  }

  const nextMilestone = (Math.floor(streakDays / 30) + 1) * 30;
  return {
    key: "gold",
    title: "Elite TAKAR",
    subtitle: "Api Emas Hologram • Disiplin tingkat tertinggi!",
    nextMilestoneDays: nextMilestone,
    primaryHex: "#F59E0B",
    secondaryHex: "#34D399",
    pillBgClass: "bg-amber-50",
    pillTextClass: "text-amber-700",
    ringClass: "ring-amber-400/75",
  };
}

export function formatLocalDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseYmdToUtcNoon(ymd: string): number {
  const parts = ymd.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return NaN;
  return Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!, 12, 0, 0);
}

export function diffCalendarDays(fromYmd: string, toYmd: string): number {
  const tFrom = parseYmdToUtcNoon(fromYmd);
  const tTo = parseYmdToUtcNoon(toYmd);
  if (Number.isNaN(tFrom) || Number.isNaN(tTo)) return 999;
  return Math.round((tTo - tFrom) / 86_400_000);
}

/**
 * Menghitung pembaruan streak harian saat pengguna mencatat makan hari ini.
 * Syarat bertambah +1: ada minimal 1 log hari ini DAN kalori tidak melampaui >135% target.
 */
export function evaluateStreakProgress(params: {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
  streakHistory: string[];
  todayYmd: string;
  mealsCountToday: number;
  totalKcalToday: number;
  targetKcal: number;
}): {
  current_streak: number;
  longest_streak: number;
  last_logged_date: string | null;
  streak_history: string[];
  didChange: boolean;
} {
  const {
    currentStreak,
    longestStreak,
    lastLoggedDate,
    streakHistory,
    todayYmd,
    mealsCountToday,
    totalKcalToday,
    targetKcal,
  } = params;

  const historySet = new Set(
    Array.isArray(streakHistory) ? streakHistory : []
  );

  // Jika belum catat makan hari ini, periksa apakah streak kemarin sudah hangus (>1 hari terlewat)
  if (mealsCountToday <= 0) {
    if (lastLoggedDate) {
      const gap = diffCalendarDays(lastLoggedDate, todayYmd);
      if (gap > 1 && currentStreak !== 0) {
        return {
          current_streak: 0,
          longest_streak: longestStreak,
          last_logged_date: lastLoggedDate,
          streak_history: Array.from(historySet).slice(-40),
          didChange: true,
        };
      }
    }
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).slice(-40),
      didChange: false,
    };
  }

  // Batas ekstrem kalori > 135% target tidak menambah streak baru
  const withinExtremeLimit = totalKcalToday <= Math.max(1, targetKcal) * 1.35;
  if (!withinExtremeLimit) {
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).slice(-40),
      didChange: false,
    };
  }

  if (lastLoggedDate === todayYmd) {
    if (!historySet.has(todayYmd)) {
      historySet.add(todayYmd);
      return {
        current_streak: Math.max(1, currentStreak),
        longest_streak: Math.max(longestStreak, Math.max(1, currentStreak)),
        last_logged_date: todayYmd,
        streak_history: Array.from(historySet).sort().slice(-40),
        didChange: true,
      };
    }
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).sort().slice(-40),
      didChange: false,
    };
  }

  let nextStreak = 1;
  if (lastLoggedDate) {
    const gap = diffCalendarDays(lastLoggedDate, todayYmd);
    if (gap === 1) {
      nextStreak = currentStreak + 1;
    } else if (gap <= 0) {
      nextStreak = Math.max(1, currentStreak);
    } else {
      nextStreak = 1;
    }
  }

  const nextLongest = Math.max(longestStreak, nextStreak);
  historySet.add(todayYmd);

  return {
    current_streak: nextStreak,
    longest_streak: nextLongest,
    last_logged_date: todayYmd,
    streak_history: Array.from(historySet).sort().slice(-40),
    didChange: true,
  };
}

export function buildDefaultUserProfile(
  userId: string,
  displayName?: string | null
): UserProfileRow {
  const calc = calculateBodyMetricsAndTargets({
    gender: "pria",
    age: 25,
    weightKg: 68,
    heightCm: 170,
    activityLevel: "moderate",
    goalProgram: "rekomposisi",
  });

  return {
    user_id: userId,
    display_name: displayName ?? null,
    gender: "pria",
    age: 25,
    weight_kg: 68,
    height_cm: 170,
    activity_level: "moderate",
    goal_program: "rekomposisi",
    bmi: calc.bmi,
    tdee_kcal: calc.tdeeKcal,
    target_kcal: calc.targetKcal,
    target_protein_g: calc.targetProteinG,
    target_carbs_g: calc.targetCarbsG,
    target_fat_g: calc.targetFatG,
    current_streak: 0,
    longest_streak: 0,
    last_logged_date: null,
    streak_history: [],
    last_celebrated_month: 0,
    onboarding_completed: false,
    updated_at: new Date().toISOString(),
  };
}
