"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { getSession } from "@/lib/api"
import VocalisLogo from "@/components/VocalisLogo"
import type { FeedbackAnalysis } from "@/types"

/* ── Types for DB session data ─────────────────────────────── */
interface DbSegment {
  id: string
  transcript: string
  confidence: number
  wpm: number
  fillerRate: number
  fillerWords: string[]
  uniqueWordRatio: number
  feedback: string
}

interface DetailSession {
  id: string
  avgConfidence: number
  avgWpm: number
  avgFillerRate: number
  segmentCount: number
  totalWords: number
  createdAt: string
  segments: DbSegment[]
}

/* ── Shared styles ─────────────────────────────────────────── */
const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "14px",
  boxShadow: "0 4px 24px rgba(180,60,10,0.07), 0 1px 4px rgba(0,0,0,0.03)",
}

const labelStyle: React.CSSProperties = {
  fontSize: "10px", fontWeight: 700, color: "#9a6040",
  letterSpacing: "0.08em", textTransform: "uppercase",
}

/* ── Page ──────────────────────────────────────────────────── */
export default function SessionDetailPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [session, setSession] = useState<DetailSession | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

  useEffect(() => {
    if (!token || !id) return
    getSession(token, id)
      .then((data) => setSession(data))
      .catch(() => setError("Could not load session."))
      .finally(() => setFetching(false))
  }, [token, id])

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>

      {/* Fixed header */}
      <header style={{
        background: "rgba(255,255,255,0.68)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(255,255,255,0.55)",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
      }}>
        <VocalisLogo iconHeight={40} wordmarkSize={20} />
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            fontSize: "16px", fontWeight: 600, color: "#5c3012",
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(200,100,50,0.22)",
            borderRadius: "10px", padding: "9px 22px", cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to dashboard
          </span>
        </button>
      </header>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "108px 24px 64px" }}>

        {fetching && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span style={{
              width: "28px", height: "28px",
              border: "3px solid rgba(234,88,12,0.15)", borderTopColor: "#ea580c",
              borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {error && (
          <p style={{ textAlign: "center", color: "#ef4444", padding: "80px 0" }}>{error}</p>
        )}

        {session && !fetching && (
          <>
            {/* Session header */}
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1c0800", margin: "0 0 6px" }}>
                Interview Session
              </h1>
              <p style={{ fontSize: "14px", color: "#7a4020", margin: 0 }}>
                {new Date(session.createdAt).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "32px" }}>
              {[
                { label: "Answers",    value: session.segmentCount.toString(),          color: "#1c0800" },
                { label: "Avg. Conf.", value: `${Math.round(session.avgConfidence)}%`,  color: session.avgConfidence >= 75 ? "#16a34a" : session.avgConfidence >= 50 ? "#d97706" : "#ef4444" },
                { label: "Avg. WPM",  value: Math.round(session.avgWpm).toString(),    color: session.avgWpm >= 100 && session.avgWpm <= 180 ? "#16a34a" : "#d97706" },
                { label: "Total words",value: session.totalWords.toString(),            color: "#1c0800" },
              ].map(s => (
                <div key={s.label} style={{ ...glassCard, padding: "14px 12px", textAlign: "center" }}>
                  <p style={{ ...labelStyle, margin: "0 0 6px" }}>{s.label}</p>
                  <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Segments */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {session.segments.map((seg, i) => {
                let analysis: FeedbackAnalysis | undefined
                try {
                  const parsed = JSON.parse(seg.feedback)
                  if (parsed && "expand" in parsed) analysis = parsed
                } catch {}

                const confColor  = seg.confidence >= 75 ? "#16a34a" : seg.confidence >= 50 ? "#d97706" : "#ef4444"
                const wpmColor   = seg.wpm >= 100 && seg.wpm <= 180 ? "#16a34a" : "#d97706"
                const fillerColor = seg.fillerRate <= 0.05 ? "#16a34a" : seg.fillerRate <= 0.1 ? "#d97706" : "#ef4444"

                return (
                  <div key={seg.id} style={{ ...glassCard, padding: "20px" }}>
                    <p style={{ ...labelStyle, marginBottom: "14px" }}>Answer {i + 1}</p>

                    {/* Metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      {[
                        { label: "WPM",        value: Math.round(seg.wpm).toString(),               color: wpmColor   },
                        { label: "Confidence", value: `${Math.round(seg.confidence)}%`,             color: confColor  },
                        { label: "Filler",     value: `${(seg.fillerRate * 100).toFixed(1)}%`,      color: fillerColor},
                      ].map(m => (
                        <div key={m.label} style={{
                          background: "rgba(255,255,255,0.45)",
                          border: "1px solid rgba(255,255,255,0.6)",
                          borderRadius: "10px", padding: "10px 8px", textAlign: "center",
                        }}>
                          <p style={{ ...labelStyle, margin: "0 0 4px" }}>{m.label}</p>
                          <p style={{ fontSize: "20px", fontWeight: 700, color: m.color, margin: 0 }}>{m.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Transcript */}
                    {seg.transcript && (
                      <div style={{
                        background: "rgba(255,255,255,0.38)",
                        border: "1px solid rgba(255,255,255,0.55)",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        marginBottom: "16px",
                      }}>
                        <p style={{ ...labelStyle, margin: "0 0 8px" }}>Transcript</p>
                        <p style={{ fontSize: "13px", color: "#2d1200", lineHeight: 1.65, margin: 0 }}>{seg.transcript}</p>
                      </div>
                    )}

                    {/* Feedback */}
                    {analysis ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { icon: "↑", label: "Mention more",          text: analysis.expand,        bg: "rgba(22,163,74,0.06)",   border: "rgba(22,163,74,0.22)",   lc: "#15803d", tc: "#14532d" },
                          { icon: "↓", label: "Mention less",          text: analysis.cut,           bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.22)",   lc: "#dc2626", tc: "#7f1d1d" },
                          { icon: "★", label: "Must mention",          text: analysis.must_mention,  bg: "rgba(234,88,12,0.06)",   border: "rgba(234,88,12,0.22)",   lc: "#c2410c", tc: "#7c2d12" },
                          ...(analysis.pace    ? [{ icon: "◎", label: "Speaking pace",         text: analysis.pace,          bg: "rgba(14,165,233,0.06)",  border: "rgba(14,165,233,0.22)",  lc: "#0284c7", tc: "#0c4a6e" }] : []),
                          ...(analysis.framing ? [{ icon: "✎", label: "Word choice & framing", text: analysis.framing,       bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.22)",  lc: "#d97706", tc: "#78350f" }] : []),
                          { icon: "⊞", label: "Structure (STAR)",      text: analysis.structure,     bg: "rgba(139,92,246,0.06)",  border: "rgba(139,92,246,0.22)",  lc: "#7c3aed", tc: "#4c1d95" },
                        ].map(s => (
                          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "10px", padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px", color: s.lc }}>{s.icon}</span>
                              <p style={{ fontSize: "10px", fontWeight: 700, color: s.lc, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{s.label}</p>
                            </div>
                            <p style={{ fontSize: "13px", color: s.tc, lineHeight: 1.6, margin: 0 }}>{s.text}</p>
                          </div>
                        ))}
                        <div style={{ background: "rgba(28,10,0,0.88)", borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,200,150,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>Key takeaway</p>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", lineHeight: 1.5, margin: 0 }}>{analysis.overall}</p>
                        </div>
                      </div>
                    ) : seg.feedback ? (
                      <div style={{ background: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: "10px", padding: "12px 14px" }}>
                        <p style={{ ...labelStyle, margin: "0 0 8px" }}>Feedback</p>
                        <p style={{ fontSize: "13px", color: "#2d1200", lineHeight: 1.65, margin: 0 }}>{seg.feedback}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
