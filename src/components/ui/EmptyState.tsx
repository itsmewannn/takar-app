import * as React from "react";
import { Utensils } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-canvas/70 px-5 py-9 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
        {icon ?? <Utensils className="h-5 w-5" strokeWidth={1.7} />}
      </div>
      <p className="text-[15px] font-semibold leading-snug text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-[270px] text-[13px] leading-relaxed text-ink-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
