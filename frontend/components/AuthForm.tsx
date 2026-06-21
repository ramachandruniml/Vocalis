"use client"
import { useState, type FormEvent } from "react"
import VocalisLogo from "@/components/VocalisLogo"

interface Props {
  onEmail:  (email: string, password: string, mode: "login" | "register") => void
  onGoogle: () => void
  error:    string | null
  loading:  boolean
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid rgba(200,100,50,0.18)",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#1c0800",
  background: "rgba(255,255,255,0.72)",
  outline: "none",
  transition: "border-color 0.16s, box-shadow 0.16s",
  boxSizing: "border-box",
}

export default function AuthForm({ onEmail, onGoogle, error, loading }: Props) {
  const [mode, setMode]         = useState<"login" | "register">("login")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onEmail(email, password, mode)
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "24px",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "rgba(255,255,255,0.62)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 8px 48px rgba(180,60,10,0.12), 0 2px 8px rgba(0,0,0,0.05)",
      }}>
        {/* Warm gradient header */}
        <div style={{
          position: "relative",
          height: "108px",
          overflow: "hidden",
          background: "linear-gradient(160deg, rgba(249,115,22,0.22) 0%, rgba(251,113,133,0.14) 55%, rgba(255,255,255,0) 100%)",
        }}>
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(234,88,12,0.12)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>
        </div>

        {/* Card body */}
        <div style={{ padding: "0 40px 40px", marginTop: "-32px" }}>

          {/* Logo + title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <VocalisLogo iconHeight={110} wordmarkSize={32} stacked />
            </div>
            <h1 style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2, color: "#1c0800", margin: "0 0 8px" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p style={{ fontSize: "14px", color: "#7a4020", margin: 0 }}>
              {mode === "login"
                ? "Please enter your details to sign in"
                : "Sign up to start your interview prep"}
            </p>
          </div>

          {/* Google circle button */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              style={{
                width: "52px", height: "52px",
                borderRadius: "50%",
                border: "1.5px solid rgba(200,100,50,0.22)",
                background: "rgba(255,255,255,0.78)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(180,60,10,0.08)",
                opacity: loading ? 0.4 : 1,
                transition: "box-shadow 0.16s, border-color 0.16s",
              }}
              title="Continue with Google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,100,50,0.18)" }} />
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#9a6040" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(200,100,50,0.18)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1c0800", marginBottom: "8px" }}>
                Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your Email Address"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e  => { e.target.style.borderColor = "rgba(234,88,12,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.10)" }}
                onBlur={e   => { e.target.style.borderColor = "rgba(200,100,50,0.18)"; e.target.style.boxShadow = "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1c0800", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  style={{ ...inputStyle, padding: "12px 44px 12px 16px" }}
                  onFocus={e  => { e.target.style.borderColor = "rgba(234,88,12,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.10)" }}
                  onBlur={e   => { e.target.style.borderColor = "rgba(200,100,50,0.18)"; e.target.style.boxShadow = "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9a6040", padding: "4px", lineHeight: 0,
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "-4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#5c3012", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" style={{ width: "14px", height: "14px", accentColor: "#ea580c" }}/>
                  Remember me
                </label>
                <button
                  type="button"
                  style={{ fontSize: "14px", fontWeight: 600, color: "#1c0800", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p style={{ fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "8px 12px", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "14px",
                background: "rgba(28,10,0,0.88)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                minHeight: "48px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                marginTop: "4px",
                boxShadow: "0 4px 18px rgba(28,10,0,0.22)",
                transition: "opacity 0.16s, box-shadow 0.16s",
              }}
            >
              {loading
                ? <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={{ fontSize: "14px", textAlign: "center", marginTop: "20px", color: "#7a4020" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ fontWeight: 700, color: "#1c0800", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
