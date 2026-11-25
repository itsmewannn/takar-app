"use client";

import * as React from "react";

export type TakaMood =
  | "happy"
  | "angry"
  | "sad"
  | "worried"
  | "excited"
  | "thinking";

export interface TakaMascotProps {
  mood?: TakaMood;
  size?: number;
  className?: string;
  animate?: boolean;
}

interface MoodPalette {
  ledCore: string;
  ledGlow: string;
  ledSecondary: string;
  cheekOpacity: number;
}

const MOOD_PALETTES: Record<TakaMood, MoodPalette> = {
  happy: {
    ledCore: "#ECFDF5",
    ledGlow: "#34D399",
    ledSecondary: "#6EE7B7",
    cheekOpacity: 0.42,
  },
  angry: {
    ledCore: "#FEE2E2",
    ledGlow: "#EF4444",
    ledSecondary: "#F87171",
    cheekOpacity: 0.25,
  },
  sad: {
    ledCore: "#DBEAFE",
    ledGlow: "#60A5FA",
    ledSecondary: "#93C5FD",
    cheekOpacity: 0.12,
  },
  worried: {
    ledCore: "#FEF3C7",
    ledGlow: "#F59E0B",
    ledSecondary: "#FBBF24",
    cheekOpacity: 0.2,
  },
  excited: {
    ledCore: "#FEF9C3",
    ledGlow: "#34D399",
    ledSecondary: "#FDE047",
    cheekOpacity: 0.55,
  },
  thinking: {
    ledCore: "#ECFEFF",
    ledGlow: "#22D3EE",
    ledSecondary: "#67E8F9",
    cheekOpacity: 0.2,
  },
};

