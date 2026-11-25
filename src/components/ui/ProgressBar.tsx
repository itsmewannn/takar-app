import * as React from "react";

export interface ProgressBarProps {
  value: number;
  max: number;
  tone?: "protein" | "white" | "terracotta" | "carbs" | "fat";
  trackClassName?: string;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  protein: "bg-emeraldBrand",
  white: "bg-white",
  terracotta: "bg-terracotta",
  carbs: "bg-carbs",
  fat: "bg-fat",
};

export function ProgressBar({
  value,
  max,
  tone = "protein",
  trackClassName,
  className = "",
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  const defaultTrack =
    tone === "white" ? "bg-white/20" : "bg-subtle";

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      className={`h-[6px] w-full overflow-hidden rounded-full ${trackClassName ?? defaultTrack} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${TONE_CLASSES[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
