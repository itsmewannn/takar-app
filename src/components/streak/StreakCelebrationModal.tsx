"use client";

import * as React from "react";
import { Check, Copy, Download, Share2, Sparkles, X } from "lucide-react";
import { TakaFieryMascot } from "./TakaFieryMascot";
import {
  checkSpecialStreakMilestone,
  formatLocalDateYmd,
  getFlameEvolutionTier,
} from "@/lib/body-profile-engine";

export interface StreakCelebrationModalProps {
  open: boolean;
  previousStreak: number;
  streakDays: number;
  streakHistory: string[];
  userName?: string;
  isPreview?: boolean;
  onClose: () => void;
}

const SUNDAY_TO_SATURDAY_LABELS = [
  "Min",
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
];

function buildSundayWeekDays(history: string[], forceTodayActive: boolean) {
  const set = new Set(history);
  const today = new Date();
  const todayYmd = formatLocalDateYmd(today);
  if (forceTodayActive) {
    set.add(todayYmd);
  }

  // Mulai dari Minggu (Sunday = 0) seperti kapsul 7 hari pada referensi Duolingo
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  return SUNDAY_TO_SATURDAY_LABELS.map((label, idx) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + idx);
    const ymd = formatLocalDateYmd(d);
    return {
      label,
      ymd,
      active: set.has(ymd),
      isToday: ymd === todayYmd,
    };
  });
}

/**
 * Menggambar Kartu Streak Estetik ke HTML5 Canvas resolusi tinggi (1080x1350)
 * untuk fitur Unduh PNG / Web Share API.
 */
