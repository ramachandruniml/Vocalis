import type { InterviewSegment, FeedbackAnalysis } from "@/types"

interface Props {
  segment: InterviewSegment | null
  questionIndex: number | null
  questionText: string
  analyzing?: boolean
}

export default function FeedbackPanel({ segment, questionIndex, questionText, analyzing }: Props) {
  if (analyzing) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: "16px",
        padding: "36px 24px",
        textAlign: "center",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          width: "32px", height: "32px",
          border: "3px solid #e5e7eb",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 14px",
        }} />
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Analyzing your answer…</p>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Groq is reviewing your response against FAANG interview standards.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!segment) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: "16px",
        padding: "36px 24px",
        textAlign: "center",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#9ca3af", margin: "0 0 6px" }}>No analysis yet</p>
        <p style={{ fontSize: "12px", color: "#d1d5db", margin: 0, lineHeight: 1.5 }}>
          {questionIndex !== null
            ? "Click Start recording to answer this question."
            : "Select a question and record your answer to see detailed FAANG-style coaching."}
        </p>
      </div>
    )
  }

  const { transcript, features, confidence_score, analysis } = segment
  const fillerPct = (features.filler_rate * 100).toFixed(1)
  const fillerWords = [...new Set(features.filler_words)]

  const confColor = confidence_score >= 75 ? "#10b981" : confidence_score >= 50 ? "#f59e0b" : "#ef4444"
  const confNote  = confidence_score >= 75 ? "Strong" : confidence_score >= 50 ? "Fair" : "Needs work"
  const wpmColor  = features.wpm >= 100 && features.wpm <= 180 ? "#10b981" : "#f59e0b"
  const wpmNote   = features.wpm < 100 ? "Slow" : features.wpm > 180 ? "Fast" : "Good"
  const fillerColor = features.filler_rate <= 0.05 ? "#10b981" : features.filler_rate <= 0.1 ? "#f59e0b" : "#ef4444"
  const fillerNote  = features.filler_rate <= 0.05 ? "Low" : features.filler_rate <= 0.1 ? "Moderate" : "High"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Question reference */}
      {questionText && (
        <div style={{
          background: "#fff", border: "1px solid #f0f0f0", borderRadius: "12px",
          padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Question {questionIndex !== null ? questionIndex + 1 : ""}
          </p>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5, margin: 0 }}>{questionText}</p>
        </div>
      )}

      {/* Speech metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[
          { label: "WPM",         value: Math.round(features.wpm).toString(), note: wpmNote,   color: wpmColor },
          { label: "Confidence",  value: `${confidence_score}%`,              note: confNote,  color: confColor },
          { label: "Filler",      value: `${fillerPct}%`,                     note: fillerNote, color: fillerColor },
        ].map(m => (
          <div key={m.label} style={{
            background: "#fff", border: "1px solid #f0f0f0", borderRadius: "10px",
            padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>{m.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: m.color, margin: "0 0 2px" }}>{m.value}</p>
            <p style={{ fontSize: "10px", color: m.color, margin: 0, opacity: 0.75 }}>{m.note}</p>
          </div>
        ))}
      </div>

      {/* Filler words used */}
      {fillerWords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af" }}>Filler words used:</span>
          {fillerWords.map(w => (
            <span key={w} style={{
              fontSize: "11px", fontFamily: "monospace",
              background: "rgba(245,158,11,0.1)", color: "#b45309",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "4px", padding: "2px 7px",
            }}>{w}</span>
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={{
          background: "#fafafa", border: "1px solid #f0f0f0",
          borderRadius: "12px", padding: "14px 16px",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>What you said</p>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.65, margin: 0 }}>{transcript}</p>
        </div>
      )}

      {/* Structured FAANG feedback */}
      {analysis ? (
        <StructuredAnalysis analysis={analysis} />
      ) : (
        <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px 16px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>AI Coaching</p>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.65, margin: 0 }}>{segment.feedback}</p>
        </div>
      )}
    </div>
  )
}

function StructuredAnalysis({ analysis }: { analysis: FeedbackAnalysis }) {
  const sections = [
    {
      icon: "↑",
      label: "Mention more",
      text: analysis.expand,
      bg: "rgba(16,185,129,0.05)",
      border: "rgba(16,185,129,0.2)",
      labelColor: "#059669",
      textColor: "#065f46",
    },
    {
      icon: "↓",
      label: "Mention less",
      text: analysis.cut,
      bg: "rgba(239,68,68,0.05)",
      border: "rgba(239,68,68,0.2)",
      labelColor: "#dc2626",
      textColor: "#7f1d1d",
    },
    {
      icon: "★",
      label: "Must mention",
      text: analysis.must_mention,
      bg: "rgba(99,102,241,0.05)",
      border: "rgba(99,102,241,0.2)",
      labelColor: "#4f46e5",
      textColor: "#312e81",
    },
    ...(analysis.pace ? [{
      icon: "◎",
      label: "Speaking pace",
      text: analysis.pace,
      bg: "rgba(14,165,233,0.05)",
      border: "rgba(14,165,233,0.2)",
      labelColor: "#0284c7",
      textColor: "#0c4a6e",
    }] : []),
    ...(analysis.framing ? [{
      icon: "✎",
      label: "Word choice & framing",
      text: analysis.framing,
      bg: "rgba(245,158,11,0.05)",
      border: "rgba(245,158,11,0.2)",
      labelColor: "#d97706",
      textColor: "#78350f",
    }] : []),
    {
      icon: "⊞",
      label: "Structure (STAR method)",
      text: analysis.structure,
      bg: "rgba(139,92,246,0.05)",
      border: "rgba(139,92,246,0.2)",
      labelColor: "#7c3aed",
      textColor: "#4c1d95",
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sections.map(s => (
        <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "12px", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: s.labelColor }}>{s.icon}</span>
            <p style={{ fontSize: "11px", fontWeight: 700, color: s.labelColor, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{s.label}</p>
          </div>
          <p style={{ fontSize: "13px", color: s.textColor, lineHeight: 1.65, margin: 0 }}>{s.text}</p>
        </div>
      ))}

      {/* Key takeaway — dark card for emphasis */}
      <div style={{ background: "#0f0f11", borderRadius: "12px", padding: "16px 18px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Key takeaway
        </p>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", lineHeight: 1.55, margin: 0 }}>{analysis.overall}</p>
      </div>
    </div>
  )
}
