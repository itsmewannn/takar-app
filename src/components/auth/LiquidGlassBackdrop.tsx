"use client";

import * as React from "react";
import { TakaMascot, type TakaMood } from "@/components/TakaMascot";

/**
 * Latar dekoratif 3D Liquid Gel Waves & Tetesan Air Bening khas TAKAR
 * (mengikuti estetika Liquid Glass dengan nuansa mint-emerald & cyan lembut).
 */
export function LiquidGlassBackdrop() {
  const uid = React.useId().replace(/:/g, "");

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Cahaya ambient mint & cyan sangat lembut */}
      <div className="absolute -left-16 top-16 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute -right-16 bottom-20 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />

      <svg
        viewBox="0 0 460 840"
        className="h-full w-full object-cover"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gel Cairan 3D Kiri */}
          <radialGradient
            id={`${uid}-gel-left`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(52 355) rotate(36) scale(165 135)"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="36%" stopColor="#A7F3D0" stopOpacity="0.78" />
            <stop offset="78%" stopColor="#10B981" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.72" />
          </radialGradient>

          {/* Gel Cairan 3D Kanan */}
          <radialGradient
            id={`${uid}-gel-right`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(382 455) rotate(138) scale(170 130)"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="38%" stopColor="#99F6E4" stopOpacity="0.75" />
            <stop offset="78%" stopColor="#14B8A6" stopOpacity="0.56" />
            <stop offset="100%" stopColor="#0F766E" stopOpacity="0.72" />
          </radialGradient>

          {/* Tetesan Air 3D Glossy */}
          <radialGradient id={`${uid}-drop`} cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
            <stop offset="40%" stopColor="#D1FAE5" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#34D399" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#065F46" stopOpacity="0.65" />
          </radialGradient>
        </defs>

        {/* Gelombang Gel 3D Kiri (menyembul dari balik kartu) */}
        <g className="animate-liquid-drift">
          <path
            d="M-38 286 C14 274 62 314 96 364 C118 396 112 452 74 472 C34 494 -8 456 -38 438 Z"
            fill="#065F46"
            fillOpacity="0.1"
            transform="translate(4, 12)"
          />
          <path
            d="M-38 286 C14 274 62 314 96 364 C118 396 112 452 74 472 C34 494 -8 456 -38 438 Z"
            fill={`url(#${uid}-gel-left)`}
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="1.5"
          />
          {/* Kilau specular gel kiri */}
          <path
            d="M-16 302 C22 298 54 328 74 362"
            stroke="#FFFFFF"
            strokeOpacity="0.88"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Gelombang Gel 3D Kanan (menyembul dari sisi kanan kartu) */}
        <g
          className="animate-liquid-drift"
          style={{ animationDelay: "-2.8s" }}
        >
          <path
            d="M496 392 C442 380 378 398 352 442 C332 476 346 534 388 552 C432 570 468 536 496 518 Z"
            fill="#0F766E"
            fillOpacity="0.11"
            transform="translate(3, 12)"
          />
          <path
            d="M496 392 C442 380 378 398 352 442 C332 476 346 534 388 552 C432 570 468 536 496 518 Z"
            fill={`url(#${uid}-gel-right)`}
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="1.5"
          />
          {/* Kilau specular gel kanan */}
          <path
            d="M466 408 C428 402 392 414 372 444"
            stroke="#FFFFFF"
            strokeOpacity="0.88"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Tetesan Air 3D Bening di Sekitar Kartu */}
        {[
          { cx: 34, cy: 148, r: 16 },
          { cx: 68, cy: 196, r: 7 },
          { cx: 396, cy: 268, r: 12 },
          { cx: 428, cy: 318, r: 6.5 },
          { cx: 404, cy: 598, r: 21 },
          { cx: 436, cy: 558, r: 6 },
          { cx: 378, cy: 662, r: 8.5 },
          { cx: 42, cy: 564, r: 9 },
        ].map((d, idx) => (
          <g key={idx}>
            <circle
              cx={d.cx + 2}
              cy={d.cy + 4}
              r={d.r}
              fill="#064E3B"
              fillOpacity="0.12"
            />
            <circle
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              fill={`url(#${uid}-drop)`}
              stroke="#FFFFFF"
              strokeOpacity="0.8"
              strokeWidth="1"
            />
            <ellipse
              cx={d.cx - d.r * 0.32}
              cy={d.cy - d.r * 0.34}
              rx={d.r * 0.34}
              ry={d.r * 0.19}
              transform={`rotate(-32 ${d.cx - d.r * 0.32} ${d.cy - d.r * 0.34})`}
              fill="#FFFFFF"
              fillOpacity="0.92"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Orb Kaca 3D Glossy yang menonjol setengah lingkaran di puncak kartu Login/Register,
 * menampilkan Maskot Kuning Ikonik TAKAR di dalamnya.
 */
export function LiquidMascotOrb({ mood }: { mood: TakaMood }) {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/95 shadow-[0_14px_30px_rgba(5,150,105,0.22),inset_0_3px_6px_rgba(255,255,255,0.98),inset_0_-5px_10px_rgba(16,185,129,0.28)]"
        style={{
          background:
            "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.96) 0%, rgba(209,250,229,0.72) 45%, rgba(52,211,153,0.34) 82%, rgba(5,150,105,0.42) 100%)",
        }}
      >
        <TakaMascot mood={mood} size={72} />

        {/* Pantulan lengkung kaca atas (3D Glass Orb Specular Arc) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-2 h-6 w-12 -rotate-12 rounded-full bg-gradient-to-b from-white/80 to-white/0"
        />
      </div>
    </div>
  );
}
