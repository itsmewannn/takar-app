"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { TakaMascot } from "@/components/TakaMascot";

const STEPS = [
  "Membaca skala sendok & piring...",
  "Mengenali jenis lauk & cara masak...",
  "Menghitung nutrisi via tabel TKPI...",
] as const;

export interface AnalyzingStepperProps {
  previewUrl?: string | null;
}

export function AnalyzingStepper({ previewUrl }: AnalyzingStepperProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveIndex(1), 550);
    const t2 = setTimeout(() => setActiveIndex(2), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-canvas p-5">
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="inline-flex rounded-full bg-emeraldBrand-soft px-3 py-1 text-[11px] font-semibold text-emeraldBrand">
            Kalibrasi TKPI
          </span>
          <h1 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-ink">
            Memproses Piringmu
          </h1>
        </div>
        <TakaMascot mood="thinking" size={64} />
      </div>

      <div className="my-auto space-y-4 py-6">
        {previewUrl ? (
          <div className="overflow-hidden rounded-3xl bg-surface p-2 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Foto piring yang sedang dianalisis"
              className="aspect-video w-full rounded-2xl object-cover"
            />
          </div>
        ) : null}

        <div className="divide-y divide-slate-100 rounded-3xl bg-surface px-5 py-2 shadow-soft">
          {STEPS.map((label, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={label} className="flex items-center gap-3.5 py-3.5">
                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-semibold tabular-nums",
                    isDone
                      ? "bg-emeraldBrand text-white"
                      : isCurrent
                        ? "bg-emeraldBrand-soft text-emeraldBrand"
                        : "bg-subtle text-ink-secondary",
                  ].join(" ")}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" strokeWidth={2.2} />
                  ) : isCurrent ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={[
                    "text-[14px]",
                    isCurrent || isDone
                      ? "font-semibold text-ink"
                      : "font-medium text-ink-secondary",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="pb-2 text-center text-[12px] font-medium text-ink-secondary">
        Kalkulasi deterministik tanpa estimasi kalori AI
      </p>
    </div>
  );
}
