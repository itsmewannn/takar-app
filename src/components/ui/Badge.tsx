import * as React from "react";

export interface BadgeProps {
  variant?: "calibrated" | "neutral" | "warning" | "dark";
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  calibrated: "bg-emeraldBrand-soft text-emeraldBrand",
  neutral: "bg-subtle text-ink-secondary",
  warning: "bg-warning-bg text-warning",
  dark: "bg-charcoal/80 text-white backdrop-blur-sm",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold leading-tight",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
