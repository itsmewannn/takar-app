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

export type FlameTierKey =
  | "ember"
  | "yellow"
  | "orange"
  | "red"
  | "blue"
  | "green";

export interface FlameTierInfo {
  key: FlameTierKey;
  title: string;
  flameLabel: string;
  subtitle: string;
  monthBadge: string | null;
  nextMilestoneDays: number;
  primaryHex: string;
  secondaryHex: string;
  coreHex: string;
  glowRgba: string;
  pillBgClass: string;
  pillTextClass: string;
  ringClass: string;
  flameScale: number;
  particleCount: number;
}

/**
 * Sistem Evolusi Warna "Panas Api" TAKAR (10, 30, 60, Bulanan, hingga 365+ Hari):
 * - 0 hari: Belum menyala (Ember)
 * - 1 – 9 hari: Api Kuning (#FACC15 / #FEF08A) — nyala hangat & stabil
 * - 10 – 29 hari: Api Oren (#F97316 / #FB923C) — nyala lebih besar & percikan aktif
 * - 30 – 59 hari: Api Merah (#EF4444 / #DC2626) — api merah membara + heat glow (Bulan ke-1)
 * - 60 – 364 hari: Api Biru (#3B82F6 / #38BDF8) — api biru plasma + lencana Bulan ke-2..11
 * - 365+ hari: Api Hijau (#10B981 / #34D399) — api hijau legendaris Ultimate TAKAR
 */
export function getFlameEvolutionTier(streakDays: number): FlameTierInfo {
  if (streakDays <= 0) {
    return {
      key: "ember",
      title: "Mulai Streak",
      flameLabel: "Bara Awal",
      subtitle: "Catat makanan pertamamu hari ini untuk menyalakan Api Kuning!",
      monthBadge: null,
      nextMilestoneDays: 10,
      primaryHex: "#94A3B8",
      secondaryHex: "#CBD5E1",
      coreHex: "#F1F5F9",
      glowRgba: "rgba(148, 163, 184, 0.22)",
      pillBgClass: "bg-subtle",
      pillTextClass: "text-ink-secondary",
      ringClass: "ring-slate-200",
      flameScale: 0.92,
      particleCount: 0,
    };
  }

  if (streakDays <= 9) {
    const progressBoost = (streakDays - 1) * 0.012;
    return {
      key: "yellow",
      title: "Tahap Awal",
      flameLabel: "Api Kuning Hangat",
      subtitle: `${10 - streakDays} hari lagi menuju Milestone 10 Hari (Api Oren)!`,
      monthBadge: null,
      nextMilestoneDays: 10,
      primaryHex: "#FACC15",
      secondaryHex: "#EAB308",
      coreHex: "#FEF08A",
      glowRgba: "rgba(250, 204, 21, 0.45)",
      pillBgClass: "bg-yellow-50",
      pillTextClass: "text-amber-700",
      ringClass: "ring-yellow-400/65",
      flameScale: 1.0 + progressBoost,
      particleCount: 6 + Math.floor(streakDays / 2),
    };
  }

  if (streakDays <= 29) {
    const progressBoost = (streakDays - 10) * 0.005;
    return {
      key: "orange",
      title: "Milestone 10+ Hari",
      flameLabel: "Api Oren Aktif",
      subtitle: `${30 - streakDays} hari lagi menuju Milestone 1 Bulan (Api Merah)!`,
      monthBadge: null,
      nextMilestoneDays: 30,
      primaryHex: "#F97316",
      secondaryHex: "#EA580C",
      coreHex: "#FED7AA",
      glowRgba: "rgba(249, 115, 22, 0.52)",
      pillBgClass: "bg-orange-50",
      pillTextClass: "text-orange-600",
      ringClass: "ring-orange-400/70",
      flameScale: 1.09 + progressBoost,
      particleCount: 12 + Math.floor((streakDays - 10) / 4),
    };
  }

  if (streakDays <= 59) {
    const progressBoost = (streakDays - 30) * 0.003;
    return {
      key: "red",
      title: "Milestone 1 Bulan",
      flameLabel: "Api Merah Membara",
      subtitle: `${60 - streakDays} hari lagi menuju Milestone 2 Bulan (Api Biru Plasma)!`,
      monthBadge: "Bulan ke-1",
      nextMilestoneDays: 60,
      primaryHex: "#EF4444",
      secondaryHex: "#DC2626",
      coreHex: "#FECACA",
      glowRgba: "rgba(239, 68, 68, 0.58)",
      pillBgClass: "bg-red-50",
      pillTextClass: "text-red-600",
      ringClass: "ring-red-400/70",
      flameScale: 1.18 + progressBoost,
      particleCount: 18,
    };
  }

  if (streakDays <= 364) {
    const monthNum = Math.floor(streakDays / 30);
    const nextMonthDays = Math.min(365, (monthNum + 1) * 30);
    const extraParticles = Math.min(10, (monthNum - 2) * 2);
    return {
      key: "blue",
      title: `Disiplin Bulan ke-${monthNum}`,
      flameLabel: "Api Biru Plasma",
      subtitle:
        nextMonthDays === 365
          ? `${365 - streakDays} hari lagi menuju 1 Tahun (Api Hijau Ultimate)!`
          : `${nextMonthDays - streakDays} hari lagi menuju Lencana Bulan ke-${monthNum + 1}!`,
      monthBadge: `Bulan ke-${monthNum}`,
      nextMilestoneDays: nextMonthDays,
      primaryHex: "#3B82F6",
      secondaryHex: "#0284C7",
      coreHex: "#BAE6FD",
      glowRgba: "rgba(56, 189, 248, 0.62)",
      pillBgClass: "bg-sky-50",
      pillTextClass: "text-blue-600",
      ringClass: "ring-sky-400/75",
      flameScale: Math.min(1.3, 1.24 + (monthNum - 2) * 0.01),
      particleCount: 22 + extraParticles,
    };
  }

  const years = Math.floor(streakDays / 365);
  return {
    key: "green",
    title: "Ultimate TAKAR",
    flameLabel: "Api Hijau Legendaris",
    subtitle: `Legenda Konsistensi ${years} Tahun+ • Tingkat Panas Tertinggi TAKAR!`,
    monthBadge: `${years} Tahun+ Elite`,
    nextMilestoneDays: (Math.floor(streakDays / 30) + 1) * 30,
    primaryHex: "#10B981",
    secondaryHex: "#047857",
    coreHex: "#A7F3D0",
    glowRgba: "rgba(16, 185, 129, 0.68)",
    pillBgClass: "bg-emerald-50",
    pillTextClass: "text-emerald-700",
    ringClass: "ring-emerald-400/80",
    flameScale: 1.34,
    particleCount: 32,
  };
}

