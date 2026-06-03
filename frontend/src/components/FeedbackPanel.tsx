import { InterviewMessage } from "../types"
import MetricCard from "./MetricCard"

interface Props {
  messages: InterviewMessage[]
}

export default function FeedbackPanel({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "3rem 1rem" }}>
        Start speaking — feedback will appear here.
      </div>
    )
  }

  const latest = messages[messages.length - 1]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
        <MetricCard label="WPM" value={latest.features.wpm} sub="words/min" accent />
        <MetricCard label="Confidence" value={`${latest.confidence_score}%`} accent />
        <MetricCard label="Filler Rate" value={`${(latest.features.filler_rate * 100).toFixed(1)}%`} sub="of words" />
      </div>

      {/* Filler words used */}
      {latest.features.filler_words.length > 0 && (
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            Filler words detected
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {[...new Set(latest.features.filler_words)].map((w) => (
              <span key={w} style={{
                padding: "0.2rem 0.5rem",
                background: "rgba(255,189,46,0.1)",
                border: "1px solid rgba(255,189,46,0.2)",
                borderRadius: "4px",
                fontSize: "0.75rem",
                color: "var(--warning)",
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback */}
      <div style={{
        background: "var(--accent-bg)",
        border: "1px solid rgba(200,245,100,0.15)",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
      }}>
        <p style={{ fontSize: "0.7rem", color: "var(--accent-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
          AI Feedback
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
          {latest.feedback}
        </p>
      </div>

      {/* Transcript history */}
      <div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
          Transcript History
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "240px", overflowY: "auto" }}>
          {[...messages].reverse().map((m, i) => (
            <div key={i} style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}>
              <span style={{ color: "var(--text-muted)", marginRight: "0.5rem" }}>
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
              {m.transcript}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}