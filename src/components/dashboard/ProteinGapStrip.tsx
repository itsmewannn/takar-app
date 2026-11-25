import { CheckCircle2, Sparkles } from "lucide-react";
import { buildProteinGapAdvice } from "@/lib/protein-advisor";

export interface ProteinGapStripProps {
  consumedProteinG: number;
  targetProteinG: number;
}

export function ProteinGapStrip({
  consumedProteinG,
  targetProteinG,
}: ProteinGapStripProps) {
  const advice = buildProteinGapAdvice({
    consumedProteinG,
    targetProteinG,
  });

  return (
    <section className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-soft">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
        {advice.is_met ? (
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />
        ) : (
          <Sparkles className="h-5 w-5" strokeWidth={1.8} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-secondary">
          Saran Protein Lokal
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-ink">
          {advice.headline}
        </p>
      </div>
    </section>
  );
}
