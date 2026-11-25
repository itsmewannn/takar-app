export function ScaleOverlaySvg() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-5 py-6">
      <div className="flex w-full max-w-[360px] flex-1 items-center justify-center">
        <svg
          viewBox="0 0 340 340"
          className="h-full max-h-[340px] w-full"
          fill="none"
          aria-hidden="true"
        >
          {/* Sudut bingkai kalibrasi membulat halus */}
          <path
            d="M22 58 V34 Q22 22 34 22 H58 M282 22 H306 Q318 22 318 34 V58 M318 282 V306 Q318 318 306 318 H282 M58 318 H34 Q22 318 22 306 V282"
            stroke="#FFFFFF"
            strokeOpacity="0.65"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Panduan lingkaran tepi piring makan standar (~24 cm) */}
          <circle
            cx="154"
            cy="170"
            r="114"
            stroke="#FFFFFF"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle
            cx="154"
            cy="170"
            r="80"
            stroke="#FFFFFF"
            strokeOpacity="0.22"
            strokeWidth="1"
          />

          {/* Pill label diameter piring */}
          <rect
            x="96"
            y="40"
            width="116"
            height="22"
            rx="11"
            fill="#14171A"
            fillOpacity="0.72"
          />
          <text
            x="154"
            y="54"
            textAnchor="middle"
            fill="#FFFFFF"
            fillOpacity="0.92"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            PIRING ~24 CM
          </text>

          {/* Siluet sendok makan standar (~19 cm) */}
          <g transform="translate(292, 78)">
            <ellipse
              cx="12"
              cy="28"
              rx="13"
              ry="24"
              stroke="#FFFFFF"
              strokeOpacity="0.75"
              strokeWidth="1.5"
            />
            <path
              d="M9 52 L8 176 C8 180 16 180 16 176 L15 52"
              stroke="#FFFFFF"
              strokeOpacity="0.75"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="30"
              y1="4"
              x2="30"
              y2="180"
              stroke="#FFFFFF"
              strokeOpacity="0.38"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </g>

          <rect
            x="244"
            y="266"
            width="88"
            height="20"
            rx="10"
            fill="#14171A"
            fillOpacity="0.72"
          />
          <text
            x="288"
            y="279"
            textAnchor="middle"
            fill="#FFFFFF"
            fillOpacity="0.92"
            fontSize="9.5"
            fontFamily="JetBrains Mono, monospace"
          >
            SENDOK ~19 CM
          </text>
        </svg>
      </div>

      <div className="rounded-2xl bg-charcoal/80 px-4 py-2.5 text-center backdrop-blur-sm">
        <p className="text-[12px] font-medium leading-snug text-white/90">
          Sertakan sendok (~19 cm) atau tepi piring (~24 cm) untuk kalibrasi gramasi
        </p>
      </div>
    </div>
  );
}
