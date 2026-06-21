import type { InterviewSegment, FeedbackAnalysis } from "@/types"

interface Props {
  segment: InterviewSegment | null
  questionIndex: number | null
  questionText: string
  analyzing?: boolean
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "14px",
  boxShadow: "0 4px 20px rgba(180,60,10,0.07), 0 1px 4px rgba(0,0,0,0.03)",
}

export default function FeedbackPanel({ segment, questionIndex, questionText, analyzing }: Props) {
  if (analyzing) {
    return (
      <div style={{ ...glassCard, padding: "36px 24px", textAlign: "center" }}>
        <div style={{
          width: "32px", height: "32px",
          border: "3px solid rgba(234,88,12,0.18)",
          borderTopColor: "#ea580c",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 14px",
        }} />
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1c0800", margin: "0 0 4px" }}>Analyzing your answer…</p>
        <p style={{ fontSize: "12px", color: "#9a6040", margin: 0 }}>Groq is reviewing your response against FAANG interview standards.</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!segment) {
    return (
      <div style={{ ...glassCard, padding: "36px 24px", textAlign: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,100,50,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", display: "block" }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#9a6040", margin: "0 0 6px" }}>No analysis yet</p>
        <p style={{ fontSize: "12px", color: "rgba(154,96,64,0.65)", margin: 0, lineHeight: 1.5 }}>
          {questionIndex !== null
            ? "Click Start recording to answer this question."
            : "Select a question and record your answer to see detailed FAANG-style coaching."}
        </p>
      </div>
    )
  }

  const { transcript, features, confidence_score, analysis } = segment
  const fillerPct  = (features.filler_rate * 100).toFixed(1)
  const fillerWords = [...new Set(features.filler_words)]

  const confColor = confidence_score >= 75 ? "#16a34a" : confidence_score >= 50 ? "#d97706" : "#ef4444"
  const confNote  = confidence_score >= 75 ? "Strong"  : confidence_score >= 50 ? "Fair"   : "Needs work"
  const wpmColor  = features.wpm >= 100 && features.wpm <= 180 ? "#16a34a" : "#d97706"
  const wpmNote   = features.wpm < 100 ? "Slow" : features.wpm > 180 ? "Fast" : "Good"
  const fillerColor = features.filler_rate <= 0.05 ? "#16a34a" : features.filler_rate <= 0.1 ? "#d97706" : "#ef4444"
  const fillerNote  = features.filler_rate <= 0.05 ? "Low"  : features.filler_rate <= 0.1 ? "Moderate" : "High"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Question reference */}
      {questionText && (
        <div style={{ ...glassCard, padding: "14px 16px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9a6040", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Question {questionIndex !== null ? questionIndex + 1 : ""}
          </p>
          <p style={{ fontSize: "13px", color: "#1c0800", lineHeight: 1.5, margin: 0 }}>{questionText}</p>
        </div>
      )}

      {/* Speech metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {[
          { label: "WPM",        value: Math.round(features.wpm).toString(), note: wpmNote,    color: wpmColor   },
          { label: "Confidence", value: `${confidence_score}%`,              note: confNote,   color: confColor  },
          { label: "Filler",     value: `${fillerPct}%`,                     note: fillerNote, color: fillerColor},
        ].map(m => (
          <div key={m.label} style={{ ...glassCard, padding: "12px 10px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#9a6040", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>{m.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: m.color, margin: "0 0 2px" }}>{m.value}</p>
            <p style={{ fontSize: "10px", color: m.color, margin: 0, opacity: 0.75 }}>{m.note}</p>
          </div>
        ))}
      </div>

      {/* Filler words used */}
      {fillerWords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#9a6040" }}>Filler words used:</span>
          {fillerWords.map(w => (
            <span key={w} style={{
              fontSize: "11px", fontFamily: "monospace",
              background: "rgba(245,158,11,0.12)", color: "#92400e",
              border: "1px solid rgba(245,158,11,0.28)",
              borderRadius: "4px", padding: "2px 7px",
            }}>{w}</span>
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={{
          background: "rgba(255,255,255,0.40)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.58)",
          borderRadius: "12px",
          padding: "14px 16px",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9a6040", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>What you said</p>
          <p style={{ fontSize: "13px", color: "#2d1200", lineHeight: 1.65, margin: 0 }}>{transcript}</p>
        </div>
      )}

      {/* Structured feedback */}
      {analysis ? (
        <StructuredAnalysis analysis={analysis} />
      ) : (
        <div style={{ ...glassCard, padding: "14px 16px" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#9a6040", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>AI Coaching</p>
          <p style={{ fontSize: "13px", color: "#2d1200", lineHeight: 1.65, margin: 0 }}>{segment.feedback}</p>
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
      bg: "rgba(22,163,74,0.06)",
      border: "rgba(22,163,74,0.22)",
      labelColor: "#15803d",
      textColor: "#14532d",
    },
    {
      icon: "↓",
      label: "Mention less",
      text: analysis.cut,
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.22)",
      labelColor: "#dc2626",
      textColor: "#7f1d1d",
    },
    {
      icon: "★",
      label: "Must mention",
      text: analysis.must_mention,
      bg: "rgba(234,88,12,0.06)",
      border: "rgba(234,88,12,0.22)",
      labelColor: "#c2410c",
      textColor: "#7c2d12",
    },
    ...(analysis.pace ? [{
      icon: "◎",
      label: "Speaking pace",
      text: analysis.pace,
      bg: "rgba(14,165,233,0.06)",
      border: "rgba(14,165,233,0.22)",
      labelColor: "#0284c7",
      textColor: "#0c4a6e",
    }] : []),
    ...(analysis.framing ? [{
      icon: "✎",
      label: "Word choice & framing",
      text: analysis.framing,
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.22)",
      labelColor: "#d97706",
      textColor: "#78350f",
    }] : []),
    {
      icon: "⊞",
      label: "Structure (STAR method)",
      text: analysis.structure,
      bg: "rgba(139,92,246,0.06)",
      border: "rgba(139,92,246,0.22)",
      labelColor: "#7c3aed",
      textColor: "#4c1d95",
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sections.map(s => (
        <div key={s.label} style={{
          background: s.bg,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${s.border}`,
          borderRadius: "12px",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: s.labelColor }}>{s.icon}</span>
            <p style={{ fontSize: "11px", fontWeight: 700, color: s.labelColor, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{s.label}</p>
          </div>
          <p style={{ fontSize: "13px", color: s.textColor, lineHeight: 1.65, margin: 0 }}>{s.text}</p>
        </div>
      ))}

      {/* Key takeaway */}
      <div style={{
        background: "rgba(28,10,0,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "12px",
        padding: "16px 18px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,200,150,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Key takeaway
        </p>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", lineHeight: 1.55, margin: 0 }}>{analysis.overall}</p>
      </div>
    </div>
  )
}
