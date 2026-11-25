"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, Sparkles, Utensils, X } from "lucide-react";
import { TakaMascot, type TakaMood } from "./TakaMascot";
import {
  SPLASH_COMPLETE_EVENT,
  SPLASH_SESSION_KEY,
} from "./SplashScreen";
import { Button } from "@/components/ui/Button";
import { roundToOneDecimal } from "@/lib/nutrition-engine";
import type { CoachAdviceResponse } from "@/app/api/coach-advice/route";
import type { GoalProgramType } from "@/types/database.types";

export type GoalMode = "Cutting" | "Bulking" | "Rekomposisi";

export interface TakaCoachBotProps {
  userId: string;
  userName?: string;
  goalProgram?: GoalProgramType;
  currentStreak?: number;
  consumedKcal: number;
  targetKcal: number;
  consumedProteinG: number;
  targetProteinG: number;
  hiddenKcal: number;
  mealCount: number;
}

const WELCOME_SHOWN_SESSION_KEY = "takar_welcome_bubble_shown_v1";

export function inferGoalMode(
  targetKcal: number,
  explicitProgram?: GoalProgramType
): GoalMode {
  if (explicitProgram === "cutting") return "Cutting";
  if (explicitProgram === "bulking") return "Bulking";
  if (explicitProgram === "rekomposisi") return "Rekomposisi";
  if (targetKcal <= 1900) return "Cutting";
  if (targetKcal >= 2450) return "Bulking";
  return "Rekomposisi";
}

function getTimeGreeting(date: Date): {
  greeting: string;
  periodLabel: string;
} {
  const h = date.getHours();
  if (h >= 4 && h < 11) {
    return { greeting: "Selamat Pagi", periodLabel: "Pagi" };
  }
  if (h >= 11 && h < 15) {
    return { greeting: "Selamat Siang", periodLabel: "Siang" };
  }
  if (h >= 15 && h < 18) {
    return { greeting: "Selamat Sore", periodLabel: "Sore" };
  }
  return { greeting: "Selamat Malam", periodLabel: "Malam" };
}

interface MoodAnalysis {
  mood: TakaMood;
  badgeLabel: string;
  badgeClassName: string;
  dotClassName: string;
  statusMessage: string;
}

