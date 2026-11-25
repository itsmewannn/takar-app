"use client";

import {
  AlertTriangle,
  Drumstick,
  Flame,
  Leaf,
  Minus,
  Plus,
  Salad,
  Wheat,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import {
  COOKING_MODIFIERS,
  PORTION_CHIP_PRESETS,
} from "@/lib/nutrition-engine";
import type {
  CalculatedItem,
  CookingMethod,
  FoodCategory,
} from "@/types/nutrition.types";

export interface DetectedFoodRowProps {
  item: CalculatedItem;
  onChangeUnitQty: (clientId: string, nextQty: number) => void;
  onChangeCookingMethod: (clientId: string, nextMethod: CookingMethod) => void;
  onRemove: (clientId: string) => void;
}

const COOKING_METHOD_LIST = Object.values(COOKING_MODIFIERS);

function CategoryIcon({ category }: { category: FoodCategory }) {
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

export function DetectedFoodRow({
  item,
  onChangeUnitQty,
  onChangeCookingMethod,
  onRemove,
}: DetectedFoodRowProps) {
  const lowConfidence = item.confidence < 0.7;
  const presets = PORTION_CHIP_PRESETS[item.portion_unit_type];
  const stepDelta = item.portion_unit_type === "potong" ? 0.3 : 0.5;

  const hiddenParts: string[] = [];
  if (item.hidden_macro.fat_g > 0) {
    hiddenParts.push(`${item.hidden_macro.fat_g}g L`);
  }
  if (item.hidden_macro.carbs_g > 0) {
    hiddenParts.push(`${item.hidden_macro.carbs_g}g K`);
  }

  return (
    <article
      className={[
        "rounded-2xl bg-surface p-4 shadow-soft transition-shadow",
        lowConfidence ? "ring-1 ring-warning/35" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Baris 1: Ikon Pastel + Nama Lauk + Pilihan Metode Masak + Hapus */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CategoryIcon category={item.category} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-[15px] font-bold leading-snug text-ink">
                {item.display_name}
              </h3>
              {lowConfidence ? (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3" strokeWidth={1.8} />
                  <span>Cek porsi</span>
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 font-mono text-[12px] tabular-nums text-ink-secondary">
              {Math.round(item.grams)}g •{" "}
              <span className="font-semibold text-emeraldBrand">
                +{item.total_macro.protein_g.toFixed(1)}g P
              </span>{" "}
              • {item.total_macro.kcal} kkal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.client_id)}
          aria-label={`Hapus ${item.display_name}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary transition-colors hover:bg-terracotta-soft hover:text-terracotta"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* Pilihan Metode Masak */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-ink-secondary">
          Metode masak
        </span>
        <select
          aria-label={`Metode masak ${item.display_name}`}
          value={item.cooking_method}
          onChange={(e) =>
            onChangeCookingMethod(
              item.client_id,
              e.target.value as CookingMethod
            )
          }
          className="h-8 rounded-xl bg-subtle px-3 text-[12px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-emeraldBrand/30"
        >
          {COOKING_METHOD_LIST.map((mod) => (
            <option key={mod.method_key} value={mod.method_key}>
              {mod.label}
            </option>
          ))}
        </select>
      </div>

      {/* Baris 2: 1-Tap Portion Chips + Stepper */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => {
            const isActive = Math.abs(item.unit_qty - preset.unit_qty) < 0.05;
            return (
              <Chip
                key={preset.label}
                active={isActive}
                mono
                onClick={() => onChangeUnitQty(item.client_id, preset.unit_qty)}
              >
                {preset.label}
              </Chip>
            );
          })}
        </div>

        <div className="inline-flex items-center rounded-xl bg-subtle p-0.5">
          <button
            type="button"
            aria-label="Kurangi porsi"
            onClick={() =>
              onChangeUnitQty(
                item.client_id,
                Math.max(0.2, item.unit_qty - stepDelta)
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface hover:text-ink"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Tambah porsi"
            onClick={() =>
              onChangeUnitQty(item.client_id, item.unit_qty + stepDelta)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Baris 3: Transparansi Base Macro vs Hidden Oil/Sauce Macro */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-3 py-2 font-mono text-[11px] tabular-nums text-ink-secondary">
        <span>
          Bahan dasar: {item.base_macro.kcal} kkal ({item.base_macro.protein_g.toFixed(1)}g P)
        </span>
        {item.hidden_macro.kcal > 0 ? (
          <span className="font-semibold text-terracotta">
            +Minyak/Bumbu {item.hidden_macro.kcal} kkal
            {hiddenParts.length > 0 ? ` (${hiddenParts.join(", ")})` : ""}
          </span>
        ) : (
          <span className="font-medium text-emeraldBrand">
            Tanpa minyak (+0 kkal)
          </span>
        )}
      </div>
    </article>
  );
}
