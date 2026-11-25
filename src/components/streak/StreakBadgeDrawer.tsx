"use client";

import * as React from "react";
import { Award, Check, Sparkles, Trophy, X } from "lucide-react";
import {
  formatLocalDateYmd,
  getFlameEvolutionTier,
  type FlameTierKey,
} from "@/lib/body-profile-engine";

export interface EvolutionFlameIconProps {
  tierKey: FlameTierKey;
  size?: number;
  className?: string;
}

/**
 * Ikon SVG Api Evolusi 4 Tingkat (Oranye Hangat, Biru Neon, Ungu Plasma, Emas Hologram).
 */
export function EvolutionFlameIcon({
  tierKey,
  size = 20,
  className = "",
}: EvolutionFlameIconProps) {
  const uid = React.useId().replace(/:/g, "");

  const stops: Record<
    FlameTierKey,
    { outerStart: string; outerEnd: string; inner: string }
  > = {
    ember: {
      outerStart: "#94A3B8",
      outerEnd: "#64748B",
      inner: "#E2E8F0",
    },
    orange: {
      outerStart: "#FBBF24",
      outerEnd: "#EA580C",
      inner: "#FEF3C7",
    },
    blue: {
      outerStart: "#67E8F9",
      outerEnd: "#2563EB",
      inner: "#ECFEFF",
    },
    purple: {
      outerStart: "#E879F9",
      outerEnd: "#7C3AED",
      inner: "#FAE8FF",
    },
    gold: {
      outerStart: "#FDE047",
      outerEnd: "#10B981",
      inner: "#FFFFFF",
    },
  };

  const c = stops[tierKey];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`${tierKey !== "ember" ? "animate-flame-pulse" : ""} ${className}`}
    >
      <defs>
        <linearGradient
          id={`${uid}-flame-outer`}
          x1="16"
          y1="2"
          x2="16"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={c.outerStart} />
          <stop offset="100%" stopColor={c.outerEnd} />
        </linearGradient>
      </defs>
      <path
        d="M16.8 2.6C17.4 7.3 21.8 9.8 23.8 13.7C25.6 17.2 25.1 22.2 22.1 25.4C19.6 28.1 15.8 29.2 12.2 28.2C8.1 27.1 5.6 23.2 6.2 18.8C6.6 15.8 8.6 13.4 9.8 11.2C10.3 13.4 11.7 14.5 11.7 14.5C11.1 10.2 13.4 5.7 16.8 2.6Z"
        fill={`url(#${uid}-flame-outer)`}
      />
      <path
        d="M16.2 12.2C17.2 14.8 19.6 16.2 20.1 18.9C20.6 21.6 18.8 24.5 16 24.9C13.2 25.2 11.2 22.8 11.6 20.1C11.9 17.9 14.4 15.8 16.2 12.2Z"
        fill={c.inner}
        fillOpacity="0.88"
      />
    </svg>
  );
}

export interface StreakBadgeDrawerProps {
  currentStreak: number;
  longestStreak: number;
  streakHistory: string[];
  onPreviewMilestone: () => void;
}

const WEEKDAY_SHORT_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function buildCurrentWeekDays(history: string[]) {
  const historySet = new Set(history);
  const today = new Date();
  const todayYmd = formatLocalDateYmd(today);

  // Hitung Senin pada minggu berjalan (0 = Minggu -> mundur 6 hari)
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return WEEKDAY_SHORT_ID.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const ymd = formatLocalDateYmd(d);
    return {
      label,
      ymd,
      dayNumber: d.getDate(),
      completed: historySet.has(ymd),
      isToday: ymd === todayYmd,
    };
  });
}

const EVOLUTION_TIERS_LIST: Array<{
  key: FlameTierKey;
  range: string;
  name: string;
}> = [
  { key: "orange", range: "Hari 1–6", name: "Api Oranye Hangat" },
  { key: "blue", range: "Hari 7–29", name: "Api Biru Neon" },
  { key: "purple", range: "Hari 30–89", name: "Api Ungu Plasma" },
  { key: "gold", range: "Hari 90+", name: "Api Emas Hologram" },
];

