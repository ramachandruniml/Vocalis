"use client"
import { useState, type FormEvent } from "react"

interface Props {
  onEmail:  (email: string, password: string, mode: "login" | "register") => void
  onGoogle: () => void
  error:    string | null
  loading:  boolean
}

export default function AuthForm({ onEmail, onGoogle, error, loading }: Props) {
  const [mode, setMode]       = useState<"login" | "register">("login")
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onEmail(email, password, mode)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 animate-fade-up">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-accent text-[#0a0a0a] font-display font-black text-sm mb-4">
            VC
          </span>
          <h1 className="font-display font-bold text-xl text-zinc-100">Vocalis</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">AI-powered mock interviewer</p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={onGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border bg-panel text-zinc-300 text-sm font-mono hover:border-zinc-600 transition-colors mb-6 disabled:opacity-50"
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
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-zinc-600 font-mono">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-5">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-mono transition-colors ${
                mode === m
                  ? "bg-accent/10 text-accent border-b border-accent"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="bg-panel border border-border rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-accent-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="bg-panel border border-border rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-accent-dim transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2.5 bg-accent text-[#0a0a0a] rounded-lg font-display font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[42px]"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  )
}