async function generateShareableCardBlob(params: {
  streakDays: number;
  flameLabel: string;
  monthBadge: string | null;
  primaryHex: string;
  secondaryHex: string;
  userName?: string;
}): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background gelap elegan + radial glow sesuai warna panas api
  ctx.fillStyle = "#0B0F17";
  ctx.fillRect(0, 0, 1080, 1350);

  const glow = ctx.createRadialGradient(540, 460, 40, 540, 460, 560);
  glow.addColorStop(0, `${params.primaryHex}66`);
  glow.addColorStop(0.55, `${params.secondaryHex}22`);
  glow.addColorStop(1, "rgba(11, 15, 23, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1350);

  // Bingkai dalam tipis
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(56, 56, 968, 1238, 56);
  ctx.stroke();

  // Pill atas TAKAR
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.roundRect(350, 128, 380, 64, 32);
  ctx.fill();

  ctx.fillStyle = params.primaryHex;
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    (params.monthBadge ?? params.flameLabel).toUpperCase(),
    540,
    169
  );

  // Lingkaran Simbol Api & Maskot Ikonik di Tengah
  const orbGrad = ctx.createRadialGradient(540, 430, 20, 540, 430, 165);
  orbGrad.addColorStop(0, "#FEF08A");
  orbGrad.addColorStop(0.55, params.primaryHex);
  orbGrad.addColorStop(1, params.secondaryHex);
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(540, 430, 145, 0, Math.PI * 2);
  ctx.fill();

  // Kacamata Visor Ikonik pada Ilustrasi Canvas
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(435, 398, 210, 62, 24);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(462, 412, 66, 34);
  ctx.fillRect(552, 412, 66, 34);

  // Angka Streak Raksasa
  ctx.fillStyle = params.primaryHex;
  ctx.font = "900 176px monospace";
  ctx.fillText(`${params.streakDays}`, 540, 770);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "700 44px system-ui, sans-serif";
  ctx.fillText("HARI STREAK", 540, 838);

  // Kutipan Pencapaian Utama
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "600 40px system-ui, sans-serif";
  const line1 = `Aku sudah jaga makan ${params.streakDays} hari`;
  const line2 = "berturut-turut di TAKAR!";
  ctx.fillText(line1, 540, 965);
  ctx.fillText(line2, 540, 1022);

  if (params.userName) {
    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.fillText(`@${params.userName}`, 540, 1100);
  }

  // Footer Brand TAKAR
  ctx.fillStyle = "#10B981";
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText("TAKAR — Asisten Takaran Nutrisi Harian", 540, 1218);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function StreakCelebrationModal({
  open,
  previousStreak,
  streakDays,
  streakHistory,
  userName,
  isPreview = false,
  onClose,
}: StreakCelebrationModalProps) {
  const targetTier = React.useMemo(
    () => getFlameEvolutionTier(streakDays),
    [streakDays]
  );
  const prevTier = React.useMemo(
    () => getFlameEvolutionTier(Math.max(1, previousStreak)),
    [previousStreak]
  );
  const milestoneInfo = React.useMemo(
    () => checkSpecialStreakMilestone(streakDays),
    [streakDays]
  );

  const isTierUpgrade =
    milestoneInfo.isMilestone && prevTier.key !== targetTier.key;

  const [displayedCount, setDisplayedCount] = React.useState(previousStreak);
  const [displayedTierKey, setDisplayedTierKey] = React.useState(
    isTierUpgrade ? prevTier.key : targetTier.key
  );
  const [burstKey, setBurstKey] = React.useState(0);
  const [shareSheetOpen, setShareSheetOpen] = React.useState(false);
  const [copiedNotice, setCopiedNotice] = React.useState(false);
  const [sharingBusy, setSharingBusy] = React.useState(false);

  // Jalankan sekuens animasi: Tahap 1 Burst & Level-Up -> Tahap 2 Counter Roll N -> N+1
  React.useEffect(() => {
    if (!open) {
      setShareSheetOpen(false);
      return;
    }

    const startVal = Math.max(0, Math.min(previousStreak, streakDays - 1));
    setDisplayedCount(startVal);
    setDisplayedTierKey(
      isTierUpgrade && previousStreak > 0 ? prevTier.key : targetTier.key
    );
    setBurstKey((k) => k + 1);

    const tRoll = setTimeout(() => {
      setDisplayedCount(streakDays);
    }, 480);

    const tUpgradeColor = setTimeout(() => {
      if (isTierUpgrade) {
        setDisplayedTierKey(targetTier.key);
        setBurstKey((k) => k + 1);
      }
    }, 720);

    return () => {
      clearTimeout(tRoll);
      clearTimeout(tUpgradeColor);
    };
  }, [
    open,
    previousStreak,
    streakDays,
    isTierUpgrade,
    prevTier.key,
    targetTier.key,
  ]);

  const activeTier = React.useMemo(
    () =>
      displayedTierKey === targetTier.key
        ? targetTier
        : getFlameEvolutionTier(Math.max(1, previousStreak)),
    [displayedTierKey, targetTier, previousStreak]
  );

  const weekDays = React.useMemo(() => {
    if (isPreview) {
      // Pada mode preview multi-hari, nyalakan hari aktif agar animasi staggered terlihat hidup
      const base = buildSundayWeekDays(streakHistory, true);
      const activeToFill = Math.min(7, Math.max(2, streakDays));
      return base.map((d, idx) => ({
        ...d,
        active: d.active || idx < activeToFill,
      }));
    }
    return buildSundayWeekDays(streakHistory, true);
  }, [streakHistory, isPreview, streakDays]);

  if (!open) return null;

  const shareText = `Aku sudah jaga makan ${streakDays} hari berturut-turut di TAKAR! (${targetTier.flameLabel})`;

  const handleNativeShare = async () => {
    setSharingBusy(true);
    try {
      const blob = await generateShareableCardBlob({
        streakDays,
        flameLabel: targetTier.flameLabel,
        monthBadge: targetTier.monthBadge,
        primaryHex: targetTier.primaryHex,
        secondaryHex: targetTier.secondaryHex,
        userName,
      });

      if (blob && typeof navigator !== "undefined" && navigator.share) {
        const file = new File([blob], `takar-streak-${streakDays}-hari.png`, {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Streak Konsistensi TAKAR",
            text: shareText,
            files: [file],
          });
          return;
        }
        await navigator.share({
          title: "Streak Konsistensi TAKAR",
          text: shareText,
        });
        return;
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `takar-streak-${streakDays}-hari.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Abaikan jika user membatalkan dialog share native
    } finally {
      setSharingBusy(false);
    }
  };

  const handleDownloadCard = async () => {
    setSharingBusy(true);
    try {
      const blob = await generateShareableCardBlob({
        streakDays,
        flameLabel: targetTier.flameLabel,
        monthBadge: targetTier.monthBadge,
        primaryHex: targetTier.primaryHex,
        secondaryHex: targetTier.secondaryHex,
        userName,
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `takar-streak-${streakDays}-hari.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setSharingBusy(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2200);
    } catch {
      // Abaikan bila clipboard tidak tersedia
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Selebrasi ${streakDays} Hari Streak`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F17] text-white"
    >
      <div className="relative flex h-dvh w-full max-w-[460px] flex-col justify-between overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        {/* Ambient Glow Sesuai Warna Tingkat Panas Api */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[28%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-500"
          style={{ backgroundColor: activeTier.glowRgba }}
        />

        {/* Top Bar: Lencana Bulan / Milestone & Tombol Tutup */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ring-1 ring-white/15"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                color: activeTier.primaryHex,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              {activeTier.flameLabel}
            </span>

            {targetTier.monthBadge ? (
              <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10.5px] font-bold text-white">
                {targetTier.monthBadge}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup selebrasi streak"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* ================================================================
            TAHAP 1 & 2: BURST, MASKOT SUPER FIERY & COUNTER ROLLING
            ================================================================ */}
        <div className="relative z-10 my-auto flex flex-col items-center py-4 text-center">
          {/* Banner Transisi Milestone Spesial (10, 30, 60, Bulanan, 365) */}
          {milestoneInfo.isMilestone && milestoneInfo.headline ? (
            <div className="mb-3 animate-taka-pop rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 backdrop-blur-md">
              <p
                className="text-[11.5px] font-extrabold tracking-wide"
                style={{ color: targetTier.coreHex }}
              >
                {milestoneInfo.headline}
              </p>
            </div>
          ) : null}

          {/* Shockwave Burst & Maskot Mode Super Fiery */}
          <div className="relative flex items-center justify-center">
            <div
              key={burstKey}
              aria-hidden="true"
              className="pointer-events-none absolute h-40 w-40 rounded-full border-2 animate-streak-shockwave"
              style={{ borderColor: activeTier.primaryHex }}
            />

            <div
              className="animate-streak-burst transition-transform duration-500"
              style={{
                transform: `scale(${Math.min(1.22, activeTier.flameScale)})`,
              }}
            >
              <TakaFieryMascot
                tierKey={activeTier.key}
                size={182}
                particleCount={activeTier.particleCount}
              />
            </div>
          </div>

          {/* Counter Angka Streak Besar (Spring Roll N -> N+1) */}
          <div className="mt-2">
            <p
              key={displayedCount}
              className="animate-taka-pop font-mono text-[68px] font-black leading-none tracking-tight tabular-nums transition-colors duration-500"
              style={{
                color: activeTier.primaryHex,
                textShadow: `0 8px 32px ${activeTier.glowRgba}`,
              }}
            >
              {displayedCount}
            </p>
            <p className="mt-1.5 text-[19px] font-bold tracking-tight text-slate-200">
              Hari Streak
            </p>
          </div>

          {/* ==============================================================
              TAHAP 3: TRACKER KAPSUL 7 HARI (Min - Sab) STAGGERED ANIMATION
              ============================================================== */}
          <div className="mt-6 w-full max-w-[360px] rounded-2xl border border-white/[0.08] bg-[#141A26] px-4 py-4 shadow-2xl">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {weekDays.map((day, idx) => (
                <div key={day.ymd} className="flex flex-col items-center gap-2">
                  <span
                    className={[
                      "text-[11px] font-bold",
                      day.isToday ? "text-white" : "text-slate-400",
                    ].join(" ")}
                  >
                    {day.label}
                  </span>

                  {day.active ? (
                    <div
                      style={{
                        animationDelay: `${300 + idx * 95}ms`,
                        backgroundColor: activeTier.primaryHex,
                        boxShadow: `0 0 14px ${activeTier.glowRgba}`,
                      }}
                      className="animate-kinetic-reveal flex h-8 w-8 items-center justify-center rounded-full text-[#0B0F17]"
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]">
                      <span className="h-2 w-2 rounded-full bg-white/15" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-3.5 border-t border-white/[0.07] pt-2.5 text-[12px] font-medium text-slate-400">
              {targetTier.subtitle}
            </p>
          </div>
        </div>

        {/* ================================================================
            TAHAP 4: TOMBOL BAGIKAN STREAK & LANJUTKAN
            ================================================================ */}
        <div className="relative z-10 space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => setShareSheetOpen(true)}
            style={{
              background: `linear-gradient(180deg, ${targetTier.primaryHex} 0%, ${targetTier.secondaryHex} 100%)`,
              boxShadow: `0 10px 28px ${targetTier.glowRgba}`,
            }}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold tracking-wide text-[#0B0F17] transition-transform active:scale-[0.99]"
          >
            <Share2 className="h-4 w-4" strokeWidth={2.4} />
            <span>BAGIKAN STREAK</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-white/[0.06] text-[13.5px] font-extrabold tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            LANJUTKAN
          </button>
        </div>
      </div>

      {/* ==================================================================
          BOTTOM SHEET: KARTU STREAK ESTETIK SIAP BAGIKAN / UNDUH
          ================================================================== */}
      {shareSheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bagikan Kartu Streak TAKAR"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShareSheetOpen(false);
          }}
        >
          <div className="w-full max-w-[460px] rounded-t-3xl border-t border-white/15 bg-[#121824] px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-3.5 text-white animate-taka-slide-up">
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-white/20"
            />

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold">Bagikan Pencapaianmu</h3>
              <button
                type="button"
                onClick={() => setShareSheetOpen(false)}
                aria-label="Tutup panel bagikan"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Kartu Streak Estetik Visual */}
            <div
              className="relative overflow-hidden rounded-3xl border border-white/15 p-6 text-center shadow-2xl"
              style={{
                background: `radial-gradient(circle at 50% 24%, ${targetTier.glowRgba} 0%, #0B0F17 78%)`,
              }}
            >
              <span
                className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider"
                style={{ color: targetTier.primaryHex }}
              >
                {targetTier.monthBadge ?? targetTier.flameLabel}
              </span>

              <div className="my-2 flex justify-center">
                <TakaFieryMascot
                  tierKey={targetTier.key}
                  size={126}
                  particleCount={14}
                />
              </div>

              <p
                className="font-mono text-[42px] font-black leading-none tabular-nums"
                style={{ color: targetTier.primaryHex }}
              >
                {streakDays} HARI
              </p>

              <p className="mx-auto mt-2.5 max-w-[290px] text-[15px] font-bold leading-snug text-white">
                &ldquo;Aku sudah jaga makan {streakDays} hari berturut-turut di
                TAKAR!&rdquo;
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 border-t border-white/10 pt-3 text-[11.5px] font-bold text-emerald-400">
                <span>TAKAR — Asisten Takaran Nutrisi Harian</span>
              </div>
            </div>

            {/* Tombol Aksi Share, Download PNG, dan Salin Teks */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={sharingBusy}
                onClick={() => void handleNativeShare()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emeraldBrand text-[13.5px] font-bold text-white transition-colors hover:bg-emeraldBrand-hover disabled:opacity-60"
              >
                <Share2 className="h-4 w-4" strokeWidth={2} />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                disabled={sharingBusy}
                onClick={() => void handleDownloadCard()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 text-[13.5px] font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                <span>Unduh Gambar</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyText()}
              className="mt-2.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-white/[0.05] text-[12.5px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              {copiedNotice ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.2} />
                  <span className="text-emerald-300">Teks Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                  <span>Salin Teks Pencapaian</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
