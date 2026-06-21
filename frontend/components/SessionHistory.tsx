"use client"
import Link from "next/link"
import type { Session } from "@/types"

interface Props { sessions: Session[] }

export default function SessionHistory({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "#9a6040", textAlign: "center", padding: "32px 0", margin: 0 }}>
        No sessions yet. Start your first interview above.
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sessions.map((s) => {
        const confColor = s.avgConfidence >= 75 ? "#16a34a" : s.avgConfidence >= 50 ? "#d97706" : "#ef4444"
        return (
          <Link
            key={s.id}
            href={`/dashboard/session/${s.id}`}
            style={{ textDecoration: "none" }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px",
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.62)",
              borderRadius: "10px",
              boxShadow: "0 2px 12px rgba(180,60,10,0.06)",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = "rgba(255,255,255,0.72)"
              el.style.borderColor = "rgba(234,88,12,0.25)"
              el.style.boxShadow = "0 4px 20px rgba(180,60,10,0.11)"
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = "rgba(255,255,255,0.5)"
              el.style.borderColor = "rgba(255,255,255,0.62)"
              el.style.boxShadow = "0 2px 12px rgba(180,60,10,0.06)"
            }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <p style={{ fontSize: "12px", color: "#9a6040", margin: 0 }}>
                  {new Date(s.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p style={{ fontSize: "13px", color: "#4a2810", margin: 0 }}>
                  {s.segmentCount} {s.segmentCount === 1 ? "answer" : "answers"} · {s.totalWords} words · {Math.round(s.avgWpm)} WPM
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: confColor }}>
                    {Math.round(s.avgConfidence)}%
                  </span>
                  <span style={{ fontSize: "11px", color: "#9a6040" }}>conf.</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(154,96,64,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