function evaluateNutritionMood(params: {
  goal: GoalMode;
  consumedKcal: number;
  targetKcal: number;
  consumedProteinG: number;
  targetProteinG: number;
  mealCount: number;
  isGreetingWave: boolean;
  isThinking: boolean;
}): MoodAnalysis {
  const {
    goal,
    consumedKcal,
    targetKcal,
    consumedProteinG,
    targetProteinG,
    mealCount,
    isGreetingWave,
    isThinking,
  } = params;

  if (isThinking) {
    return {
      mood: "thinking",
      badgeLabel: "Meracik Menu...",
      badgeClassName: "bg-cyan-50 text-cyan-700",
      dotClassName: "bg-cyan-400",
      statusMessage:
        "Sebentar ya, TAKA sedang mencocokkan sisa protein dan kalorimu dengan menu lokal TKPI...",
    };
  }

  const safeTargetKcal = Math.max(1, targetKcal);
  const safeTargetProtein = Math.max(1, targetProteinG);
  const kcalRatio = consumedKcal / safeTargetKcal;
  const proteinRatio = consumedProteinG / safeTargetProtein;
  const remainingKcal = Math.round(targetKcal - consumedKcal);
  const remainingProtein = roundToOneDecimal(
    Math.max(0, targetProteinG - consumedProteinG)
  );

  // 1. Aturan Cutting: Kalori > 100% -> angry
  if (goal === "Cutting" && kcalRatio > 1.0) {
    return {
      mood: "angry",
      badgeLabel: "Kalori Melewati Batas",
      badgeClassName: "bg-red-50 text-red-600",
      dotClassName: "bg-red-500",
      statusMessage: `Waduh, asupan hari ini lewat ${Math.abs(remainingKcal).toLocaleString("id-ID")} kkal dari batas Cutting! Stop gorengan & minuman manis dulu ya, kita rapikan lagi besok.`,
    };
  }

  // 2. Aturan Cutting: Kalori 85% - 100% -> worried
  if (goal === "Cutting" && kcalRatio >= 0.85 && kcalRatio <= 1.0) {
    return {
      mood: "worried",
      badgeLabel: "Sisa Kalori Tipis",
      badgeClassName: "bg-warning-bg text-warning",
      dotClassName: "bg-amber-500",
      statusMessage: `Hati-hati ya, sisa ruang kalori Cutting tinggal ${Math.max(0, remainingKcal).toLocaleString("id-ID")} kkal. Utamakan lauk kukus, rebus, atau bakar tanpa minyak.`,
    };
  }

  // 3. Target tercapai dengan rapi -> excited
  if (proteinRatio >= 0.95 && kcalRatio <= 1.08) {
    return {
      mood: "excited",
      badgeLabel: "Target Tembus!",
      badgeClassName: "bg-emeraldBrand-soft text-emeraldBrand",
      dotClassName: "bg-emeraldBrand",
      statusMessage: `Keren banget! Target protein ${goal} sudah tercapai dengan kalori yang tetap terkendali rapi.`,
    };
  }

  // 4. Bulking / Rekomposisi: protein < 65% atau kalori masih rendah -> sad / worried
  if (
    (goal === "Bulking" || goal === "Rekomposisi") &&
    (proteinRatio < 0.65 || kcalRatio < 0.6)
  ) {
    if (mealCount === 0 && isGreetingWave) {
      return {
        mood: "happy",
        badgeLabel: `Siap ${goal}`,
        badgeClassName: "bg-emeraldBrand-soft text-emeraldBrand",
        dotClassName: "bg-emeraldBrand",
        statusMessage: `Yuk mulai hari ini dengan porsi protein berkualitas! Kamu punya target ${targetProteinG}g protein (${targetKcal.toLocaleString("id-ID")} kkal).`,
      };
    }

    if (mealCount > 0 && proteinRatio < 0.35) {
      return {
        mood: "sad",
        badgeLabel: "Protein Masih Rendah",
        badgeClassName: "bg-sky-50 text-sky-700",
        dotClassName: "bg-sky-500",
        statusMessage: `Proteinmu baru ${roundToOneDecimal(consumedProteinG)}g nih (kurang ${remainingProtein}g lagi). Yuk tambah dada ayam, ikan, telur, atau tempe biar otot nggak kekurangan bahan bakar!`,
      };
    }

    return {
      mood: "worried",
      badgeLabel: "Kejar Target Protein",
      badgeClassName: "bg-warning-bg text-warning",
      dotClassName: "bg-amber-500",
      statusMessage: `Masih kurang ${remainingProtein}g protein untuk mengunci target ${goal} hari ini. Yuk catat atau siapkan lauk tinggi protein berikutnya!`,
    };
  }

  // 5. Default: Target aman & on-track -> happy
  return {
    mood: "happy",
    badgeLabel: "On-Track Hari Ini",
    badgeClassName: "bg-emeraldBrand-soft text-emeraldBrand",
    dotClassName: "bg-emeraldBrand",
    statusMessage:
      remainingProtein > 0
        ? `Ritme makanmu aman terkendali! Tinggal ${remainingProtein}g protein lagi dengan sisa ruang ${Math.max(0, remainingKcal).toLocaleString("id-ID")} kkal.`
        : `Asupan nutrisi harianmu sudah seimbang dan sesuai jalur ${goal}. Pertahankan!`,
  };
}

