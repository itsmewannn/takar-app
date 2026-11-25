"use client";

import * as React from "react";
import { TakaMascot, type TakaMood } from "./TakaMascot";

export const SPLASH_SESSION_KEY = "takar_splash_seen_v1";
export const SPLASH_COMPLETE_EVENT = "takar:splash-complete";

export interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const [mascotMood, setMascotMood] = React.useState<TakaMood>("thinking");
  const [progressPct, setProgressPct] = React.useState(10);

  React.useEffect(() => {
    try {
      const alreadySeen = sessionStorage.getItem(SPLASH_SESSION_KEY);
      if (alreadySeen === "1") {
        onComplete?.();
        return;
      }
    } catch {
      onComplete?.();
      return;
    }

    setVisible(true);

    // Jalankan animasi progress bar & transisi mood thinking -> happy
    const tProgressStart = setTimeout(() => {
      setProgressPct(100);
    }, 60);

    const tMoodHappy = setTimeout(() => {
      setMascotMood("happy");
    }, 700);

    const tStartExit = setTimeout(() => {
      setExiting(true);
    }, 1320);

    const tFinish = setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      } catch {
        // Abaikan bila sessionStorage dibatasi
      }
      setVisible(false);
      window.dispatchEvent(new CustomEvent(SPLASH_COMPLETE_EVENT));
      onComplete?.();
    }, 1620);

    return () => {
      clearTimeout(tProgressStart);
      clearTimeout(tMoodHappy);
      clearTimeout(tStartExit);
      clearTimeout(tFinish);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Memuat aplikasi TAKAR"
      className={[
        "fixed inset-0 z-50 flex items-center justify-center bg-[#EBEEF4] transition-all duration-300 ease-out",
        exiting ? "pointer-events-none scale-[1.04] opacity-0" : "scale-100 opacity-100",
      ].join(" ")}
    >
      <div className="relative flex h-dvh w-full max-w-[460px] flex-col items-center justify-center overflow-hidden bg-canvas px-6">
        {/* Lingkaran dekorasi lembut khas gaya Modern Fintech */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emeraldBrand/[0.05]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-300/10"
        />

        {/* Maskot muncul dengan pop-in + bounce lembut */}
        <div className="animate-taka-pop">
          <TakaMascot mood={mascotMood} size={138} />
        </div>

        {/* Teks logo TAKAR slide-up */}
        <div
          className="mt-4 animate-taka-slide-up text-center"
          style={{ animationDelay: "120ms", animationFillMode: "both" }}
        >
          <span className="inline-block text-[28px] font-extrabold tracking-[-0.03em] text-ink">
            TAKAR
          </span>
          <p className="mt-1 text-[13px] font-medium text-ink-secondary">
            Kalibrasi Protein &amp; Makro Makanan Lokal
          </p>
        </div>

        {/* Progress bar tipis minimalis */}
        <div className="mt-7 w-40 overflow-hidden rounded-full bg-subtle h-[5px]">
          <div
            className="h-full rounded-full bg-emeraldBrand transition-all duration-[1200ms] ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
