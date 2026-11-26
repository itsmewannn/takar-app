"use client";

import * as React from "react";
import { TakaMascot, type TakaMood } from "./TakaMascot";

export const SPLASH_SESSION_KEY = "takar_splash_seen_v1";
export const SPLASH_COMPLETE_EVENT = "takar:splash-complete";
export const TRIGGER_LOADING_EVENT = "takar:trigger-loading";

export interface TriggerLoadingDetail {
  message?: string;
  durationMs?: number;
}

export interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const uid = React.useId().replace(/:/g, "");
  const [visible, setVisible] = React.useState(true);
  const [exiting, setExiting] = React.useState(false);
  const [mascotMood, setMascotMood] = React.useState<TakaMood>("thinking");
  const [microCopy, setMicroCopy] = React.useState(
    "Menyiapkan takaran nutrisimu..."
  );

  const runSequence = React.useCallback(
    (durationMs = 1350, customMessage?: string) => {
      setExiting(false);
      setVisible(true);
      setMascotMood("thinking");
      setMicroCopy(customMessage ?? "Menyiapkan takaran nutrisimu...");

      const tExcited = setTimeout(() => {
        setMascotMood("excited");
      }, Math.round(durationMs * 0.46));

      const tExit = setTimeout(() => {
        setExiting(true);
      }, Math.max(400, durationMs - 280));

      const tDone = setTimeout(() => {
        try {
          sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
        } catch {
          // Abaikan bila sessionStorage dibatasi
        }
        setVisible(false);
        setExiting(false);
        window.dispatchEvent(new CustomEvent(SPLASH_COMPLETE_EVENT));
        onComplete?.();
      }, durationMs);

      return () => {
        clearTimeout(tExcited);
        clearTimeout(tExit);
        clearTimeout(tDone);
      };
    },
    [onComplete]
  );

  // Tampil otomatis setiap aplikasi dibuka (cek sesi) & saat transisi setelah login
  React.useEffect(() => {
    const cleanupInitial = runSequence(1380, "Menyiapkan takaran nutrisimu...");

    const handleCustomTrigger = (evt: Event) => {
      const custom = evt as CustomEvent<TriggerLoadingDetail | undefined>;
      runSequence(
        custom.detail?.durationMs ?? 1250,
        custom.detail?.message ?? "Menyiapkan takaran nutrisimu..."
      );
    };

    window.addEventListener(TRIGGER_LOADING_EVENT, handleCustomTrigger);

    return () => {
      cleanupInitial();
      window.removeEventListener(TRIGGER_LOADING_EVENT, handleCustomTrigger);
    };
  }, [runSequence]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Memuat aplikasi TAKAR"
      className={[
        "fixed inset-0 z-[60] flex items-center justify-center bg-[#EBEEF4] transition-all duration-300 ease-out",
        exiting
          ? "pointer-events-none scale-[1.06] opacity-0"
          : "scale-100 opacity-100",
      ].join(" ")}
    >
      <div className="relative flex h-dvh w-full max-w-[460px] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0FDF4] via-[#F6F8FB] to-[#ECFDF5] px-6">
        {/* Glow Latar Lembut */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"
        />

        {/* Cincin Energi Emerald-Kuning Berputar + Maskot Melompat Halus */}
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg
            viewBox="0 0 180 180"
            className="pointer-events-none absolute inset-0 h-full w-full animate-energy-spin"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`${uid}-energy-ring`}
                x1="16"
                y1="16"
                x2="164"
                y2="164"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="78"
              stroke="#10B981"
              strokeOpacity="0.12"
              strokeWidth="3"
            />
            <circle
              cx="90"
              cy="90"
              r="78"
              stroke={`url(#${uid}-energy-ring)`}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="280 180"
            />
            <circle cx="90" cy="12" r="5" fill="#10B981" />
            <circle cx="168" cy="90" r="4" fill="#FACC15" />
          </svg>

          <svg
            viewBox="0 0 180 180"
            className="pointer-events-none absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] animate-energy-spin-reverse"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="90"
              cy="90"
              r="64"
              stroke="#FACC15"
              strokeOpacity="0.38"
              strokeWidth="2"
              strokeDasharray="12 10"
            />
          </svg>

          <div className="animate-taka-hop">
            <TakaMascot mood={mascotMood} size={112} />
          </div>
        </div>

        {/* Brand & Micro-Copy */}
        <div className="mt-5 animate-taka-slide-up text-center">
          <span className="inline-block text-[26px] font-extrabold tracking-[-0.03em] text-ink">
            TAKAR
          </span>
          <p className="mt-1.5 text-[13px] font-semibold text-emerald-700/85">
            {microCopy}
          </p>
        </div>
      </div>
    </div>
  );
}
