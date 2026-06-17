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
        accent: "#2563eb",        // blue-600 — deep blue for light bg
        "accent-dim": "#1d4ed8",  // blue-700
        "accent-bright": "#0d2b4a",
        panel: "rgba(255,255,255,0.50)",
        card: "rgba(255,255,255,0.45)",
        border: "rgba(14,80,160,0.18)",
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