/**
 * Mendeteksi apakah hari streak baru tepat menyentuh milestone spesial kenaikan level api.
 */
export function checkSpecialStreakMilestone(streakDays: number): {
  isMilestone: boolean;
  headline: string | null;
} {
  if (streakDays === 10) {
    return {
      isMilestone: true,
      headline: "API NAIK LEVEL! 10 Hari — Api Oren Aktif",
    };
  }
  if (streakDays === 30) {
    return {
      isMilestone: true,
      headline: "API NAIK LEVEL! 30 Hari — Api Merah Membara",
    };
  }
  if (streakDays === 60) {
    return {
      isMilestone: true,
      headline: "API NAIK LEVEL! 60 Hari — Api Biru Plasma",
    };
  }
  if (streakDays === 365) {
    return {
      isMilestone: true,
      headline: "ULTIMATE LEVEL! 365 Hari — Api Hijau Legendaris",
    };
  }
  if (streakDays > 60 && streakDays < 365 && streakDays % 30 === 0) {
    const m = Math.floor(streakDays / 30);
    return {
      isMilestone: true,
      headline: `MILESTONE BULAN KE-${m}! ${streakDays} Hari Api Biru Plasma`,
    };
  }
  if (streakDays > 365 && streakDays % 30 === 0) {
    const m = Math.floor(streakDays / 30);
    return {
      isMilestone: true,
      headline: `ELITE BULAN KE-${m}! ${streakDays} Hari Api Hijau Legendaris`,
    };
  }
  return { isMilestone: false, headline: null };
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
  didIncrementToday: boolean;
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
          didIncrementToday: false,
        };
      }
    }
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).slice(-40),
      didChange: false,
      didIncrementToday: false,
    };
  }

  const withinExtremeLimit = totalKcalToday <= Math.max(1, targetKcal) * 1.35;
  if (!withinExtremeLimit) {
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).slice(-40),
      didChange: false,
      didIncrementToday: false,
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
        didIncrementToday: false,
      };
    }
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_logged_date: lastLoggedDate,
      streak_history: Array.from(historySet).sort().slice(-40),
      didChange: false,
      didIncrementToday: false,
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
    didIncrementToday: true,
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