export function TakaMascot({
  mood = "happy",
  size = 88,
  className = "",
  animate = true,
}: TakaMascotProps) {
  const rawId = React.useId();
  const uid = rawId.replace(/:/g, "");
  const palette = MOOD_PALETTES[mood];

  const bodyMotionClass = !animate
    ? ""
    : mood === "excited"
      ? "animate-taka-excited"
      : mood === "angry"
        ? "animate-taka-angry"
        : "animate-taka-float";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Maskot TAKA (${mood})`}
      className={`select-none overflow-visible ${className}`}
    >
      <defs>
        {/* 3D Glossy Yellow Fruit Body Gradient */}
        <radialGradient
          id={`${uid}-fruit-body`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(76 80) rotate(52) scale(118 112)"
        >
          <stop offset="0%" stopColor="#FFF9B0" />
          <stop offset="34%" stopColor="#FFE047" />
          <stop offset="76%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Bottom Warm Rim Bounce Light */}
        <linearGradient
          id={`${uid}-fruit-rim`}
          x1="100"
          y1="62"
          x2="100"
          y2="176"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.5" />
        </linearGradient>

        {/* Fresh Green 3D Leaf Gradient */}
        <linearGradient
          id={`${uid}-leaf`}
          x1="102"
          y1="16"
          x2="148"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="48%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Woody Stem Gradient */}
        <linearGradient
          id={`${uid}-stem`}
          x1="95"
          y1="24"
          x2="105"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="100%" stopColor="#713F12" />
        </linearGradient>

        {/* Futuristic Glossy Black VR Visor Frame */}
        <linearGradient
          id={`${uid}-visor-frame`}
          x1="40"
          y1="74"
          x2="160"
          y2="132"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="35%" stopColor="#18181B" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>

        {/* Inner Dark OLED Visor Screen */}
        <linearGradient
          id={`${uid}-visor-screen`}
          x1="100"
          y1="80"
          x2="100"
          y2="124"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#050811" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Curved Visor Glass Specular Sheen */}
        <linearGradient
          id={`${uid}-visor-gloss`}
          x1="54"
          y1="78"
          x2="112"
          y2="118"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Dynamic LED Eye Radial Glow (Left & Right) */}
        <radialGradient
          id={`${uid}-eye-glow-l`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(78 102) scale(24 19)"
        >
          <stop offset="0%" stopColor={palette.ledGlow} stopOpacity="0.65" />
          <stop offset="55%" stopColor={palette.ledGlow} stopOpacity="0.2" />
          <stop offset="100%" stopColor={palette.ledGlow} stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={`${uid}-eye-glow-r`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(122 102) scale(24 19)"
        >
          <stop offset="0%" stopColor={palette.ledGlow} stopOpacity="0.65" />
          <stop offset="55%" stopColor={palette.ledGlow} stopOpacity="0.2" />
          <stop offset="100%" stopColor={palette.ledGlow} stopOpacity="0" />
        </radialGradient>

        {/* Ground Contact Shadow */}
        <radialGradient
          id={`${uid}-ground-shadow`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(100 186) scale(46 8)"
        >
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        <clipPath id={`${uid}-screen-clip`}>
          <rect x="46" y="81" width="108" height="42" rx="20" />
        </clipPath>
      </defs>

      {/* Bayangan dasar lembut */}
      <ellipse
        cx="100"
        cy="186"
        rx="46"
        ry="7.5"
        fill={`url(#${uid}-ground-shadow)`}
        className={animate ? "animate-taka-shadow" : ""}
      />

      {/* Grup karakter utama (melayang halus) */}
      <g className={bodyMotionClass}>
        {/* Tangkai cokelat & Daun hijau segar di bagian atas */}
        <g className={animate ? "animate-taka-leaf" : ""}>
          {/* Tangkai */}
          <path
            d="M98 54 C97 43 99 32 104 25"
            stroke={`url(#${uid}-stem)`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M97 52 C96.5 43 98 34 102 27"
            stroke="#CA8A04"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Daun hijau 3D glossy */}
          <path
            d="M102 34 C108 15 134 12 149 25 C139 43 116 48 102 34 Z"
            fill={`url(#${uid}-leaf)`}
          />
          {/* Tulang daun & kilau daun */}
          <path
            d="M104 33 Q124 27 143 25"
            stroke="#DCFCE7"
            strokeOpacity="0.7"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse
            cx="121"
            cy="23"
            rx="9"
            ry="3.2"
            transform="rotate(-14 121 23)"
            fill="#FFFFFF"
            fillOpacity="0.38"
          />
        </g>

        {/* Lekuk bayangan kecil pangkal tangkai di atas buah */}
        <ellipse
          cx="100"
          cy="52"
          rx="14"
          ry="4"
          fill="#B45309"
          fillOpacity="0.28"
        />

        {/* Badan buah bulat kuning cerah glossy */}
        <ellipse
          cx="100"
          cy="113"
          rx="66"
          ry="62"
          fill={`url(#${uid}-fruit-body)`}
        />
        <ellipse
          cx="100"
          cy="113"
          rx="65"
          ry="61"
          stroke={`url(#${uid}-fruit-rim)`}
          strokeWidth="2"
        />

        {/* Highlight cahaya glossy 3D pada badan buah */}
        <ellipse
          cx="69"
          cy="72"
          rx="20"
          ry="10"
          transform="rotate(-28 69 72)"
          fill="#FFFFFF"
          fillOpacity="0.68"
        />
        <circle cx="53" cy="87" r="4.2" fill="#FFFFFF" fillOpacity="0.52" />

        {/* Rona pipi halus di bawah visor */}
        <ellipse
          cx="58"
          cy="132"
          rx="10"
          ry="5.5"
          fill="#F97316"
          fillOpacity={palette.cheekOpacity}
        />
        <ellipse
          cx="142"
          cy="132"
          rx="10"
          ry="5.5"
          fill="#F97316"
          fillOpacity={palette.cheekOpacity}
        />

        {/* Strap samping visor futuristik */}
        <path
          d="M34 98 C37 94 42 93 45 94 L45 111 C41 111 36 109 34 105 Z"
          fill="#18181B"
        />
        <path
          d="M166 98 C163 94 158 93 155 94 L155 111 C159 111 164 109 166 105 Z"
          fill="#18181B"
        />

        {/* Bayangan lembut visor pada permukaan buah */}
        <rect
          x="41"
          y="80"
          width="118"
          height="50"
          rx="25"
          fill="#92400E"
          fillOpacity="0.24"
        />

        {/* Bingkai luar Visor / Kacamata VR Hitam Mengilap */}
        <rect
          x="40"
          y="76"
          width="120"
          height="52"
          rx="26"
          fill={`url(#${uid}-visor-frame)`}
          stroke="#52525B"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />

        {/* Layar gelap OLED di dalam visor */}
        <rect
          x="46"
          y="81"
          width="108"
          height="42"
          rx="20"
          fill={`url(#${uid}-visor-screen)`}
        />

        {/* Konten LED Mata Digital di dalam layar visor */}
        <g clipPath={`url(#${uid}-screen-clip)`}>
          {/* Glow radial di belakang mata LED */}
          <g className={mood === "thinking" && animate ? "animate-taka-scan" : ""}>
            <ellipse
              cx="78"
              cy="102"
              rx="23"
              ry="18"
              fill={`url(#${uid}-eye-glow-l)`}
            />
            <ellipse
              cx="122"
              cy="102"
              rx="23"
              ry="18"
              fill={`url(#${uid}-eye-glow-r)`}
            />
          </g>

          {/* Ekspresi LED berdasarkan mood */}
          {mood === "happy" ? (
            <g className={animate ? "animate-taka-blink" : ""}>
              <rect
                x="69"
                y="93"
                width="16"
                height="19"
                rx="8"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
              <circle cx="74" cy="98" r="2.5" fill="#FFFFFF" />
              <rect
                x="115"
                y="93"
                width="16"
                height="19"
                rx="8"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
              <circle cx="120" cy="98" r="2.5" fill="#FFFFFF" />
            </g>
          ) : null}

          {mood === "excited" ? (
            <g>
              {/* Mata melengkung ceria berbinar */}
              <path
                d="M66 107 C70 95 84 95 88 107"
                stroke={palette.ledCore}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M66 107 C70 95 84 95 88 107"
                stroke={palette.ledSecondary}
                strokeOpacity="0.65"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M112 107 C116 95 130 95 134 107"
                stroke={palette.ledCore}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M112 107 C116 95 130 95 134 107"
                stroke={palette.ledSecondary}
                strokeOpacity="0.65"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Sparkle titik LED kecil */}
              <circle cx="57" cy="93" r="2" fill={palette.ledSecondary} />
              <circle cx="143" cy="93" r="2" fill={palette.ledSecondary} />
            </g>
          ) : null}

          {mood === "angry" ? (
            <g>
              {/* Alis LED miring tajam ke dalam */}
              <path
                d="M65 92 L89 99"
                stroke={palette.ledGlow}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M135 92 L111 99"
                stroke={palette.ledGlow}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Mata menyipit tajam */}
              <path
                d="M67 103 L88 105 C87 111 70 111 67 103 Z"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="1.5"
              />
              <path
                d="M133 103 L112 105 C113 111 130 111 133 103 Z"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="1.5"
              />
            </g>
          ) : null}

          {mood === "sad" ? (
            <g>
              {/* Mata sayu melengkung turun */}
              <path
                d="M66 101 C72 109 83 109 88 103"
                stroke={palette.ledCore}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M112 103 C117 109 128 109 134 101"
                stroke={palette.ledCore}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Tetes air mata piksel biru redup */}
              <circle
                cx="65"
                cy="112"
                r="2.4"
                fill={palette.ledSecondary}
                fillOpacity="0.85"
              />
            </g>
          ) : null}

          {mood === "worried" ? (
            <g>
              {/* Alis naik khawatir */}
              <path
                d="M65 95 Q76 88 87 92"
                stroke={palette.ledSecondary}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M135 95 Q124 88 113 92"
                stroke={palette.ledSecondary}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Mata agak melebar */}
              <circle
                cx="78"
                cy="105"
                r="8"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
              <circle
                cx="122"
                cy="105"
                r="8"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
            </g>
          ) : null}

          {mood === "thinking" ? (
            <g className={animate ? "animate-taka-scan" : ""}>
              {/* Mata LED digital bergerak scanning kiri-kanan */}
              <rect
                x="69"
                y="96"
                width="17"
                height="12"
                rx="5"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
              <rect
                x="114"
                y="96"
                width="17"
                height="12"
                rx="5"
                fill={palette.ledCore}
                stroke={palette.ledGlow}
                strokeWidth="2"
              />
              {/* Indikator titik kalkulasi di tengah */}
              <circle cx="100" cy="113" r="1.8" fill={palette.ledSecondary} />
            </g>
          ) : null}

          {/* Pantulan kaca melengkung pada visor */}
          <path
            d="M48 83 H118 L92 121 H48 Z"
            fill={`url(#${uid}-visor-gloss)`}
          />
        </g>

        {/* Highlight tipis tepi atas visor */}
        <path
          d="M64 79.5 H136"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Mulut ekspresif di bawah visor */}
        {mood === "happy" ? (
          <path
            d="M90 139 Q100 148 110 139"
            stroke="#78350F"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        ) : null}

        {mood === "excited" ? (
          <g>
            <path
              d="M88 137 Q100 153 112 137 Z"
              fill="#78350F"
              stroke="#78350F"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M93 144 Q100 149 107 144"
              fill="#FB7185"
            />
          </g>
        ) : null}

        {mood === "angry" ? (
          <path
            d="M90 145 Q100 137 110 145"
            stroke="#78350F"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        ) : null}

        {mood === "sad" ? (
          <path
            d="M91 145 Q100 138 109 145"
            stroke="#78350F"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : null}

        {mood === "worried" ? (
          <path
            d="M87 142 Q93.5 138 100 142 T113 142"
            stroke="#78350F"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : null}

        {mood === "thinking" ? (
          <path
            d="M93 142 Q101 142 108 139"
            stroke="#78350F"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : null}
      </g>
    </svg>
  );
}
