"use client"
import type { Session } from "@/types"

interface Props { sessions: Session[] }

export default function SessionHistory({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "#9ca3af", textAlign: "center", padding: "32px 0", margin: 0 }}>
        No sessions yet. Start your first interview above.
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p style={{ fontSize: "13px", color: "#4b5563", margin: 0 }}>
              {s.segmentCount} segments · {s.totalWords} words · {Math.round(s.avgWpm)} WPM
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              fontSize: "20px", fontWeight: 700,
              color: s.avgConfidence >= 75 ? "#4f46e5" : s.avgConfidence >= 50 ? "#d97706" : "#ef4444",
            }}>
              {Math.round(s.avgConfidence)}%
            </span>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>conf.</span>
          </div>
        </div>
      ))}
    </div>
  )
}
