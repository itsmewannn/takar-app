import { Flame } from "lucide-react";
import type { MacroBreakdown } from "@/types/nutrition.types";

export interface StickyMacroBarProps {
  summary: MacroBreakdown & { hidden_kcal: number };
  itemCount: number;
}

export function StickyMacroBar({ summary, itemCount }: StickyMacroBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-canvas/95 px-5 py-3 backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-3xl bg-emeraldBrand p-4 text-white shadow-float">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/[0.06]"
        />

        <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">
              Protein
            </p>
            <p className="mt-0.5 font-mono text-[17px] font-bold tabular-nums text-white">
              {summary.protein_g.toFixed(1)}g
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">
              Kalori
            </p>
            <p className="mt-0.5 font-mono text-[17px] font-bold tabular-nums text-white">
              {summary.kcal.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">
              Karbo
            </p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-white/95">
              {summary.carbs_g.toFixed(1)}g
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/75">
              Lemak
            </p>
            <p className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums text-white/95">
              {summary.fat_g.toFixed(1)}g
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-[11px] text-white/85">
          <span className="font-medium">{itemCount} lauk di piring</span>
          <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
            <Flame className="h-3.5 w-3.5 text-amber-200" strokeWidth={1.8} />
            <span>
              Minyak/Bumbu +{summary.hidden_kcal.toLocaleString("id-ID")} kkal
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
