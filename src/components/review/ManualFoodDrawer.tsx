"use client";

import * as React from "react";
import {
  Drumstick,
  Flame,
  Leaf,
  Plus,
  Salad,
  Search,
  Wheat,
  X,
} from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { DEFAULT_TKPI_FOODS } from "@/lib/mock-fallback";
import { COOKING_MODIFIERS } from "@/lib/nutrition-engine";
import { searchTkpiFoods } from "@/lib/tkpi-matcher";
import type {
  CookingMethod,
  FoodCategory,
  TkpiFood,
} from "@/types/nutrition.types";

const CATEGORY_TABS: Array<{ key: FoodCategory | "semua"; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "protein_hewani", label: "Hewani" },
  { key: "protein_nabati", label: "Nabati" },
  { key: "karbo", label: "Karbo" },
  { key: "sayur", label: "Sayur" },
  { key: "sambal_pelengkap", label: "Pelengkap" },
];

function inferDefaultCookingMethod(food: TkpiFood): CookingMethod {
  const lower = `${food.name} ${food.aliases.join(" ")}`.toLowerCase();
  if (lower.includes("orek") || lower.includes("kecap")) return "kecap_manis";
  if (lower.includes("balado")) return "balado";
  if (lower.includes("lodeh")) return "santan";
  if (food.category === "karbo" && food.id.startsWith("nasi"))
    return "kukus_rebus";
  if (food.category === "sayur") return "tumis";
  if (food.id === "perkedel-kentang" || food.id === "bakwan-sayur")
    return "goreng";
  return "kukus_rebus";
}

function FoodCategoryDot({ category }: { category: FoodCategory }) {
  switch (category) {
    case "protein_hewani":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
          <Drumstick className="h-4 w-4" strokeWidth={1.8} />
        </div>
      );
    case "protein_nabati":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
          <Leaf className="h-4 w-4" strokeWidth={1.8} />
        </div>
      );
    case "karbo":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-carbs-soft text-carbs">
          <Wheat className="h-4 w-4" strokeWidth={1.8} />
        </div>
      );
    case "sayur":
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fat-soft text-fat">
          <Salad className="h-4 w-4" strokeWidth={1.8} />
        </div>
      );
    default:
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
          <Flame className="h-4 w-4" strokeWidth={1.8} />
        </div>
      );
  }
}

export interface ManualFoodDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddFood: (food: TkpiFood, cookingMethod: CookingMethod) => void;
}

export function ManualFoodDrawer({
  open,
  onClose,
  onAddFood,
}: ManualFoodDrawerProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<FoodCategory | "semua">(
    "semua"
  );
  const [catalog, setCatalog] = React.useState<TkpiFood[]>(DEFAULT_TKPI_FOODS);
  const [selectedMethod, setSelectedMethod] =
    React.useState<CookingMethod | "auto">("auto");

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/foods")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { foods?: TkpiFood[] } | null) => {
        if (active && data?.foods && data.foods.length > 0) {
          setCatalog(data.foods);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [open]);

  const filteredFoods = React.useMemo(
    () => searchTkpiFoods(query, category, catalog),
    [query, category, catalog]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah lauk manual dari database TKPI"
      className="fixed inset-0 z-40 flex items-end justify-center bg-charcoal/45 backdrop-blur-[2px]"
    >
      <div className="flex max-h-[86dvh] w-full max-w-[460px] flex-col rounded-t-3xl bg-surface shadow-sheet">
        <div className="px-5 pt-3">
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-slate-200"
          />
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink">
                Tambah Lauk TKPI
              </h2>
              <p className="text-[12px] text-ink-secondary">
                Pilih makanan lokal untuk dihitung deterministik
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pencarian lauk"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink-secondary hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-100 px-5 pb-3.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
              strokeWidth={1.8}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari dada ayam, tempe orek, tongkol..."
              className="h-11 w-full rounded-2xl bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/30"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-ink-secondary">
              Cara masak awal
            </span>
            <select
              value={selectedMethod}
              onChange={(e) =>
                setSelectedMethod(e.target.value as CookingMethod | "auto")
              }
              className="h-8 rounded-xl bg-subtle px-3 text-[12px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-emeraldBrand/30"
            >
              <option value="auto">Otomatis sesuai lauk</option>
              {Object.values(COOKING_MODIFIERS).map((mod) => (
                <option key={mod.method_key} value={mod.method_key}>
                  {mod.label}
                </option>
              ))}
            </select>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {CATEGORY_TABS.map((tab) => (
              <Chip
                key={tab.key}
                active={category === tab.key}
                onClick={() => setCategory(tab.key)}
                className="shrink-0"
              >
                {tab.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5 py-2">
          {filteredFoods.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-ink-secondary">
              Tidak ada makanan yang cocok dengan pencarian &ldquo;{query}
              &rdquo;.
            </p>
          ) : (
            filteredFoods.map((food) => {
              const methodToUse =
                selectedMethod === "auto"
                  ? inferDefaultCookingMethod(food)
                  : selectedMethod;

              return (
                <div
                  key={food.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <FoodCategoryDot category={food.category} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {food.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-secondary">
                      <span className="font-semibold text-emeraldBrand">
                        {food.protein_per_100g}g P
                      </span>{" "}
                      • {food.kcal_per_100g} kkal/100g • 1{" "}
                      {food.default_unit_type} ({food.grams_per_unit}g)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddFood(food, methodToUse);
                      onClose();
                    }}
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-emeraldBrand px-3 text-[12px] font-semibold text-white transition-colors hover:bg-emeraldBrand-hover"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>Tambah</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
