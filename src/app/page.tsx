"use client";

import * as React from "react";
import Link from "next/link";
import {
  Droplets,
  Flame,
  LogOut,
  Plus,
  Settings,
  Wheat,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { BottomActionDock } from "@/components/dashboard/BottomActionDock";
import { MealTimelineList } from "@/components/dashboard/MealTimelineList";
import { ProteinGapStrip } from "@/components/dashboard/ProteinGapStrip";
import { ProteinHeroCard } from "@/components/dashboard/ProteinHeroCard";
import {
  BodyScannerCard,
  type BodyScannerSaveInput,
} from "@/components/profile/BodyScannerCard";
import { MonthlyMilestoneModal } from "@/components/streak/MonthlyMilestoneModal";
import { StreakBadgeDrawer } from "@/components/streak/StreakBadgeDrawer";
import { TakaCoachBot } from "@/components/TakaCoachBot";
import { TakaMascot } from "@/components/TakaMascot";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  buildDefaultUserProfile,
  evaluateStreakProgress,
  formatLocalDateYmd,
} from "@/lib/body-profile-engine";
import { roundToOneDecimal } from "@/lib/nutrition-engine";
import type {
  MealLogWithItems,
  UserProfileRow,
  UserTargetRow,
} from "@/types/database.types";

const DEFAULT_TARGET: UserTargetRow = {
  id: "default-user",
  daily_kcal: 2200,
  daily_protein_g: 136,
  daily_carbs_g: 235,
  daily_fat_g: 65,
};

const PROGRAM_BADGE_LABELS = {
  cutting: "Program Cutting",
  rekomposisi: "Program Rekomposisi",
  bulking: "Program Bulking",
} as const;

function formatIndonesianDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isSameLocalDay(isoString: string, refDate: Date): boolean {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return false;
  return (
    parsed.getFullYear() === refDate.getFullYear() &&
    parsed.getMonth() === refDate.getMonth() &&
    parsed.getDate() === refDate.getDate()
  );
}

