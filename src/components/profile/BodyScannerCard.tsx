"use client";

import * as React from "react";
import {
  Activity,
  Check,
  Flame,
  Scale,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ACTIVITY_MULTIPLIERS,
  calculateBodyMetricsAndTargets,
} from "@/lib/body-profile-engine";
import type {
  ActivityLevelType,
  GenderType,
  GoalProgramType,
  UserProfileRow,
} from "@/types/database.types";

export interface BodyScannerSaveInput {
  gender: GenderType;
  age: number;
  weight_kg: number;
  height_cm: number;
  activity_level: ActivityLevelType;
  goal_program: GoalProgramType;
}

export interface BodyScannerCardProps {
  initialProfile?: Partial<UserProfileRow>;
  onSave: (input: BodyScannerSaveInput) => Promise<void>;
  submitLabel?: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Menghasilkan path SVG siluet anatomis proporsional (berbeda Pria vs Wanita)
 * serta titik anchor bahu, pinggang, dan pinggul yang bermorfosis secara halus
 * mengikuti perubahan BMI, Berat Badan, dan Tinggi Badan.
 */
function buildAnatomicalBodyGeometry(params: {
  gender: GenderType;
  bmi: number;
}) {
  const { gender, bmi } = params;
  // Normalisasi faktor massa tubuh (-0.30 pada BMI 16 hingga +0.95 pada BMI 36+)
  const massFactor = clamp((bmi - 21.5) / 14.5, -0.3, 0.95);

  const cx = 170;

  if (gender === "pria") {
    const neckHalf = 7.5 + Math.max(0, massFactor * 2.2);
    const shoulderHalf = 28.5 + massFactor * 6.8;
    const chestHalf = 23.5 + massFactor * 8.5;
    const waistHalf = 17.5 + Math.max(-1.8, massFactor * 13.5);
    const hipHalf = 19.5 + Math.max(-1.2, massFactor * 9.5);
    const thighOuter = 18.5 + Math.max(-1, massFactor * 8.5);
    const ankleOuter = 11.5 + Math.max(0, massFactor * 2.2);
    const armOuter = shoulderHalf + 7.5 + Math.max(0, massFactor * 4.2);

    const torsoArmsAndLegsPath = [
      // Leher kiri -> Bahu kiri -> Lengan luar kiri
      `M ${cx - neckHalf} 68`,
      `C ${cx - neckHalf - 4} 73, ${cx - shoulderHalf + 4} 74, ${cx - shoulderHalf} 80`,
      `C ${cx - armOuter} 88, ${cx - armOuter - 2} 118, ${cx - armOuter + 1} 148`,
      `C ${cx - armOuter + 2} 153, ${cx - armOuter + 8} 153, ${cx - armOuter + 9} 147`,
      // Lengan dalam kiri -> Ketiak -> Dada -> Pinggang -> Pinggul
      `L ${cx - chestHalf - 2} 102`,
      `C ${cx - chestHalf} 115, ${cx - waistHalf} 126, ${cx - waistHalf} 138`,
      `C ${cx - waistHalf} 149, ${cx - hipHalf} 156, ${cx - hipHalf} 166`,
      // Paha luar kiri -> Betis -> Pergelangan kaki kiri
      `C ${cx - thighOuter - 1} 188, ${cx - thighOuter + 2} 214, ${cx - ankleOuter - 2} 244`,
      `L ${cx - 4.5} 244`,
      // Kaki dalam kiri -> Selangkangan -> Kaki dalam kanan
      `L ${cx - 3.2} 174`,
      `Q ${cx} 171 ${cx + 3.2} 174`,
      `L ${cx + 4.5} 244`,
      `L ${cx + ankleOuter + 2} 244`,
      // Betis kanan -> Paha luar kanan -> Pinggul -> Pinggang -> Dada -> Ketiak kanan
      `C ${cx + thighOuter - 2} 214, ${cx + thighOuter + 1} 188, ${cx + hipHalf} 166`,
      `C ${cx + hipHalf} 156, ${cx + waistHalf} 149, ${cx + waistHalf} 138`,
      `C ${cx + waistHalf} 126, ${cx + chestHalf} 115, ${cx + chestHalf + 2} 102`,
      // Lengan dalam kanan -> Tangan kanan -> Bahu kanan -> Leher kanan
      `L ${cx + armOuter - 9} 147`,
      `C ${cx + armOuter - 8} 153, ${cx + armOuter - 2} 153, ${cx + armOuter - 1} 148`,
      `C ${cx + armOuter + 2} 118, ${cx + armOuter} 88, ${cx + shoulderHalf} 80`,
      `C ${cx + shoulderHalf - 4} 74, ${cx + neckHalf + 4} 73, ${cx + neckHalf} 68`,
      "Z",
    ].join(" ");

    return {
      headRx: 12.2 + Math.max(0, massFactor * 1.6),
      headRy: 15,
      headCy: 50,
      bodyPath: torsoArmsAndLegsPath,
      shoulderAnchor: { x: cx - shoulderHalf, y: 82 },
      waistAnchor: { x: cx + waistHalf, y: 138 },
      hipAnchor: { x: cx + hipHalf, y: 165 },
      shoulderSpan: shoulderHalf * 2,
      waistSpan: waistHalf * 2,
      hipSpan: hipHalf * 2,
    };
  }

  // Siluet Anatomis Wanita (bahu lebih lembut, lekuk pinggang tegas, proporsi pinggul alami)
  const neckHalf = 6.4 + Math.max(0, massFactor * 1.8);
  const shoulderHalf = 22.8 + massFactor * 5.2;
  const bustHalf = 20.5 + massFactor * 7.8;
  const waistHalf = 14.2 + Math.max(-1.4, massFactor * 11.2);
  const hipHalf = 23.2 + Math.max(-1.2, massFactor * 10.8);
  const thighOuter = 20.5 + Math.max(-1, massFactor * 9.2);
  const ankleOuter = 9.8 + Math.max(0, massFactor * 2.0);
  const armOuter = shoulderHalf + 6.5 + Math.max(0, massFactor * 3.8);

  const femalePath = [
    `M ${cx - neckHalf} 69`,
    `C ${cx - neckHalf - 3} 74, ${cx - shoulderHalf + 3} 75, ${cx - shoulderHalf} 82`,
    `C ${cx - armOuter} 91, ${cx - armOuter - 1} 119, ${cx - armOuter + 2} 147`,
    `C ${cx - armOuter + 3} 152, ${cx - armOuter + 8} 152, ${cx - armOuter + 9} 146`,
    `L ${cx - bustHalf - 1} 103`,
    `C ${cx - bustHalf} 114, ${cx - waistHalf} 124, ${cx - waistHalf} 135`,
    `C ${cx - waistHalf} 146, ${cx - hipHalf - 1} 153, ${cx - hipHalf} 166`,
    `C ${cx - thighOuter - 1} 188, ${cx - thighOuter + 3} 214, ${cx - ankleOuter - 1} 244`,
    `L ${cx - 4} 244`,
    `L ${cx - 2.6} 173`,
    `Q ${cx} 170 ${cx + 2.6} 173`,
    `L ${cx + 4} 244`,
    `L ${cx + ankleOuter + 1} 244`,
    `C ${cx + thighOuter - 3} 214, ${cx + thighOuter + 1} 188, ${cx + hipHalf} 166`,
    `C ${cx + hipHalf + 1} 153, ${cx + waistHalf} 146, ${cx + waistHalf} 135`,
    `C ${cx + waistHalf} 124, ${cx + bustHalf} 114, ${cx + bustHalf + 1} 103`,
    `L ${cx + armOuter - 9} 146`,
    `C ${cx + armOuter - 8} 152, ${cx + armOuter - 3} 152, ${cx + armOuter - 2} 147`,
    `C ${cx + armOuter + 1} 119, ${cx + armOuter} 91, ${cx + shoulderHalf} 82`,
    `C ${cx + shoulderHalf - 3} 75, ${cx + neckHalf + 3} 74, ${cx + neckHalf} 69`,
    "Z",
  ].join(" ");

  return {
    headRx: 11.4 + Math.max(0, massFactor * 1.4),
    headRy: 14.4,
    headCy: 51,
    bodyPath: femalePath,
    shoulderAnchor: { x: cx - shoulderHalf, y: 83 },
    waistAnchor: { x: cx + waistHalf, y: 135 },
    hipAnchor: { x: cx + hipHalf, y: 165 },
    shoulderSpan: shoulderHalf * 2,
    waistSpan: waistHalf * 2,
    hipSpan: hipHalf * 2,
  };
}

const PROGRAM_CARDS: Array<{
  key: GoalProgramType;
  title: string;
  tag: string;
  description: string;
  icon: typeof TrendingDown;
}> = [
  {
    key: "cutting",
    title: "Diet / Cutting",
    tag: "-350 kkal",
    description:
      "Defisit kalori terukur dengan protein tinggi (2.1g/kg) untuk memangkas lemak sambil menjaga otot.",
    icon: TrendingDown,
  },
  {
    key: "rekomposisi",
    title: "Rekomposisi",
    tag: "Maintenance",
    description:
      "Kalori seimbang setara TDEE dengan fokus protein tinggi (2.0g/kg) agar tubuh makin padat & proporsional.",
    icon: ShieldCheck,
  },
  {
    key: "bulking",
    title: "Bulking Bersih",
    tag: "+300 kkal",
    description:
      "Surplus kalori terkontrol +300 kkal dengan karbohidrat & protein optimal untuk menaikkan massa otot.",
    icon: TrendingUp,
  },
];

export function BodyScannerCard({
  initialProfile,
  onSave,
  submitLabel = "Simpan Profil & Hitung Target",
}: BodyScannerCardProps) {
  const rawUid = React.useId().replace(/:/g, "");

  const [gender, setGender] = React.useState<GenderType>(
    initialProfile?.gender ?? "pria"
  );
  const [age, setAge] = React.useState<number>(initialProfile?.age ?? 25);
  const [weightKg, setWeightKg] = React.useState<number>(
    initialProfile?.weight_kg ?? 68
  );
  const [heightCm, setHeightCm] = React.useState<number>(
    initialProfile?.height_cm ?? 170
  );
  const [activityLevel, setActivityLevel] =
    React.useState<ActivityLevelType>(
      initialProfile?.activity_level ?? "moderate"
    );
  const [goalProgram, setGoalProgram] = React.useState<GoalProgramType>(
    initialProfile?.goal_program ?? "rekomposisi"
  );
  const [saving, setSaving] = React.useState(false);
  const [savedToast, setSavedToast] = React.useState(false);

  React.useEffect(() => {
    if (!initialProfile) return;
    if (initialProfile.gender) setGender(initialProfile.gender);
    if (initialProfile.age) setAge(initialProfile.age);
    if (initialProfile.weight_kg) setWeightKg(initialProfile.weight_kg);
    if (initialProfile.height_cm) setHeightCm(initialProfile.height_cm);
    if (initialProfile.activity_level)
      setActivityLevel(initialProfile.activity_level);
    if (initialProfile.goal_program) setGoalProgram(initialProfile.goal_program);
  }, [
    initialProfile?.gender,
    initialProfile?.age,
    initialProfile?.weight_kg,
    initialProfile?.height_cm,
    initialProfile?.activity_level,
    initialProfile?.goal_program,
    initialProfile,
  ]);

  const metrics = React.useMemo(
    () =>
      calculateBodyMetricsAndTargets({
        gender,
        age,
        weightKg,
        heightCm,
        activityLevel,
        goalProgram,
      }),
    [gender, age, weightKg, heightCm, activityLevel, goalProgram]
  );

  // Kalkulasi preview per kartu program secara real-time
  const programPreviews = React.useMemo(() => {
    return {
      cutting: calculateBodyMetricsAndTargets({
        gender,
        age,
        weightKg,
        heightCm,
        activityLevel,
        goalProgram: "cutting",
      }),
      rekomposisi: calculateBodyMetricsAndTargets({
        gender,
        age,
        weightKg,
        heightCm,
        activityLevel,
        goalProgram: "rekomposisi",
      }),
      bulking: calculateBodyMetricsAndTargets({
        gender,
        age,
        weightKg,
        heightCm,
        activityLevel,
        goalProgram: "bulking",
      }),
    };
  }, [gender, age, weightKg, heightCm, activityLevel]);

  const geometry = React.useMemo(
    () => buildAnatomicalBodyGeometry({ gender, bmi: metrics.bmi }),
    [gender, metrics.bmi]
  );

  // Skala vertikal proporsional terhadap tinggi badan (140cm -> 0.89, 170cm -> 1.0, 200cm -> 1.09)
  const heightScale = clamp(0.88 + ((heightCm - 140) / 60) * 0.2, 0.86, 1.1);

  const bmiToneColor =
    metrics.bmiCategory === "Ideal"
      ? "#34D399"
      : metrics.bmiCategory === "Underweight"
        ? "#38BDF8"
        : metrics.bmiCategory === "Overweight"
          ? "#FBBF24"
          : "#F87171";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedToast(false);
    try {
      await onSave({
        gender,
        age,
        weight_kg: weightKg,
        height_cm: heightCm,
        activity_level: activityLevel,
        goal_program: goalProgram,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2600);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {/* ====================================================================
          STAGE 1: DARK 3D BODY SCANNER HOLOGRAPHIC CARD
          ==================================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0B1220] p-5 text-white shadow-[0_20px_50px_rgb(11,18,32,0.26)] ring-1 ring-white/10">
        {/* Background Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        />

        {/* Scanner Top Bar & Gender Switcher */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 ring-1 ring-white/10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-cyan-300">
              3D BIO-SCANNER
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-full bg-white/[0.07] p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setGender("pria")}
              className={[
                "rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all",
                gender === "pria"
                  ? "bg-cyan-400 text-[#0B1220] shadow-[0_0_16px_rgba(34,211,238,0.45)]"
                  : "text-slate-300 hover:text-white",
              ].join(" ")}
            >
              Pria
            </button>
            <button
              type="button"
              onClick={() => setGender("wanita")}
              className={[
                "rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all",
                gender === "wanita"
                  ? "bg-cyan-400 text-[#0B1220] shadow-[0_0_16px_rgba(34,211,238,0.45)]"
                  : "text-slate-300 hover:text-white",
              ].join(" ")}
            >
              Wanita
            </button>
          </div>
        </div>

        {/* 3D Hologram SVG Stage dengan Callout Pengukuran */}
        <div className="relative z-10 mt-2 flex items-center justify-center">
          <svg
            viewBox="0 0 340 282"
            className="h-[272px] w-full max-w-[360px] select-none"
            fill="none"
            role="img"
            aria-label={`Visualisasi pemindai tubuh 3D ${gender}`}
          >
            <defs>
              <linearGradient
                id={`${rawUid}-holo-fill`}
                x1="170"
                y1="36"
                x2="170"
                y2="246"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.42" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.34" />
              </linearGradient>

              <linearGradient
                id={`${rawUid}-cone-glow`}
                x1="170"
                y1="256"
                x2="170"
                y2="95"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </linearGradient>

              <linearGradient
                id={`${rawUid}-laser-band`}
                x1="95"
                y1="0"
                x2="245"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
                <stop offset="20%" stopColor="#22D3EE" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#ECFEFF" stopOpacity="1" />
                <stop offset="80%" stopColor="#22D3EE" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Garis Grid Ruang Kalibrasi Vertikal & Horizontal Tipis */}
            <line
              x1="170"
              y1="22"
              x2="170"
              y2="256"
              stroke="#22D3EE"
              strokeOpacity="0.1"
              strokeDasharray="3 4"
            />
            <line
              x1="48"
              y1="84"
              x2="292"
              y2="84"
              stroke="#22D3EE"
              strokeOpacity="0.07"
            />
            <line
              x1="48"
              y1="140"
              x2="292"
              y2="140"
              stroke="#22D3EE"
              strokeOpacity="0.07"
            />
            <line
              x1="48"
              y1="196"
              x2="292"
              y2="196"
              stroke="#22D3EE"
              strokeOpacity="0.07"
            />

            {/* Sorotan Cahaya Kerucut dari Platform 360° */}
            <polygon
              points="102,254 238,254 214,88 126,88"
              fill={`url(#${rawUid}-cone-glow)`}
            />

            {/* Piringan Platform 360° Bercahaya Cyan */}
            <g>
              <ellipse
                cx="170"
                cy="256"
                rx="74"
                ry="15"
                fill="#083344"
                fillOpacity="0.65"
                stroke="#22D3EE"
                strokeOpacity="0.55"
                strokeWidth="1.4"
              />
              <ellipse
                cx="170"
                cy="256"
                rx="58"
                ry="11"
                stroke="#67E8F9"
                strokeOpacity="0.85"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                className="animate-scanner-ring"
              />
              <ellipse
                cx="170"
                cy="256"
                rx="34"
                ry="6"
                fill="#22D3EE"
                fillOpacity="0.22"
              />
              <text
                x="170"
                y="277"
                textAnchor="middle"
                fill="#67E8F9"
                fillOpacity="0.7"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                360° HOLOGRAPHIC PLATFORM
              </text>
            </g>

            {/* Grup Siluet Tubuh Proporsional dengan Real-Time Morphing */}
            <g
              style={{
                transform: `translate(170px, 248px) scale(1, ${heightScale}) translate(-170px, -248px)`,
                transition: "transform 180ms ease-out",
              }}
            >
              {/* Kepala */}
              <ellipse
                cx="170"
                cy={geometry.headCy}
                rx={geometry.headRx}
                ry={geometry.headRy}
                fill={`url(#${rawUid}-holo-fill)`}
                stroke="#67E8F9"
                strokeWidth="1.5"
                style={{ transition: "all 180ms ease-out" }}
              />

              {/* Tubuh, Lengan & Kaki */}
              <path
                d={geometry.bodyPath}
                fill={`url(#${rawUid}-holo-fill)`}
                stroke="#67E8F9"
                strokeWidth="1.6"
                strokeLinejoin="round"
                style={{ transition: "d 180ms ease-out" }}
              />

              {/* Garis Wireframe Anatomis Internal (Bahu, Pinggang, Pinggul) */}
              <line
                x1={170 - geometry.shoulderSpan / 2 + 4}
                y1={geometry.shoulderAnchor.y}
                x2={170 + geometry.shoulderSpan / 2 - 4}
                y2={geometry.shoulderAnchor.y}
                stroke="#A5F3FC"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <line
                x1={170 - geometry.waistSpan / 2 + 2}
                y1={geometry.waistAnchor.y}
                x2={170 + geometry.waistSpan / 2 - 2}
                y2={geometry.waistAnchor.y}
                stroke="#A5F3FC"
                strokeOpacity="0.55"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <line
                x1={170 - geometry.hipSpan / 2 + 2}
                y1={geometry.hipAnchor.y}
                x2={170 + geometry.hipSpan / 2 - 2}
                y2={geometry.hipAnchor.y}
                stroke="#A5F3FC"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Titik Anchor & Garis Callout 1: BAHU -> BMI (Kiri Atas) */}
              <g>
                <polyline
                  points={`${geometry.shoulderAnchor.x},${geometry.shoulderAnchor.y} 96,64 12,64`}
                  stroke="#22D3EE"
                  strokeOpacity="0.65"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx={geometry.shoulderAnchor.x}
                  cy={geometry.shoulderAnchor.y}
                  r="3.2"
                  fill="#ECFEFF"
                  stroke="#22D3EE"
                  strokeWidth="2"
                />
                <text
                  x="12"
                  y="45"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="600"
                >
                  INDEKS BMI
                </text>
                <text
                  x="12"
                  y="59"
                  fill={bmiToneColor}
                  fontSize="13.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {metrics.bmi.toFixed(1)}
                </text>
                <text
                  x="50"
                  y="58"
                  fill="#E2E8F0"
                  fontSize="9.5"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="600"
                >
                  {metrics.bmiCategory}
                </text>
              </g>

              {/* Titik Anchor & Garis Callout 2: PINGGANG -> ESTIMASI TDEE (Kanan Tengah) */}
              <g>
                <polyline
                  points={`${geometry.waistAnchor.x},${geometry.waistAnchor.y} 240,118 328,118`}
                  stroke="#22D3EE"
                  strokeOpacity="0.65"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx={geometry.waistAnchor.x}
                  cy={geometry.waistAnchor.y}
                  r="3.2"
                  fill="#ECFEFF"
                  stroke="#22D3EE"
                  strokeWidth="2"
                />
                <text
                  x="328"
                  y="99"
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="600"
                >
                  ESTIMASI TDEE
                </text>
                <text
                  x="328"
                  y="113"
                  textAnchor="end"
                  fill="#67E8F9"
                  fontSize="12.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {metrics.tdeeKcal.toLocaleString("id-ID")} kkal
                </text>
              </g>

              {/* Titik Anchor & Garis Callout 3: PINGGUL -> BMR DASAR (Kanan Bawah) */}
              <g>
                <polyline
                  points={`${geometry.hipAnchor.x},${geometry.hipAnchor.y} 244,182 328,182`}
                  stroke="#22D3EE"
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx={geometry.hipAnchor.x}
                  cy={geometry.hipAnchor.y}
                  r="3"
                  fill="#ECFEFF"
                  stroke="#22D3EE"
                  strokeWidth="1.8"
                />
                <text
                  x="328"
                  y="165"
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="600"
                >
                  METABOLISME BMR
                </text>
                <text
                  x="328"
                  y="178"
                  textAnchor="end"
                  fill="#F8FAFC"
                  fontSize="11.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {metrics.bmrKcal.toLocaleString("id-ID")} kkal
                </text>
              </g>
            </g>

            {/* Garis Laser Scan Vertikal Menyapu Atas -> Bawah */}
            <g className="animate-scanner-laser">
              <rect
                x="92"
                y="-8"
                width="156"
                height="16"
                fill="#22D3EE"
                fillOpacity="0.1"
              />
              <line
                x1="90"
                y1="0"
                x2="250"
                y2="0"
                stroke={`url(#${rawUid}-laser-band)`}
                strokeWidth="2.2"
              />
            </g>
          </svg>
        </div>

        {/* ==================================================================
            SLIDER INTERAKTIF BERAT BADAN, TINGGI BADAN, USIA & AKTIVITAS
            ================================================================== */}
        <div className="relative z-10 mt-2 space-y-3.5 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10">
          {/* Berat Badan */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
                <Scale className="h-3.5 w-3.5 text-cyan-400" strokeWidth={1.8} />
                Berat Badan
              </span>
              <span className="font-mono text-[15px] font-bold tabular-nums text-cyan-300">
                {weightKg.toFixed(1)} kg
              </span>
            </div>
            <input
              type="range"
              min={35}
              max={150}
              step={0.5}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              aria-label="Slider Berat Badan dalam kilogram"
              className="takar-slider w-full"
            />
          </div>

          {/* Tinggi Badan */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-300">
                Tinggi Badan
              </span>
              <span className="font-mono text-[15px] font-bold tabular-nums text-cyan-300">
                {heightCm} cm
              </span>
            </div>
            <input
              type="range"
              min={135}
              max={210}
              step={1}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              aria-label="Slider Tinggi Badan dalam sentimeter"
              className="takar-slider w-full"
            />
          </div>

          {/* Usia & Aktivitas Harian */}
          <div className="grid grid-cols-[92px_1fr] gap-2.5 pt-1">
            <label className="rounded-xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
              <span className="block text-[10.5px] font-semibold text-slate-400">
                Usia (thn)
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={12}
                max={95}
                value={age || ""}
                onChange={(e) =>
                  setAge(clamp(Number.parseInt(e.target.value || "25", 10), 12, 95))
                }
                className="mt-0.5 w-full bg-transparent font-mono text-[15px] font-bold tabular-nums text-white focus:outline-none"
              />
            </label>

            <div className="rounded-xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-slate-400">
                <Activity className="h-3 w-3 text-cyan-400" strokeWidth={1.8} />
                Aktivitas Fisik
              </span>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {(
                  Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevelType[]
                ).map((actKey) => {
                  const isAct = activityLevel === actKey;
                  return (
                    <button
                      key={actKey}
                      type="button"
                      onClick={() => setActivityLevel(actKey)}
                      className={[
                        "rounded-lg py-1 text-[10.5px] font-semibold transition-colors",
                        isAct
                          ? "bg-cyan-400 text-[#0B1220]"
                          : "text-slate-300 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {ACTIVITY_MULTIPLIERS[actKey].shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          STAGE 2: 3 KARTU INTERAKTIF PILIHAN PROGRAM MAKAN
          ==================================================================== */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-ink">
            Pilih Program Makan
          </h2>
          <span className="font-mono text-[11px] font-semibold text-ink-secondary">
            Rumus Mifflin-St Jeor
          </span>
        </div>

        <div className="space-y-2.5">
          {PROGRAM_CARDS.map((card) => {
            const active = goalProgram === card.key;
            const preview = programPreviews[card.key];
            const IconComp = card.icon;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setGoalProgram(card.key)}
                className={[
                  "w-full rounded-2xl p-4 text-left transition-all duration-150",
                  active
                    ? "bg-emeraldBrand text-white shadow-float"
                    : "bg-surface text-ink shadow-soft hover:bg-subtle/60",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-emeraldBrand-soft text-emeraldBrand",
                      ].join(" ")}
                    >
                      <IconComp className="h-5 w-5" strokeWidth={1.9} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold">
                          {card.title}
                        </span>
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-subtle text-ink-secondary",
                          ].join(" ")}
                        >
                          {card.tag}
                        </span>
                      </div>

                      <p
                        className={[
                          "mt-1 text-[12px] leading-relaxed",
                          active ? "text-white/85" : "text-ink-secondary",
                        ].join(" ")}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baris Angka Target Hasil Kalkulasi Otomatis */}
                <div
                  className={[
                    "mt-3 flex items-center justify-between rounded-xl px-3 py-2 font-mono text-[12px] tabular-nums",
                    active ? "bg-white/12 text-white" : "bg-canvas text-ink",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <Flame
                      className={`h-3.5 w-3.5 ${active ? "text-amber-200" : "text-terracotta"}`}
                      strokeWidth={1.8}
                    />
                    {preview.targetKcal.toLocaleString("id-ID")} kkal/hari
                  </span>
                  <span
                    className={`font-bold ${active ? "text-emerald-200" : "text-emeraldBrand"}`}
                  >
                    Target {preview.targetProteinG}g Protein
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tombol Simpan Profil & Hitung Target */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={saving}
      >
        {savedToast ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.2} />
            <span>Profil &amp; Target Diterapkan!</span>
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
