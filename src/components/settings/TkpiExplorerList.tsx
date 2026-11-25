"use client";

import * as React from "react";
import { Drumstick, Flame, Leaf, Salad, Search, Wheat } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { searchTkpiFoods } from "@/lib/tkpi-matcher";
import type { FoodCategory, TkpiFood } from "@/types/nutrition.types";

const FILTER_OPTIONS: Array<{ key: FoodCategory | "semua"; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "protein_hewani", label: "Hewani" },
  { key: "protein_nabati", label: "Nabati" },
  { key: "karbo", label: "Karbo" },
  { key: "sayur", label: "Sayur" },
  { key: "sambal_pelengkap", label: "Pelengkap" },
];

function CategoryPastelIcon({ category }: { category: FoodCategory }) {
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

export interface TkpiExplorerListProps {
  foods: TkpiFood[];
}

export function TkpiExplorerList({ foods }: TkpiExplorerListProps) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<FoodCategory | "semua">(
    "semua"
  );

  const results = React.useMemo(
    () => searchTkpiFoods(query, category, foods),
    [query, category, foods]
  );

  return (
    <div className="rounded-3xl bg-surface p-5 shadow-soft">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
          strokeWidth={1.8}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari bahan lokal di tabel TKPI..."
          className="h-11 w-full rounded-2xl bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/30"
        />
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.key}
            active={category === opt.key}
            onClick={() => setCategory(opt.key)}
            className="shrink-0"
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {results.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-ink-secondary">
            Tidak ditemukan entri TKPI untuk kata kunci tersebut.
          </p>
        ) : (
          results.map((food) => (
            <div
              key={food.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-2 last:pb-0"
            >
              <CategoryPastelIcon category={food.category} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">
                  {food.name}
                </p>
                <p className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-secondary">
                  1 {food.default_unit_type} ({food.grams_per_unit}g) •{" "}
                  {food.carbs_per_100g}g K • {food.fat_per_100g}g L
                </p>
              </div>

              <div className="shrink-0 text-right font-mono tabular-nums">
                <p className="text-[14px] font-bold text-emeraldBrand">
                  {food.protein_per_100g}g P
                </p>
                <p className="text-[11px] font-medium text-ink-secondary">
                  {food.kcal_per_100g} kkal
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
