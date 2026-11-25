import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F8FB",
        surface: "#FFFFFF",
        subtle: "#EEF2F6",
        hairline: "#E8EDF3",
        frame: "#E2E8F0",
        ink: {
          DEFAULT: "#14171A",
          secondary: "#64748B",
        },
        emeraldBrand: {
          DEFAULT: "#1B6B4A",
          hover: "#15573C",
          soft: "#E6F4EE",
        },
        charcoal: {
          DEFAULT: "#1C1E21",
          hover: "#2A2D32",
        },
        terracotta: {
          DEFAULT: "#E05A3A",
          hover: "#C94B2D",
          soft: "#FFF0EC",
        },
        protein: "#1B6B4A",
        carbs: {
          DEFAULT: "#D97706",
          soft: "#FEF3C7",
        },
        fat: {
          DEFAULT: "#3B82F6",
          soft: "#EFF6FF",
        },
        warning: {
          DEFAULT: "#B45309",
          bg: "#FEF3C7",
        },
        viewfinder: "#0F1318",
      },
      boxShadow: {
        soft: "0 8px 30px rgb(0 0 0 / 0.04)",
        float: "0 12px 36px rgb(27 107 74 / 0.16)",
        sheet: "0 -6px 30px rgb(0 0 0 / 0.04)",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono Variable"',
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
