"use client";

import * as React from "react";
import { Award, CheckCircle2, Sparkles, X } from "lucide-react";
import { TakaMascot } from "@/components/TakaMascot";
import { EvolutionFlameIcon } from "./StreakBadgeDrawer";
import { Button } from "@/components/ui/Button";
import type { GoalProgramType } from "@/types/database.types";

export interface MonthlyMilestoneModalProps {
  open: boolean;
  monthNumber: number;
  streakDays: number;
  goalProgram: GoalProgramType;
  avgProteinG: number;
  userName?: string;
  isPreview?: boolean;
  onClose: () => void;
}

const PROGRAM_LABELS: Record<GoalProgramType, string> = {
  cutting: "Diet / Cutting",
  rekomposisi: "Rekomposisi Tubuh",
  bulking: "Bulking Bersih",
};

function buildMilestoneCopy(
  goalProgram: GoalProgramType,
  days: number,
  userName?: string
): { headline: string; paragraph1: string; paragraph2: string } {
  const who = userName ? `, ${userName}` : "";

  if (goalProgram === "cutting") {
    return {
      headline: `${days} Hari Menaklukkan Diri Sendiri${who}.`,
      paragraph1:
        "Menjaga defisit kalori selama satu bulan penuh di tengah godaan gorengan dan makanan manis bukan perkara mudah.",
      paragraph2:
        "Setiap porsi protein yang kamu pilih dengan sadar sedang menjaga ototmu tetap utuh. Hari ini, tubuhmu sedang berterima kasih atas disiplinmu.",
    };
  }

  if (goalProgram === "bulking") {
    return {
      headline: `${days} Hari Membangun Fondasi Kuat${who}.`,
      paragraph1:
        "Konsisten memenuhi target protein dan energi bersih hari demi hari membutuhkan komitmen yang jarang dimiliki banyak orang.",
      paragraph2:
        "Setiap gram nutrisi yang kamu takar bukan sekadar angka—melainkan bahan bakar nyata yang sedang membentuk versi terkuat dari tubuhmu.",
    };
  }

  return {
    headline: `${days} Hari Harmoni & Disiplin${who}.`,
    paragraph1:
      "Menjaga keseimbangan kalori dan protein tinggi selama sebulan penuh adalah bukti bahwa hidup sehat sudah menjadi identitas barumu.",
    paragraph2:
      "Perubahan terbaik lahir dari langkah kecil yang diulang setiap hari. Tubuhmu sedang bertransformasi, dan kamu layak bangga hari ini.",
  };
}

const SPARK_PARTICLES = [
  { left: "12%", bottom: "18%", delay: "0ms", color: "bg-amber-300" },
  { left: "24%", bottom: "28%", delay: "450ms", color: "bg-emerald-300" },
  { left: "38%", bottom: "14%", delay: "900ms", color: "bg-cyan-300" },
  { left: "64%", bottom: "22%", delay: "300ms", color: "bg-amber-200" },
  { left: "78%", bottom: "16%", delay: "750ms", color: "bg-emerald-300" },
  { left: "88%", bottom: "30%", delay: "1150ms", color: "bg-purple-300" },
];

export function MonthlyMilestoneModal({
  open,
  monthNumber,
  streakDays,
  goalProgram,
  avgProteinG,
  userName,
  isPreview = false,
  onClose,
}: MonthlyMilestoneModalProps) {
  if (!open) return null;

  const effectiveDays = Math.max(30, streakDays);
  const copy = buildMilestoneCopy(goalProgram, effectiveDays, userName);
  const flameTier = effectiveDays >= 90 ? "gold" : "purple";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Apresiasi Konsistensi Bulan ke-${monthNumber}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D17]/95 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[92dvh] w-full max-w-[420px] flex-col justify-between overflow-y-auto rounded-3xl bg-[#0F172A] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.65)] ring-1 ring-white/12">
        {/* Glow Latar Selebrasi */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emeraldBrand/30 blur-3xl"
        />

        {/* Partikel Selebrasi Halus */}
        {SPARK_PARTICLES.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              left: p.left,
              bottom: p.bottom,
              animationDelay: p.delay,
            }}
            className={`pointer-events-none absolute h-2 w-2 rounded-full ${p.color} animate-milestone-spark`}
          />
        ))}

        {/* Tombol Tutup */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-300/30">
            <Award className="h-3.5 w-3.5" strokeWidth={2} />
            Milestone Bulan Ke-{monthNumber}
            {isPreview ? " (Pratinjau)" : ""}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup apresiasi"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Maskot TAKA Paling Bangga / Berbinar */}
        <div className="relative z-10 mt-4 flex flex-col items-center text-center">
          <div className="animate-taka-pop">
            <TakaMascot mood="excited" size={118} />
          </div>

          {/* Kinetic Staggered Typography */}
          <h2
            style={{ animationDelay: "180ms" }}
            className="animate-kinetic-reveal mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-white"
          >
            {copy.headline}
          </h2>

          <p
            style={{ animationDelay: "520ms" }}
            className="animate-kinetic-reveal mt-3 text-[13.5px] leading-relaxed text-slate-300"
          >
            {copy.paragraph1}
          </p>

          <p
            style={{ animationDelay: "900ms" }}
            className="animate-kinetic-reveal mt-2.5 text-[13.5px] font-medium leading-relaxed text-emerald-200/95"
          >
            {copy.paragraph2}
          </p>
        </div>

        {/* Kartu Ringkasan Pencapaian (Siap Di-Screenshot / Dibagikan) */}
        <div
          style={{ animationDelay: "1220ms" }}
          className="animate-kinetic-reveal relative z-10 mt-5 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/12"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <EvolutionFlameIcon tierKey={flameTier} size={22} />
              <span className="text-[12px] font-bold tracking-wide text-white">
                TAKAR CONSISTENCY BADGE
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-300">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              Verified
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/[0.05] px-2 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Konsistensi
              </p>
              <p className="mt-1 font-mono text-[15px] font-extrabold tabular-nums text-amber-300">
                {effectiveDays} Hari
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.05] px-2 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Program
              </p>
              <p className="mt-1 truncate text-[12.5px] font-bold text-white">
                {PROGRAM_LABELS[goalProgram]}
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.05] px-2 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Rata Protein
              </p>
              <p className="mt-1 font-mono text-[15px] font-extrabold tabular-nums text-emerald-300">
                {Math.round(avgProteinG)}g
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5">
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            <span>Lanjutkan Konsistensi Bulan Berikutnya</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