export default function DashboardPage() {
  const { user, getAuthHeaders, signOut } = useAuth();

  const [target, setTarget] = React.useState<UserTargetRow>(DEFAULT_TARGET);
  const [profile, setProfile] = React.useState<UserProfileRow | null>(null);
  const [profileLoaded, setProfileLoaded] = React.useState(false);
  const [meals, setMeals] = React.useState<MealLogWithItems[]>([]);
  const [mealsLoaded, setMealsLoaded] = React.useState(false);
  const [todayLabel, setTodayLabel] = React.useState<string>("");

  // Modal milestone 30/60/90 hari (otomatis & pratinjau testing)
  const [milestoneModal, setMilestoneModal] = React.useState<{
    open: boolean;
    monthNumber: number;
    streakDays: number;
    isPreview: boolean;
  }>({
    open: false,
    monthNumber: 1,
    streakDays: 30,
    isPreview: false,
  });

  const userId = user?.id ?? "";
  const mealsCacheKey = userId ? `takar_meals_v2_${userId}` : "";
  const targetCacheKey = userId ? `takar_target_v2_${userId}` : "";
  const profileCacheKey = userId ? `takar_profile_v2_${userId}` : "";

  React.useEffect(() => {
    if (!userId) return;

    const now = new Date();
    setTodayLabel(formatIndonesianDate(now));

    try {
      const cachedProfile = localStorage.getItem(profileCacheKey);
      if (cachedProfile) {
        const parsedProf = JSON.parse(cachedProfile) as UserProfileRow;
        setProfile(parsedProf);
        setProfileLoaded(true);
      }

      const cachedTarget = localStorage.getItem(targetCacheKey);
      if (cachedTarget) {
        setTarget(JSON.parse(cachedTarget) as UserTargetRow);
      } else {
        setTarget({ ...DEFAULT_TARGET, id: userId, user_id: userId });
      }

      const cachedMeals = localStorage.getItem(mealsCacheKey);
      if (cachedMeals) {
        const parsedMeals = JSON.parse(cachedMeals) as MealLogWithItems[];
        setMeals(parsedMeals.filter((m) => isSameLocalDay(m.logged_at, now)));
      } else {
        setMeals([]);
      }
    } catch {
      // Abaikan bila localStorage tidak tersedia
    }

    let active = true;
    const headers = getAuthHeaders();

    Promise.all([
      fetch("/api/profile", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/targets", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/meals", { headers }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(
        ([profileRes, targetRes, mealsRes]: [
          { profile?: UserProfileRow; source?: string } | null,
          { target?: UserTargetRow; source?: string } | null,
          { meals?: MealLogWithItems[]; source?: string } | null,
        ]) => {
          if (!active) return;

          if (profileRes?.profile) {
            if (profileRes.source === "supabase") {
              setProfile(profileRes.profile);
              localStorage.setItem(
                profileCacheKey,
                JSON.stringify(profileRes.profile)
              );
            } else {
              const localProfRaw = localStorage.getItem(profileCacheKey);
              const resolvedProf = localProfRaw
                ? (JSON.parse(localProfRaw) as UserProfileRow)
                : profileRes.profile;
              setProfile(resolvedProf);
            }
          } else {
            setProfile((prev) => prev ?? buildDefaultUserProfile(userId));
          }
          setProfileLoaded(true);

          if (targetRes?.target) {
            if (targetRes.source === "supabase") {
              setTarget(targetRes.target);
              localStorage.setItem(
                targetCacheKey,
                JSON.stringify(targetRes.target)
              );
            } else {
              const localRaw = localStorage.getItem(targetCacheKey);
              setTarget(
                localRaw
                  ? (JSON.parse(localRaw) as UserTargetRow)
                  : targetRes.target
              );
            }
          }

          if (mealsRes?.meals) {
            const serverToday = mealsRes.meals.filter((m) =>
              isSameLocalDay(m.logged_at, now)
            );
            if (mealsRes.source === "supabase") {
              setMeals(serverToday);
              localStorage.setItem(mealsCacheKey, JSON.stringify(serverToday));
            } else if (serverToday.length > 0) {
              const localRaw = localStorage.getItem(mealsCacheKey);
              const localList = localRaw
                ? (JSON.parse(localRaw) as MealLogWithItems[]).filter((m) =>
                    isSameLocalDay(m.logged_at, now)
                  )
                : [];

              const mapById = new Map<string, MealLogWithItems>();
              for (const m of [...serverToday, ...localList]) {
                mapById.set(m.id, m);
              }
              const merged = Array.from(mapById.values()).sort((a, b) =>
                b.logged_at.localeCompare(a.logged_at)
              );
              setMeals(merged);
              localStorage.setItem(mealsCacheKey, JSON.stringify(merged));
            }
          }
          setMealsLoaded(true);
        }
      )
      .catch(() => {
        if (!active) return;
        setProfile((prev) => prev ?? buildDefaultUserProfile(userId));
        setProfileLoaded(true);
        setMealsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [userId, profileCacheKey, mealsCacheKey, targetCacheKey, getAuthHeaders]);

  const totals = React.useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        const mealHidden = (meal.meal_items ?? []).reduce(
          (sum, item) => sum + Number(item.hidden_kcal || 0),
          0
        );
        return {
          kcal: acc.kcal + Number(meal.total_kcal || 0),
          protein_g: acc.protein_g + Number(meal.total_protein_g || 0),
          carbs_g: acc.carbs_g + Number(meal.total_carbs_g || 0),
          fat_g: acc.fat_g + Number(meal.total_fat_g || 0),
          hidden_kcal: acc.hidden_kcal + mealHidden,
        };
      },
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, hidden_kcal: 0 }
    );
  }, [meals]);

  // Evaluasi otomatis Consistency Streak harian & Milestone kelipatan 30 hari
  React.useEffect(() => {
    if (!userId || !profile || !mealsLoaded) return;

    const todayYmd = formatLocalDateYmd(new Date());
    const result = evaluateStreakProgress({
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      lastLoggedDate: profile.last_logged_date,
      streakHistory: profile.streak_history,
      todayYmd,
      mealsCountToday: meals.length,
      totalKcalToday: totals.kcal,
      targetKcal: target.daily_kcal,
    });

    const nextStreak = result.current_streak;
    const reachedMonth =
      nextStreak >= 30 && nextStreak % 30 === 0
        ? Math.floor(nextStreak / 30)
        : 0;
    const shouldCelebrate =
      reachedMonth > 0 && reachedMonth > profile.last_celebrated_month;

    if (!result.didChange && !shouldCelebrate) return;

    const nextCelebratedMonth = shouldCelebrate
      ? reachedMonth
      : profile.last_celebrated_month;

    const updatedProfile: UserProfileRow = {
      ...profile,
      current_streak: result.current_streak,
      longest_streak: result.longest_streak,
      last_logged_date: result.last_logged_date,
      streak_history: result.streak_history,
      last_celebrated_month: nextCelebratedMonth,
    };

    setProfile(updatedProfile);
    try {
      localStorage.setItem(profileCacheKey, JSON.stringify(updatedProfile));
    } catch {
      // Abaikan error storage
    }

    if (shouldCelebrate) {
      setMilestoneModal({
        open: true,
        monthNumber: reachedMonth,
        streakDays: nextStreak,
        isPreview: false,
      });
    }

    void fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        current_streak: result.current_streak,
        longest_streak: result.longest_streak,
        last_logged_date: result.last_logged_date,
        streak_history: result.streak_history,
        last_celebrated_month: nextCelebratedMonth,
      }),
    }).catch(() => undefined);
  }, [
    userId,
    profile,
    mealsLoaded,
    meals.length,
    totals.kcal,
    target.daily_kcal,
    profileCacheKey,
    getAuthHeaders,
  ]);

  const handleCompleteOnboarding = async (input: BodyScannerSaveInput) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...input,
        display_name: user?.name ?? null,
      }),
    });

    if (!res.ok) return;

    const data = (await res.json()) as {
      profile: UserProfileRow;
      target: Omit<UserTargetRow, "id">;
    };

    const nextTarget: UserTargetRow = {
      id: userId,
      user_id: userId,
      ...data.target,
    };

    setProfile(data.profile);
    setTarget(nextTarget);

    try {
      localStorage.setItem(profileCacheKey, JSON.stringify(data.profile));
      localStorage.setItem(targetCacheKey, JSON.stringify(nextTarget));
      sessionStorage.setItem("takar_trigger_welcome_v1", "1");
    } catch {
      // Abaikan error storage
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    if (mealsCacheKey) {
      try {
        localStorage.setItem(mealsCacheKey, JSON.stringify(updated));
      } catch {
        // Abaikan error quota
      }
    }
    await fetch(`/api/meals/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).catch(() => undefined);
  };

  if (!user) return null;

  // Onboarding Otomatis Pertama Kali Setelah Login dengan 3D Body Scanner
  if (profileLoaded && profile && !profile.onboarding_completed) {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas px-5 pb-10 pt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface shadow-soft">
              <TakaMascot mood="excited" size={50} />
            </div>
            <div>
              <span className="inline-flex rounded-full bg-emeraldBrand-soft px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emeraldBrand">
                Langkah Awal TAKAR
              </span>
              <h1 className="mt-0.5 text-[19px] font-extrabold tracking-[-0.02em] text-ink">
                Kalibrasi Profil Tubuhmu
              </h1>
            </div>
          </div>
        </div>

        <BodyScannerCard
          initialProfile={profile}
          onSave={handleCompleteOnboarding}
          submitLabel="Simpan Profil & Mulai Takar"
        />
      </div>
    );
  }

  const activeGoalProgram = profile?.goal_program ?? "rekomposisi";
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const streakHistory = profile?.streak_history ?? [];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {/* Top Header: Sapaan + Badge Streak Api + Settings + Logout */}
      <header className="flex items-center justify-between gap-2 px-5 pb-3 pt-5">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-bold tracking-[-0.02em] text-ink">
            Halo, {user.name}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
            <span>{todayLabel || "Hari Ini"}</span>
            {profile?.onboarding_completed ? (
              <>
                <span>•</span>
                <Link
                  href="/profile"
                  className="font-semibold text-emeraldBrand hover:underline"
                >
                  {PROGRAM_BADGE_LABELS[activeGoalProgram]}
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <StreakBadgeDrawer
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            streakHistory={streakHistory}
            onPreviewMilestone={() =>
              setMilestoneModal({
                open: true,
                monthNumber: Math.max(1, Math.floor(currentStreak / 30) || 1),
                streakDays: Math.max(30, currentStreak),
                isPreview: true,
              })
            }
          />

          <Link
            href="/settings"
            aria-label="Pengaturan target makro dan database TKPI"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Keluar dari akun TAKAR"
            title="Keluar Akun"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-secondary shadow-soft transition-colors hover:text-terracotta active:scale-95"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Upper Stack: Hero Card + Dual Dark Action Buttons + Macro Progress Mini-Cards */}
      <div className="space-y-3.5 px-5 pb-5">
        <ProteinHeroCard
          consumedProteinG={totals.protein_g}
          targetProteinG={target.daily_protein_g}
          consumedKcal={totals.kcal}
          targetKcal={target.daily_kcal}
        />

        {/* Dual Dark Charcoal Action Buttons: Scan Makanan & Profil Tubuh */}
        <BottomActionDock />

        {/* Macro Progress Mini-Cards (Karbohidrat & Lemak) */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-3.5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-carbs-soft text-carbs">
                <Wheat className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-ink-secondary">
                  Karbohidrat
                </p>
                <p className="font-mono text-[14px] font-bold tabular-nums text-ink">
                  {roundToOneDecimal(totals.carbs_g)}
                  <span className="text-[12px] font-normal text-ink-secondary">
                    /{target.daily_carbs_g}g
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={totals.carbs_g}
                max={target.daily_carbs_g}
                tone="carbs"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-3.5 shadow-soft">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fat-soft text-fat">
                <Droplets className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-ink-secondary">
                  Lemak
                </p>
                <p className="font-mono text-[14px] font-bold tabular-nums text-ink">
                  {roundToOneDecimal(totals.fat_g)}
                  <span className="text-[12px] font-normal text-ink-secondary">
                    /{target.daily_fat_g}g
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={totals.fat_g}
                max={target.daily_fat_g}
                tone="fat"
              />
            </div>
          </div>
        </section>

        {totals.hidden_kcal > 0 ? (
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-soft">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                <Flame className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-ink">
                Kalori Minyak &amp; Bumbu Hari Ini
              </span>
            </div>
            <span className="font-mono text-[13px] font-bold tabular-nums text-terracotta">
              +{Math.round(totals.hidden_kcal).toLocaleString("id-ID")} kkal
            </span>
          </div>
        ) : null}

        <ProteinGapStrip
          consumedProteinG={totals.protein_g}
          targetProteinG={target.daily_protein_g}
        />
      </div>

      {/* Riwayat Makan — White Sheet Style */}
      <section className="mt-auto flex-1 rounded-t-3xl bg-surface px-5 pb-24 pt-3.5 shadow-sheet">
        <div
          aria-hidden="true"
          className="mx-auto mb-3.5 h-1.5 w-11 rounded-full bg-slate-200/90"
        />

        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
              Riwayat Hari Ini
            </h2>
          </div>

          <Link
            href="/scan/review?mode=manual"
            className="inline-flex h-8 items-center gap-1 rounded-full bg-subtle px-3 text-[12px] font-semibold text-ink transition-colors hover:bg-slate-200/80"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Manual</span>
          </Link>
        </div>

        <MealTimelineList meals={meals} onDeleteMeal={handleDeleteMeal} />
      </section>

      {/* Floating AI Mascot Coach & Welcome Message */}
      <TakaCoachBot
        userId={user.id}
        userName={user.name}
        goalProgram={activeGoalProgram}
        currentStreak={currentStreak}
        consumedKcal={totals.kcal}
        targetKcal={target.daily_kcal}
        consumedProteinG={totals.protein_g}
        targetProteinG={target.daily_protein_g}
        hiddenKcal={totals.hidden_kcal}
        mealCount={meals.length}
      />

      {/* Modal Selebrasi & Apresiasi Bulanan (30/60/90 Hari + Mode Pratinjau) */}
      <MonthlyMilestoneModal
        open={milestoneModal.open}
        monthNumber={milestoneModal.monthNumber}
        streakDays={milestoneModal.streakDays}
        goalProgram={activeGoalProgram}
        avgProteinG={
          totals.protein_g > 0 ? totals.protein_g : target.daily_protein_g
        }
        userName={user.name}
        isPreview={milestoneModal.isPreview}
        onClose={() =>
          setMilestoneModal((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}
