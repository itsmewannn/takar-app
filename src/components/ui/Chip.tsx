import * as React from "react";

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  mono?: boolean;
}

export function Chip({
  active = false,
  mono = false,
  className = "",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type={props.type ?? "button"}
      aria-pressed={active}
      className={[
        "inline-flex h-9 items-center justify-center rounded-xl px-3 text-[12px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emeraldBrand/30",
        active
          ? "bg-emeraldBrand text-white shadow-[0_4px_12px_rgb(27,107,74,0.22)]"
          : "bg-subtle text-ink-secondary hover:bg-slate-200/75 hover:text-ink",
        mono ? "font-mono tabular-nums" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
