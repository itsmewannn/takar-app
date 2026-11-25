import { ProgressBar } from "@/components/ui/ProgressBar";
import { roundToOneDecimal } from "@/lib/nutrition-engine";

export interface ProteinHeroCardProps {
  consumedProteinG: number;
  targetProteinG: number;
  consumedKcal: number;
  targetKcal: number;
}

function formatIdInt(value: number): string {
  return Math.round(value).toLocaleString("id-ID");
}

export function ProteinHeroCard({
  consumedProteinG,
  targetProteinG,
  consumedKcal,
  targetKcal,
}: ProteinHeroCardProps) {
  const displayConsumed = roundToOneDecimal(consumedProteinG);
  const remainingProtein = roundToOneDecimal(
    Math.max(0, targetProteinG - consumedProteinG)
  );
  const remainingKcal = Math.round(targetKcal - consumedKcal);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-emeraldBrand px-6 py-6 text-white shadow-float">
      {/* Aksen geometris lingkaran transparan halus tanpa gradasi neon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-8 bottom-4 h-16 w-16 rounded-full bg-white/[0.05]"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/95">
          {remainingProtein > 0
            ? `Sisa Target ${remainingProtein}g Protein`
            : "Target Protein Tercapai"}
        </span>

        <div className="mt-3.5 flex items-baseline justify-center gap-1.5 font-mono tabular-nums">
          <span className="text-[40px] font-bold leading-none tracking-tight text-white">
            {displayConsumed}g
          </span>
          <span className="text-[19px] font-medium text-white/70">
            / {targetProteinG}g
          </span>
        </div>

        <p className="mt-1.5 text-[12px] font-medium text-white/75">
          Total Protein Hari Ini
        </p>

        <div className="mt-4 w-full">
          <ProgressBar
            value={consumedProteinG}
            max={targetProteinG}
            tone="white"
            trackClassName="bg-white/20"
          />
        </div>

        <div className="mt-3.5 flex w-full items-center justify-between text-[12px] text-white/85">
          <span className="font-mono tabular-nums">
            Terpakai {formatIdInt(consumedKcal)} kkal
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-white">
            {remainingKcal >= 0
              ? `Sisa ${formatIdInt(remainingKcal)} kkal`
              : `Lewat ${formatIdInt(Math.abs(remainingKcal))} kkal`}
          </span>
        </div>
      </div>
    </section>
  );
}
