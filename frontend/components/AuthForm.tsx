"use client"
import { useState, useEffect, type FormEvent } from "react"
import WaterBackground from "@/components/WaterBackground"

interface Props {
  onEmail:  (email: string, password: string, mode: "login" | "register") => void
  onGoogle: () => void
  error:    string | null
  loading:  boolean
}

export default function AuthForm({ onEmail, onGoogle, error, loading }: Props) {
  const [mode, setMode]         = useState<"login" | "register">("login")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [mouse, setMouse]       = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    const handler = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onEmail(email, password, mode)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Animated water canvas */}
      <WaterBackground />

      {/* Cursor glow */}
      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          left: mouse.x,
          top: mouse.y,
          width: 320,
          height: 320,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(125,211,252,0.07) 0%, transparent 70%)",
          zIndex: 1,
          transition: "left 0.06s linear, top 0.06s linear",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm glass-strong rounded-2xl p-8 animate-fade-up"
        style={{ zIndex: 10 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl btn-accent font-display font-black text-sm mb-4">
            VC
          </span>
          <h1 className="font-display font-bold text-xl text-[#e0f2fe]">Vocalis</h1>
          <p className="text-xs font-mono mt-1" style={{ color: "rgba(125,211,252,0.5)" }}>
            AI-powered mock interviewer
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={onGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl btn-ghost font-mono text-sm mb-6 disabled:opacity-40"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "rgba(125,211,252,0.12)" }} />
          <span className="text-xs font-mono" style={{ color: "rgba(125,211,252,0.35)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(125,211,252,0.12)" }} />
        </div>

        {/* Tab toggle */}
        <div
          className="flex rounded-xl overflow-hidden mb-5"
          style={{ border: "1px solid rgba(125,211,252,0.12)" }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2 text-xs font-mono transition-all"
              style={
                mode === m
                  ? {
                      background: "rgba(125,211,252,0.1)",
                      color: "#7dd3fc",
                      borderBottom: "1px solid #7dd3fc",
                    }
                  : { color: "rgba(125,211,252,0.4)" }
              }
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label-mono">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input-blue rounded-xl px-3 py-2.5 text-sm font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-mono">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input-blue rounded-xl px-3 py-2.5 text-sm font-mono"
            />
          </div>

          {error && (
            <p className="text-xs font-mono rounded-xl px-3 py-2"
               style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2.5 rounded-xl btn-accent font-display text-sm flex items-center justify-center min-h-[42px]"
          >
            {loading
              ? <span className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(3,16,30,0.2)", borderTopColor: "#03101e" }} />
              : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  )
}
