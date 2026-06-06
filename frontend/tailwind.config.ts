import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-syne)"],
        mono: ["var(--font-dm-mono)"],
      },
      colors: {
        accent: "#c8f564",
        "accent-dim": "#8fb33e",
        panel: "#111111",
        card: "#161616",
        border: "#222222",
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fadeUp 0.4s ease both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config