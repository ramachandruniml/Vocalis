import { useState, useCallback } from "react"
import { useAudioCapture } from "../hooks/useAudioCapture"
import Waveform from "../components/Waveform"
import FeedbackPanel from "../components/FeedbackPanel"
import { InterviewMessage } from "../types"

interface Props {
  token: string
  onLogout: () => void
}

export default function Interview({ token, onLogout }: Props) {
  const [messages, setMessages] = useState<InterviewMessage[]>([])

  const handleMessage = useCallback((msg: InterviewMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const { start, stop, recording, analyserRef, error } = useAudioCapture(token, handleMessage)

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-panel)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", background: "var(--accent)", color: "#0a0a0a",
            borderRadius: "6px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.8rem",
          }}>IC</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem" }}>
            InterviewCoach
          </span>
          {recording && (
            <span style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.7rem", color: "var(--danger)",
              animation: "pulse 1.5s ease infinite",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
              LIVE
            </span>
          )}
        </div>
        <button onClick={onLogout} style={{
          background: "transparent", border: "1px solid var(--border)", borderRadius: "6px",
          color: "var(--text-secondary)", padding: "0.4rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
        }}>
          Logout
        </button>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 420px", gap: 0 }}>
        {/* Left — audio panel */}
        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", borderRight: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.4rem" }}>
              Mock Interview Session
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Speak naturally. Your audio is analyzed every 5 seconds.
            </p>
          </div>

          {/* Waveform */}
          <div style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "1.5rem",
          }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
              Audio Input
            </p>
            <Waveform analyserRef={analyserRef} active={recording} />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "1rem" }}>
            {!recording ? (
              <button onClick={start} style={{
                flex: 1, padding: "0.875rem", background: "var(--accent)", color: "#0a0a0a",
                border: "none", borderRadius: "8px", fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                transition: "opacity 0.15s",
              }}>
                Start Interview
              </button>
            ) : (
              <button onClick={stop} style={{
                flex: 1, padding: "0.875rem", background: "transparent",
                color: "var(--danger)", border: "1px solid var(--danger)",
                borderRadius: "8px", fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
              }}>
                Stop
              </button>
            )}
          </div>

          {error && (
            <p style={{ fontSize: "0.8rem", color: "var(--danger)", padding: "0.5rem 0.75rem", background: "rgba(255,95,87,0.08)", border: "1px solid rgba(255,95,87,0.2)", borderRadius: "6px" }}>
              {error}
            </p>
          )}

          {/* Session stats */}
          {messages.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Segments</p>
                <p style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700 }}>{messages.length}</p>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg Confidence</p>
                <p style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)" }}>
                  {Math.round(messages.reduce((a, m) => a + m.confidence_score, 0) / messages.length)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right — feedback panel */}
        <div style={{ padding: "2rem", overflowY: "auto" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.5rem" }}>
            Real-time Analysis
          </p>
          <FeedbackPanel messages={messages} />
        </div>
      </div>
    </div>
  )
}