import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "charcoal" | "secondary" | "subtle" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-emeraldBrand text-white shadow-[0_8px_20px_rgb(27,107,74,0.2)] hover:bg-emeraldBrand-hover active:scale-[0.99]",
    charcoal:
      "bg-charcoal text-white shadow-soft hover:bg-charcoal-hover active:scale-[0.99]",
    secondary:
      "bg-surface text-ink shadow-soft ring-1 ring-slate-200/70 hover:bg-subtle active:scale-[0.99]",
    subtle:
      "bg-subtle text-ink hover:bg-slate-200/70 active:scale-[0.99]",
    ghost:
      "bg-transparent text-ink-secondary hover:bg-subtle hover:text-ink",
  };

  const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
    md: "h-12 px-4 text-[14px] rounded-2xl gap-2",
    lg: "h-[52px] px-5 text-[15px] rounded-2xl gap-2",
  };

  return (
    <button
      type={props.type ?? "button"}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emeraldBrand/35 disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
      ) : null}
      {children}
    </button>
  );
}