export function TakaCoachBot({
  userId,
  userName,
  goalProgram,
  currentStreak = 0,
  consumedKcal,
  targetKcal,
  consumedProteinG,
  targetProteinG,
  hiddenKcal,
  mealCount,
}: TakaCoachBotProps) {
  const [welcomeVisible, setWelcomeVisible] = React.useState(false);
  const [welcomeClosing, setWelcomeClosing] = React.useState(false);
  const [isGreetingWave, setIsGreetingWave] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [loadingAdvice, setLoadingAdvice] = React.useState(false);
  const [adviceData, setAdviceData] =
    React.useState<CoachAdviceResponse | null>(null);
  const [adviceError, setAdviceError] = React.useState<string | null>(null);
  const [greetingMeta, setGreetingMeta] = React.useState<{
    greeting: string;
    periodLabel: string;
  }>({ greeting: "Halo", periodLabel: "Hari ini" });

  const goal = React.useMemo(
    () => inferGoalMode(targetKcal, goalProgram),
    [targetKcal, goalProgram]
  );

  const dismissWelcomeBubble = React.useCallback(() => {
    setWelcomeClosing(true);
    setTimeout(() => {
      setWelcomeVisible(false);
      setWelcomeClosing(false);
      setIsGreetingWave(false);
    }, 260);
  }, []);

  // Tampilkan Welcome Bubble tepat setelah Login/Register atau setelah SplashScreen selesai
  React.useEffect(() => {
    if (!userId) return;
    setGreetingMeta(getTimeGreeting(new Date()));

    let autoHideTimer: ReturnType<typeof setTimeout> | undefined;
    let waveTimer: ReturnType<typeof setTimeout> | undefined;
    const perUserWelcomeKey = `${WELCOME_SHOWN_SESSION_KEY}_${userId}`;

    const triggerWelcome = () => {
      try {
        const forcedAfterLogin =
          sessionStorage.getItem("takar_trigger_welcome_v1") === "1";
        const alreadyShownForUser =
          sessionStorage.getItem(perUserWelcomeKey) === "1";

        if (!forcedAfterLogin && alreadyShownForUser) {
          return;
        }

        sessionStorage.removeItem("takar_trigger_welcome_v1");
        sessionStorage.setItem(perUserWelcomeKey, "1");
      } catch {
        // Lanjutkan meskipun sessionStorage terbatas
      }

      setWelcomeVisible(true);
      setIsGreetingWave(true);

      waveTimer = setTimeout(() => {
        setIsGreetingWave(false);
      }, 2800);

      autoHideTimer = setTimeout(() => {
        dismissWelcomeBubble();
      }, 8000);
    };

    let splashAlreadyDone = false;
    try {
      splashAlreadyDone =
        sessionStorage.getItem(SPLASH_SESSION_KEY) === "1" ||
        sessionStorage.getItem("takar_trigger_welcome_v1") === "1";
    } catch {
      splashAlreadyDone = true;
    }

    if (splashAlreadyDone) {
      const tImmediate = setTimeout(triggerWelcome, 200);
      return () => {
        clearTimeout(tImmediate);
        if (autoHideTimer) clearTimeout(autoHideTimer);
        if (waveTimer) clearTimeout(waveTimer);
      };
    }

    window.addEventListener(SPLASH_COMPLETE_EVENT, triggerWelcome, {
      once: true,
    });

    return () => {
      window.removeEventListener(SPLASH_COMPLETE_EVENT, triggerWelcome);
      if (autoHideTimer) clearTimeout(autoHideTimer);
      if (waveTimer) clearTimeout(waveTimer);
    };
  }, [userId, dismissWelcomeBubble]);

  const moodInfo = React.useMemo(
    () =>
      evaluateNutritionMood({
        goal,
        consumedKcal,
        targetKcal,
        consumedProteinG,
        targetProteinG,
        mealCount,
        isGreetingWave,
        isThinking: loadingAdvice,
      }),
    [
      goal,
      consumedKcal,
      targetKcal,
      consumedProteinG,
      targetProteinG,
      mealCount,
      isGreetingWave,
      loadingAdvice,
    ]
  );

  const welcomeText = React.useMemo(() => {
    const nameSuffix = userName ? `, ${userName}` : "";
    if (mealCount === 0) {
      return `${greetingMeta.greeting}${nameSuffix}! Siap jaga target ${goal} hari ini? Yuk scan makanan pertamamu!`;
    }
    const pct = Math.min(
      999,
      Math.round((consumedProteinG / Math.max(1, targetProteinG)) * 100)
    );
    return `${greetingMeta.greeting}${nameSuffix}! Capaian protein ${goal} kamu sudah ${pct}%. Ketuk TAKA kalau butuh saran lauk!`;
  }, [
    greetingMeta.greeting,
    userName,
    goal,
    mealCount,
    consumedProteinG,
    targetProteinG,
  ]);

  const handleRequestAiAdvice = async () => {
    setLoadingAdvice(true);
    setAdviceError(null);

    try {
      const res = await fetch("/api/coach-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          consumedKcal,
          targetKcal,
          consumedProteinG,
          targetProteinG,
          hiddenKcal,
          mealCount,
          timeOfDay: greetingMeta.periodLabel,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memuat rekomendasi menu saat ini.");
      }

      const data = (await res.json()) as CoachAdviceResponse;
      setAdviceData(data);
    } catch (err) {
      setAdviceError(
        err instanceof Error
          ? err.message
          : "Terjadi kendala jaringan saat meminta saran menu."
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <>
      {/* Floating Mascot Container terikat rapi pada lebar mobile frame 460px */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[460px]">
        <div className="relative h-0 w-full">
          {/* Welcome Speech Bubble */}
          {welcomeVisible && !drawerOpen ? (
            <div
              role="status"
              className={[
                "pointer-events-auto absolute bottom-[88px] right-4 w-[276px] origin-bottom-right rounded-2xl bg-charcoal p-3.5 text-white shadow-[0_14px_34px_rgb(20,23,26,0.22)] transition-all duration-250",
                welcomeClosing
                  ? "translate-y-2 scale-95 opacity-0"
                  : "animate-taka-pop opacity-100",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  TAKA Coach
                </span>
                <button
                  type="button"
                  onClick={dismissWelcomeBubble}
                  aria-label="Tutup pesan sambutan"
                  className="flex h-5 w-5 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/95">
                {welcomeText}
              </p>

              {/* Ekor Speech Bubble mengarah ke maskot */}
              <div
                aria-hidden="true"
                className="absolute -bottom-1.5 right-6 h-3.5 w-3.5 rotate-45 bg-charcoal"
              />
            </div>
          ) : null}

          {/* Floating Mascot Button di Pojok Kanan Bawah */}
          <button
            type="button"
            onClick={() => {
              if (welcomeVisible) dismissWelcomeBubble();
              setDrawerOpen(true);
            }}
            aria-label="Buka asisten nutrisi AI TAKA"
            className="pointer-events-auto group absolute bottom-5 right-4 flex h-[66px] w-[66px] items-center justify-center rounded-full bg-surface shadow-[0_10px_28px_rgb(20,23,26,0.16)] ring-1 ring-slate-200/80 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <TakaMascot mood={moodInfo.mood} size={58} />
            <span
              aria-hidden="true"
              className={`absolute right-1 top-1 h-3 w-3 rounded-full ring-2 ring-white ${moodInfo.dotClassName}`}
            />
          </button>
        </div>
      </div>

      {/* Mini-Drawer AI Coach saat Maskot Diklik */}
      {drawerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panel Asisten AI TAKA"
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/45 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="flex max-h-[86dvh] w-full max-w-[460px] flex-col rounded-t-3xl bg-surface shadow-sheet animate-taka-slide-up">
            {/* Drag Handle & Header */}
            <div className="px-5 pt-3">
              <div
                aria-hidden="true"
                className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-slate-200"
              />

              <div className="flex items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-canvas">
                    <TakaMascot mood={moodInfo.mood} size={60} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ink">
                        TAKA AI Coach
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${moodInfo.badgeClassName}`}
                      >
                        {moodInfo.badgeLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium text-ink-secondary">
                      Mode {goal}
                      {currentStreak > 0 ? ` • Streak ${currentStreak} Hari` : " • Pantauan Real-Time"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Tutup panel TAKA"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary hover:text-ink"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Konten Scrollable */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-1">
              {/* Ringkasan Angka Nutrisi Tabular */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-canvas p-3 text-center">
                  <p className="text-[11px] font-medium text-ink-secondary">
                    Protein
                  </p>
                  <p className="mt-0.5 font-mono text-[14px] font-bold tabular-nums text-emeraldBrand">
                    {roundToOneDecimal(consumedProteinG)}/{targetProteinG}g
                  </p>
                </div>

                <div className="rounded-2xl bg-canvas p-3 text-center">
                  <p className="text-[11px] font-medium text-ink-secondary">
                    Kalori
                  </p>
                  <p className="mt-0.5 font-mono text-[14px] font-bold tabular-nums text-ink">
                    {Math.round(consumedKcal).toLocaleString("id-ID")}/
                    {targetKcal.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-2xl bg-canvas p-3 text-center">
                  <p className="text-[11px] font-medium text-ink-secondary">
                    Minyak
                  </p>
                  <p className="mt-0.5 font-mono text-[14px] font-bold tabular-nums text-terracotta">
                    +{Math.round(hiddenKcal)} kkal
                  </p>
                </div>
              </div>

              {/* Pesan Motivasi Real-Time */}
              <div className="rounded-2xl bg-canvas p-4">
                <p className="text-[13.5px] leading-relaxed text-ink">
                  {adviceData ? adviceData.coach_message : moodInfo.statusMessage}
                </p>
              </div>

              {/* Hasil Rekomendasi Menu AI (TKPI Grounded) */}
              {adviceData ? (
                <div className="space-y-2.5">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-ink-secondary">
                    Rekomendasi Menu Lokal (TKPI)
                  </p>
                  {adviceData.menus.map((menu) => (
                    <div
                      key={menu.title}
                      className="rounded-2xl bg-canvas p-3.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
                            <Utensils className="h-4 w-4" strokeWidth={1.8} />
                          </div>
                          <div>
                            <p className="text-[13.5px] font-bold leading-snug text-ink">
                              {menu.title}
                            </p>
                            <p className="mt-0.5 text-[11.5px] font-medium text-ink-secondary">
                              {menu.portion_note}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right font-mono tabular-nums">
                          <span className="inline-block rounded-full bg-emeraldBrand-soft px-2.5 py-0.5 text-[11px] font-bold text-emeraldBrand">
                            +{menu.protein_g}g P
                          </span>
                          <p className="mt-1 text-[11px] font-medium text-ink-secondary">
                            {menu.kcal} kkal
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-ink-secondary">
                        {menu.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {adviceError ? (
                <p className="rounded-2xl bg-warning-bg px-3.5 py-2.5 text-[12px] font-medium text-warning">
                  {adviceError}
                </p>
              ) : null}

              {/* Tombol Aksi */}
              <div className="space-y-2.5 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loadingAdvice}
                  onClick={() => void handleRequestAiAdvice()}
                >
                  <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                  <span>
                    {adviceData
                      ? "Perbarui Saran Menu AI"
                      : "Minta Saran Menu AI"}
                  </span>
                </Button>

                <Link
                  href="/scan"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-charcoal text-[13.5px] font-semibold text-white transition-colors hover:bg-charcoal-hover"
                >
                  <Camera className="h-4 w-4" strokeWidth={1.8} />
                  <span>Scan Makanan Sekarang</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
