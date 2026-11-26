"use client";

import * as React from "react";
import type { FlameTierKey } from "@/lib/body-profile-engine";

export interface TakaFieryMascotProps {
  tierKey: FlameTierKey;
  size?: number;
  particleCount?: number;
  className?: string;
}

interface FieryPalette {
  outerTop: string;
  outerBottom: string;
  midFlame: string;
  innerCore: string;
  bodyTop: string;
  bodyBottom: string;
  visorGlow: string;
  visorLens: string;
  auraHex: string;
}

const FIERY_PALETTES: Record<FlameTierKey, FieryPalette> = {
  ember: {
    outerTop: "#CBD5E1",
    outerBottom: "#64748B",
    midFlame: "#E2E8F0",
    innerCore: "#F8FAFC",
    bodyTop: "#FDE68A",
    bodyBottom: "#D97706",
    visorGlow: "#94A3B8",
    visorLens: "#E2E8F0",
    auraHex: "#94A3B8",
  },
  yellow: {
    outerTop: "#FEF08A",
    outerBottom: "#EAB308",
    midFlame: "#FDE047",
    innerCore: "#FFFFFF",
    bodyTop: "#FFFBEB",
    bodyBottom: "#F59E0B",
    visorGlow: "#FACC15",
    visorLens: "#FEF9C3",
    auraHex: "#FACC15",
  },
  orange: {
    outerTop: "#FDE047",
    outerBottom: "#EA580C",
    midFlame: "#FB923C",
    innerCore: "#FEF3C7",
    bodyTop: "#FEF08A",
    bodyBottom: "#EA580C",
    visorGlow: "#F97316",
    visorLens: "#FFEDD5",
    auraHex: "#F97316",
  },
  red: {
    outerTop: "#FB923C",
    outerBottom: "#B91C1C",
    midFlame: "#EF4444",
    innerCore: "#FEE2E2",
    bodyTop: "#FDE047",
    bodyBottom: "#DC2626",
    visorGlow: "#EF4444",
    visorLens: "#FECACA",
    auraHex: "#EF4444",
  },
  blue: {
    outerTop: "#A5F3FC",
    outerBottom: "#1D4ED8",
    midFlame: "#38BDF8",
    innerCore: "#F0F9FF",
    bodyTop: "#E0F2FE",
    bodyBottom: "#2563EB",
    visorGlow: "#38BDF8",
    visorLens: "#E0F2FE",
    auraHex: "#38BDF8",
  },
  green: {
    outerTop: "#A7F3D0",
    outerBottom: "#047857",
    midFlame: "#10B981",
    innerCore: "#ECFDF5",
    bodyTop: "#FEF08A",
    bodyBottom: "#059669",
    visorGlow: "#34D399",
    visorLens: "#D1FAE5",
    auraHex: "#10B981",
  },
};

// Koordinat deterministik untuk partikel bara api (aman dari hydration mismatch SSR/CSR)
const DETERMINISTIC_SPARKS = Array.from({ length: 32 }, (_, idx) => {
  const angle = (idx * 137.5 * Math.PI) / 180;
  const radius = 58 + (idx % 5) * 9;
  const cx = Math.round(110 + Math.cos(angle) * radius);
  const cy = Math.round(108 + Math.sin(angle) * (radius * 0.78));
  const r = 1.8 + (idx % 3) * 1.1;
  const delayMs = (idx * 130) % 2400;
  return { cx, cy, r, delayMs };
});

/**
 * Karakter Maskot TAKAR Mode Super Fiery:
 * Mahkota/aura api berkobar + kacamata visor menyala sesuai warna tingkat panas api.
 */
