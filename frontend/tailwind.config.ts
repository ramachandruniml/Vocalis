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
        display: ["var(--font-space)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        accent: "#7dd3fc",        // sky-300 — baby blue
        "accent-dim": "#38bdf8",  // sky-400
        "accent-bright": "#e0f2fe",
        panel: "#07182e",
        card: "#0a2040",
        border: "#1a4a7a",
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(125, 211, 252, 0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(125, 211, 252, 0.25)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
