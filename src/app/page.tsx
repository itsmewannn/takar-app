"use client";

import * as React from "react";
import Link from "next/link";
import { Droplets, Flame, Plus, Settings, Wheat } from "lucide-react";
import { BottomActionDock } from "@/components/dashboard/BottomActionDock";
import { MealTimelineList } from "@/components/dashboard/MealTimelineList";
import { ProteinGapStrip } from "@/components/dashboard/ProteinGapStrip";
import { ProteinHeroCard } from "@/components/dashboard/ProteinHeroCard";
import { TakaCoachBot } from "@/components/TakaCoachBot";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { roundToOneDecimal } from "@/lib/nutrition-engine";
import type { MealLogWithItems, UserTargetRow } from "@/types/database.types";

const LOCAL_MEALS_CACHE_KEY = "takar_meals_cache_v1";
const LOCAL_TARGET_CACHE_KEY = "takar_target_cache_v1";

const DEFAULT_TARGET: UserTargetRow = {
  id: "default-user",
  daily_kcal: 2200,
  daily_protein_g: 130,
  daily_carbs_g: 250,
  daily_fat_g: 65,
};

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
  const [target, setTarget] = React.useState<UserTargetRow>(DEFAULT_TARGET);
  const [meals, setMeals] = React.useState<MealLogWithItems[]>([]);
  const [todayLabel, setTodayLabel] = React.useState<string>("");

  React.useEffect(() => {
    const now = new Date();
    setTodayLabel(formatIndonesianDate(now));

    try {
      const cachedTarget = localStorage.getItem(LOCAL_TARGET_CACHE_KEY);
      if (cachedTarget) {
        setTarget(JSON.parse(cachedTarget) as UserTargetRow);
      }
      const cachedMeals = localStorage.getItem(LOCAL_MEALS_CACHE_KEY);
      if (cachedMeals) {
        const parsedMeals = JSON.parse(cachedMeals) as MealLogWithItems[];
        setMeals(parsedMeals.filter((m) => isSameLocalDay(m.logged_at, now)));
      }
    } catch {
      // Abaikan bila localStorage tidak tersedia
    }

    let active = true;

    Promise.all([
      fetch("/api/targets").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/meals").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(
        ([targetRes, mealsRes]: [
          { target?: UserTargetRow; source?: string } | null,
          { meals?: MealLogWithItems[]; source?: string } | null,
        ]) => {
          if (!active) return;

          if (targetRes?.target) {
            if (targetRes.source === "supabase") {
              setTarget(targetRes.target);
              localStorage.setItem(
                LOCAL_TARGET_CACHE_KEY,
                JSON.stringify(targetRes.target)
              );
            } else {
              const localRaw = localStorage.getItem(LOCAL_TARGET_CACHE_KEY);
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
            if (mealsRes.source === "supabase" || serverToday.length > 0) {
              const localRaw = localStorage.getItem(LOCAL_MEALS_CACHE_KEY);
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
              localStorage.setItem(
                LOCAL_MEALS_CACHE_KEY,
                JSON.stringify(merged)
              );
            }
          }
        }
      )
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const handleDeleteMeal = async (id: string) => {
    const updated = meals.filter((m) => m.id !== id);
    setMeals(updated);
    try {
      localStorage.setItem(LOCAL_MEALS_CACHE_KEY, JSON.stringify(updated));
    } catch {
      // Abaikan error quota
    }
    await fetch(`/api/meals/${id}`, { method: "DELETE" }).catch(
      () => undefined
    );
  };

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

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-ink">
            Halo, Siap Takar
          </h1>
          <p className="mt-0.5 text-[13px] font-medium text-ink-secondary">
            {todayLabel || "Hari Ini"}
          </p>
        </div>

        <Link
          href="/settings"
          aria-label="Pengaturan target makro dan database TKPI"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Settings className="h-[19px] w-[19px]" strokeWidth={1.8} />
        </Link>
      </header>

      {/* Upper Stack: Hero Card + Dual Dark Action Buttons + Macro Progress Mini-Cards */}
      <div className="space-y-3.5 px-5 pb-5">
        <ProteinHeroCard
          consumedProteinG={totals.protein_g}
          targetProteinG={target.daily_protein_g}
          consumedKcal={totals.kcal}
          targetKcal={target.daily_kcal}
        />

        {/* Dual Dark Charcoal Action Buttons */}
        <BottomActionDock />

        {/* Macro Progress Mini-Cards (Karbohidrat & Lemak + Hidden Oil) */}
        <section className="grid grid-cols-2 gap-3">
          {/* Karbohidrat Mini-Card */}
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

          {/* Lemak & Hidden Oil Mini-Card */}
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

        {/* Indikator Hidden Calories Minyak Hari Ini + Protein Gap Advisor */}
        {totals.hidden_kcal > 0 ? (
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 shadow-soft">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
                <Flame className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-ink">
                Kalori Minyak & Bumbu Hari Ini
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
        consumedKcal={totals.kcal}
        targetKcal={target.daily_kcal}
        consumedProteinG={totals.protein_g}
        targetProteinG={target.daily_protein_g}
        hiddenKcal={totals.hidden_kcal}
        mealCount={meals.length}
      />
    </div>
  );
}