export function StreakBadgeDrawer({
  currentStreak,
  longestStreak,
  streakHistory,
  onPreviewMilestone,
}: StreakBadgeDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const tier = getFlameEvolutionTier(currentStreak);
  const weekDays = React.useMemo(
    () => buildCurrentWeekDays(streakHistory),
    [streakHistory]
  );

  return (
    <>
      {/* Badge Streak Interaktif di Header Dashboard */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Streak konsistensi ${currentStreak} hari. Ketuk untuk rincian.`}
        className={[
          "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 shadow-soft ring-1 transition-transform hover:scale-[1.03] active:scale-95",
          tier.pillBgClass,
          tier.pillTextClass,
          tier.ringClass,
        ].join(" ")}
      >
        <EvolutionFlameIcon tierKey={tier.key} size={19} />
        <span className="font-mono text-[13px] font-extrabold tabular-nums">
          {currentStreak}
        </span>
        <span className="text-[11.5px] font-bold">Hari</span>
      </button>

      {/* Bottom Sheet Detail Streak & Strip 7 Hari */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detail Streak Konsistensi TAKAR"
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/45 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[88dvh] w-full max-w-[460px] flex-col rounded-t-3xl bg-surface shadow-sheet animate-taka-slide-up">
            <div className="px-5 pt-3">
              <div
                aria-hidden="true"
                className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-slate-200"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${tier.pillBgClass} ${tier.pillTextClass}`}
                >
                  {tier.title}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup panel streak"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-ink-secondary hover:text-ink"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 pb-7 pt-2">
              {/* Hero Api & Angka Hari */}
              <div className="flex flex-col items-center rounded-3xl bg-canvas px-4 py-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-soft">
                  <EvolutionFlameIcon tierKey={tier.key} size={52} />
                </div>
                <p className="mt-3 font-mono text-[34px] font-extrabold leading-none tabular-nums text-ink">
                  {currentStreak}{" "}
                  <span className="font-sans text-[18px] font-bold text-ink-secondary">
                    Hari Beruntun
                  </span>
                </p>
                <p className="mt-1.5 max-w-[290px] text-[12.5px] leading-relaxed text-ink-secondary">
                  {tier.subtitle}
                </p>
              </div>

              {/* Strip Indikator 7 Hari (Sen - Min) */}
              <div className="rounded-2xl bg-canvas p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink">
                    Minggu Ini (Sen – Min)
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11.5px] font-semibold tabular-nums text-ink-secondary">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.8} />
                    Rekor: {longestStreak} Hari
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weekDays.map((d) => (
                    <div
                      key={d.ymd}
                      className={[
                        "flex flex-col items-center rounded-xl py-2",
                        d.isToday ? "bg-surface shadow-soft ring-1 ring-emeraldBrand/35" : "",
                      ].join(" ")}
                    >
                      <span className="text-[10.5px] font-semibold text-ink-secondary">
                        {d.label}
                      </span>
                      <div
                        className={[
                          "mt-1.5 flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums",
                          d.completed
                            ? "bg-emeraldBrand text-white shadow-[0_4px_10px_rgb(27,107,74,0.25)]"
                            : "bg-subtle text-ink-secondary",
                        ].join(" ")}
                      >
                        {d.completed ? (
                          <Check className="h-4 w-4" strokeWidth={2.4} />
                        ) : (
                          d.dayNumber
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peta Evolusi Warna Api */}
              <div className="space-y-2">
                <p className="px-1 text-[12px] font-bold text-ink">
                  Tingkat Evolusi Api TAKAR
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EVOLUTION_TIERS_LIST.map((ev) => {
                    const isCurrent = tier.key === ev.key;
                    return (
                      <div
                        key={ev.key}
                        className={[
                          "flex items-center gap-2.5 rounded-2xl p-3",
                          isCurrent
                            ? "bg-charcoal text-white shadow-soft"
                            : "bg-canvas text-ink",
                        ].join(" ")}
                      >
                        <EvolutionFlameIcon tierKey={ev.key} size={24} />
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold">
                            {ev.name}
                          </p>
                          <p
                            className={`font-mono text-[10.5px] ${
                              isCurrent ? "text-white/75" : "text-ink-secondary"
                            }`}
                          >
                            {ev.range}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tombol Testing Pratinjau Apresiasi Bulan 1 */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPreviewMilestone();
                  }}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-subtle px-4 text-[13px] font-bold text-ink transition-colors hover:bg-slate-200/80"
                >
                  <Award className="h-4 w-4 text-emeraldBrand" strokeWidth={1.9} />
                  <span>Lihat Pratinjau Apresiasi Bulan 1</span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