export function TakaFieryMascot({
  tierKey,
  size = 168,
  particleCount = 12,
  className = "",
}: TakaFieryMascotProps) {
  const uid = React.useId().replace(/:/g, "");
  const p = FIERY_PALETTES[tierKey];
  const visibleSparks = DETERMINISTIC_SPARKS.slice(
    0,
    Math.min(32, Math.max(0, particleCount))
  );
  const hasIntenseHeat =
    tierKey === "red" || tierKey === "blue" || tierKey === "green";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Maskot TAKAR Mode Api (${tierKey})`}
      className={`select-none overflow-visible ${className}`}
    >
      <defs>
        {/* Heat Glow Aura di belakang maskot */}
        <radialGradient
          id={`${uid}-aura`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(110 114) scale(96)"
        >
          <stop
            offset="0%"
            stopColor={p.auraHex}
            stopOpacity={hasIntenseHeat ? "0.55" : "0.34"}
          />
          <stop offset="60%" stopColor={p.auraHex} stopOpacity="0.14" />
          <stop offset="100%" stopColor={p.auraHex} stopOpacity="0" />
        </radialGradient>

        {/* Mahkota Api Utama */}
        <linearGradient
          id={`${uid}-crown`}
          x1="110"
          y1="14"
          x2="110"
          y2="192"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={p.outerTop} />
          <stop offset="48%" stopColor={p.midFlame} />
          <stop offset="100%" stopColor={p.outerBottom} />
        </linearGradient>

        {/* Badan Karakter TAKAR Fiery */}
        <radialGradient
          id={`${uid}-body`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(92 104) rotate(52) scale(86 82)"
        >
          <stop offset="0%" stopColor={p.bodyTop} />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor={p.bodyBottom} />
        </radialGradient>

        {/* Lensa Kacamata Visor Menyala */}
        <linearGradient
          id={`${uid}-lens`}
          x1="68"
          y1="112"
          x2="152"
          y2="136"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={p.visorLens} />
          <stop offset="50%" stopColor={p.visorGlow} />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Gelombang Panas (Heat Glow) */}
      <circle cx="110" cy="114" r="96" fill={`url(#${uid}-aura)`} />

      {/* Busur Listrik Plasma Khusus Level Ultimate Hijau / Biru */}
      {tierKey === "green" || tierKey === "blue" ? (
        <circle
          cx="110"
          cy="116"
          r="78"
          stroke={p.outerTop}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="10 14"
          className="animate-energy-spin"
        />
      ) : null}

      {/* Partikel Percikan Bara Api Naik */}
      {visibleSparks.map((s, idx) => (
        <circle
          key={idx}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={idx % 2 === 0 ? p.outerTop : p.midFlame}
          style={{ animationDelay: `${s.delayMs}ms` }}
          className="animate-milestone-spark"
        />
      ))}

      {/* Grup Utama Karakter Super Fiery */}
      <g className="animate-flame-pulse">
        {/* Jilatan Api Luar (Rambut & Aura Api ala Duolingo Fire) */}
        <path
          d="M114 16 C122 38 144 44 152 28 C160 52 178 72 174 108 C171 146 146 184 110 186 C74 184 48 150 47 112 C46 82 62 58 74 42 C76 56 85 62 88 58 C86 36 100 24 114 16 Z"
          fill={`url(#${uid}-crown)`}
        />

        {/* Lapisan Lidah Api Dalam Bercahaya */}
        <path
          d="M112 38 C118 54 134 58 140 48 C148 68 160 86 156 116 C153 146 134 172 110 174 C86 172 66 148 65 118 C64 94 76 74 86 62 C90 72 96 74 98 68 C97 52 104 44 112 38 Z"
          fill={p.innerCore}
          fillOpacity="0.32"
        />

        {/* Badan Inti Maskot TAKAR */}
        <ellipse
          cx="110"
          cy="130"
          rx="48"
          ry="45"
          fill={`url(#${uid}-body)`}
        />

        {/* Daun Kecil Ikonik TAKAR yang Ikut Menyala di Puncak Kepala */}
        <path
          d="M112 76 C118 62 136 60 146 70 C138 82 122 86 112 76 Z"
          fill={tierKey === "blue" ? "#38BDF8" : "#22C55E"}
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* Highlight Glossy pada Wajah Maskot */}
        <ellipse
          cx="88"
          cy="101"
          rx="14"
          ry="6.5"
          transform="rotate(-24 88 101)"
          fill="#FFFFFF"
          fillOpacity="0.58"
        />

        {/* Kacamata Visor Futuristik Keren (Cool Fiery Shades) */}
        <g>
          {/* Bayangan kacamata */}
          <path
            d="M64 114 H156 L148 137 C146 141 141 143 136 143 H118 L110 133 L102 143 H84 C79 143 74 141 72 137 L64 114 Z"
            fill="#090D16"
            fillOpacity="0.38"
            transform="translate(0, 3)"
          />
          {/* Frame hitam glossy tajam */}
          <path
            d="M62 112 H158 L150 136 C148 140 143 142 137 142 H117 L110 132 L103 142 H83 C77 142 72 140 70 136 L62 112 Z"
            fill="#111827"
            stroke="#FFFFFF"
            strokeOpacity="0.4"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Lensa Kiri & Kanan Menyala Sesuai Warna Panas Api */}
          <path
            d="M68 116 H105 L100 136 H82 C78 136 75 134 73 130 L68 116 Z"
            fill={`url(#${uid}-lens)`}
          />
          <path
            d="M115 116 H152 L147 130 C145 134 142 136 138 136 H120 L115 116 Z"
            fill={`url(#${uid}-lens)`}
          />
          {/* Kilatan Diagonal Putih pada Lensa */}
          <path
            d="M74 117 L83 117 L76 135 L69 135 Z"
            fill="#FFFFFF"
            fillOpacity="0.72"
          />
          <path
            d="M122 117 L131 117 L124 135 L117 135 Z"
            fill="#FFFFFF"
            fillOpacity="0.72"
          />
        </g>

        {/* Senyum Bangga / Confident Smirk */}
        <path
          d="M99 152 Q110 160 123 149"
          stroke="#78350F"
          strokeWidth="3.6"
          strokeLinecap="round"
        />

        {/* Tetesan Api Kecil di Bawah Dagu (seperti efek ember di referensi video) */}
        <circle cx="92" cy="176" r="4.5" fill={p.outerTop} />
      </g>
    </svg>
  );
}
