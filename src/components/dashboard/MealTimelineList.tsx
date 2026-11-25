"use client";

import Link from "next/link";
import { Drumstick, Flame, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MealLogWithItems } from "@/types/database.types";
import type { MealType } from "@/types/nutrition.types";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  sarapan: "Sarapan",
  makan_siang: "Makan Siang",
  makan_malam: "Makan Malam",
  camilan: "Camilan",
};

function formatTimeId(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "--.--";
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isHighOilMeal(meal: MealLogWithItems): boolean {
  const items = meal.meal_items ?? [];
  const totalHiddenKcal = items.reduce(
    (sum, item) => sum + Number(item.hidden_kcal || 0),
    0
  );
  if (totalHiddenKcal >= 90) return true;
  const hasDeepFried = items.some(
    (item) =>
      item.cooking_method === "goreng" ||
      item.cooking_method === "goreng_tepung" ||
      item.cooking_method === "balado" ||
      item.cooking_method === "santan"
  );
  return hasDeepFried && Number(meal.total_protein_g) < 22;
}

export interface MealTimelineListProps {
  meals: MealLogWithItems[];
  onDeleteMeal?: (id: string) => void;
}

export function MealTimelineList({
  meals,
  onDeleteMeal,
}: MealTimelineListProps) {
  if (meals.length === 0) {
    return (
      <EmptyState
        title="Belum ada riwayat makan hari ini"
        description="Mulai scan piring makanmu atau tambahkan lauk manual untuk memantau target protein."
        action={
          <Link
            href="/scan/review?mode=manual"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-subtle px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-slate-200/75"
          >
            <Plus className="h-4 w-4" strokeWidth={1.8} />
            <span>Catat Manual</span>
          </Link>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {meals.map((meal) => {
        const itemNames = (meal.meal_items ?? []).map((i) => i.display_name);
        const summaryLine =
          itemNames.length > 0
            ? itemNames.slice(0, 3).join(", ") +
              (itemNames.length > 3 ? ` +${itemNames.length - 3} lainnya` : "")
            : "Catatan makan";

        const highOil = isHighOilMeal(meal);
        const hiddenSum = (meal.meal_items ?? []).reduce(
          (acc, i) => acc + Number(i.hidden_kcal || 0),
          0
        );

        return (
          <article
            key={meal.id}
            className="flex items-center gap-3.5 py-3.5 first:pt-1 last:pb-1"
          >
            {/* Ikon bulat pastel: hijau untuk tinggi protein, oranye lembut untuk tinggi minyak/gorengan */}
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                highOil
                  ? "bg-terracotta-soft text-terracotta"
                  : "bg-emeraldBrand-soft text-emeraldBrand",
              ].join(" ")}
            >
              {highOil ? (
                <Flame className="h-5 w-5" strokeWidth={1.8} />
              ) : (
                <Drumstick className="h-5 w-5" strokeWidth={1.8} />
              )}
            </div>

            {/* Nama lauk & jam makan di tengah */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-snug text-ink">
                {summaryLine}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-secondary">
                <span className="font-mono tabular-nums">
                  {formatTimeId(meal.logged_at)}
                </span>
                <span>•</span>
                <span>
                  {MEAL_TYPE_LABELS[meal.meal_type] ?? "Makan Harian"}
                </span>
                {hiddenSum > 0 ? (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] tabular-nums text-terracotta">
                      +{hiddenSum} kkal minyak
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Angka tebal rata kanan */}
            <div className="shrink-0 text-right font-mono tabular-nums">
              <p className="text-[15px] font-bold text-emeraldBrand">
                +{Math.round(Number(meal.total_protein_g))}g P
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-ink-secondary">
                {Math.round(Number(meal.total_kcal)).toLocaleString("id-ID")}{" "}
                kkal
              </p>
            </div>

            {onDeleteMeal ? (
              <button
                type="button"
                aria-label="Hapus catatan makan"
                onClick={() => onDeleteMeal(meal.id)}
                className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-subtle hover:text-terracotta"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.7} />
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
