"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import { getInterviewQuestions, saveSession } from "@/lib/api"
import type { SaveSegment } from "@/lib/api"
import Waveform from "@/components/Waveform"
import FeedbackPanel from "@/components/FeedbackPanel"
import type { InterviewQuestionsResponse, InterviewSegment } from "@/types"

/* ── Shared style tokens ───────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, color: "#9a6040",
  letterSpacing: "0.08em", textTransform: "uppercase",
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "10px 14px",
  border: "1.5px solid rgba(200,100,50,0.18)",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#1c0800",
  background: "rgba(255,255,255,0.72)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.16s, box-shadow 0.16s",
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid rgba(255,255,255,0.65)",
  boxShadow: "0 4px 24px rgba(180,60,10,0.07), 0 1px 4px rgba(0,0,0,0.03)",
}

const focusOn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "rgba(234,88,12,0.5)"
  e.target.style.boxShadow   = "0 0 0 3px rgba(234,88,12,0.10)"
}
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "rgba(200,100,50,0.18)"
  e.target.style.boxShadow   = "none"
}

/* ── Page ──────────────────────────────────────────────────── */

export default function InterviewPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()

  const [questionAnswers, setQuestionAnswers]     = useState<Record<number, InterviewSegment>>({})
  const [viewingAnalysisFor, setViewingAnalysisFor] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [jobType,         setJobType]         = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [selectedAreas,   setSelectedAreas]   = useState<string[]>([])
  const [areaMenuOpen,    setAreaMenuOpen]    = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)

  const [questions,       setQuestions]       = useState<string[]>([])
  const [activeQuestion,  setActiveQuestion]  = useState(0)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError,   setQuestionError]   = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node))
        setAreaMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggleArea = (val: string) =>
    setSelectedAreas(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val])

  const handleSegment = useCallback((seg: InterviewSegment) => {
    const qIdx = seg.questionIndex ?? activeQuestion
    setQuestionAnswers(prev => ({ ...prev, [qIdx]: seg }))
    setViewingAnalysisFor(qIdx)
  }, [activeQuestion])

  const { start, stop, recording, analyzing, analyserRef, error, elapsedSeconds } = useAudioCapture(token, handleSegment)

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const generateQuestions = useCallback(async () => {
    if (!token) return
    setQuestionLoading(true)
    setQuestionError(null)
    try {
      const data = await getInterviewQuestions(token, {
        jobType, experienceLevel, focusAreas: selectedAreas, count: 8,
      }) as InterviewQuestionsResponse
      setQuestions(data.questions)
      setActiveQuestion(0)
      setQuestionAnswers({})
      setViewingAnalysisFor(null)
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Could not generate questions")
    } finally {
      setQuestionLoading(false)
    }
  }, [experienceLevel, selectedAreas, jobType, token])

  const answeredCount = Object.keys(questionAnswers).length

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>

      {/* Header — fixed so it's always pinned to the very top */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="28" height="20" viewBox="0 0 32 22" aria-hidden>
            <path d="M 1 21 A 15 15 0 0 1 31 21 Z" fill="#ea580c"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#1c0800" }}>Vocalis</span>
          {recording && (
            <span style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "blink 1s ease-in-out infinite" }} />
              LIVE
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {questions.length > 0 && (
            <span style={{ fontSize: "13px", color: "#9a6040" }}>
              {answeredCount} / {questions.length} answered
            </span>
          )}
          <button
            disabled={saving}
            onClick={async () => {
              const segs = Object.values(questionAnswers)
              if (segs.length > 0 && token) {
                setSaving(true)
                try {
                  const toSave: SaveSegment[] = segs.map(s => ({
                    transcript: s.transcript,
                    confidence: s.confidence_score,
                    wpm: s.features.wpm,
                    fillerRate: s.features.filler_rate,
                    fillerWords: s.features.filler_words,
                    uniqueWordRatio: s.features.unique_word_ratio,
                    feedback: typeof s.feedback === "string"
                      ? s.feedback
                      : JSON.stringify(s.feedback),
                  }))
                  await saveSession(token, toSave)
                } catch { /* navigate anyway */ }
                setSaving(false)
              }
              router.push("/dashboard")
            }}
            style={{
              fontSize: "13px", fontWeight: 500, color: "#5c3012",
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,100,50,0.22)",
              borderRadius: "8px", padding: "6px 14px", cursor: saving ? "wait" : "pointer",
              backdropFilter: "blur(8px)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Back to dashboard"}
          </button>
        </div>
      </header>

      {/* Spacer so content starts below the fixed header */}
      <div style={{ height: "60px", flexShrink: 0 }} />

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]" style={{ flex: 1 }}>

        {/* Left column */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", borderRight: "1px solid rgba(200,100,50,0.16)" }}>

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1c0800", margin: "0 0 4px" }}>Practice Interview</h1>
            <p style={{ fontSize: "14px", color: "#7a4020", margin: 0 }}>Choose a job type, generate questions, then answer out loud.</p>
          </div>

          {/* Config panel — needs position+zIndex so the focus-area dropdown floats above subsequent cards */}
          <div style={{ ...card, position: "relative", zIndex: 2 }}>
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]" style={{ marginBottom: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={labelStyle}>Job type</span>
                <input
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="e.g. Nurse, product manager, teacher…"
                  style={inputStyle}
                  onFocus={focusOn}
                  onBlur={focusOff}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={labelStyle}>Level</span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  style={{ ...inputStyle, appearance: "auto", color: experienceLevel ? "#1c0800" : "rgba(154,96,64,0.5)" }}
                  onFocus={focusOn}
                  onBlur={focusOff}
                >
                  <option value="" disabled>Pick level…</option>
                  <option value="entry-level">Entry-level</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="leadership">Leadership</option>
                </select>
              </label>
            </div>

            {/* Focus areas dropdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              <span style={labelStyle}>Focus areas</span>
              <div ref={areaRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setAreaMenuOpen(o => !o)}
                  style={{
                    ...inputStyle,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", textAlign: "left",
                    borderColor: areaMenuOpen ? "rgba(234,88,12,0.5)" : "rgba(200,100,50,0.18)",
                    boxShadow: areaMenuOpen ? "0 0 0 3px rgba(234,88,12,0.10)" : "none",
                  }}
                >
                  <span style={{ color: selectedAreas.length ? "#1c0800" : "rgba(154,96,64,0.5)", fontSize: "14px" }}>
                    {selectedAreas.length
                      ? selectedAreas.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")
                      : "Choose style…"}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(154,96,64,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: areaMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {areaMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
                    background: "rgba(255,255,255,0.82)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    border: "1.5px solid rgba(234,88,12,0.28)",
                    borderRadius: "10px",
                    boxShadow: "0 8px 32px rgba(180,60,10,0.12)",
                    overflow: "hidden",
                  }}>
                    {[
                      { label: "Behavioral",      value: "behavioral" },
                      { label: "Situational",     value: "situational" },
                      { label: "Technical",       value: "technical" },
                      { label: "Problem Solving", value: "problem solving" },
                      { label: "Leadership",      value: "leadership" },
                      { label: "Communication",   value: "communication" },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 14px", cursor: "pointer", fontSize: "14px", color: "#1c0800",
                          background: selectedAreas.includes(opt.value) ? "rgba(234,88,12,0.07)" : "transparent",
                          transition: "background 0.12s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes(opt.value)}
                          onChange={() => toggleArea(opt.value)}
                          style={{ accentColor: "#ea580c", width: "15px", height: "15px", flexShrink: 0 }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={!token || questionLoading || jobType.trim().length < 2 || !experienceLevel}
              style={{
                width: "100%", padding: "11px",
                background: "rgba(28,10,0,0.88)", color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600,
                cursor: (!token || questionLoading || jobType.trim().length < 2 || !experienceLevel) ? "not-allowed" : "pointer",
                opacity: (!token || questionLoading || jobType.trim().length < 2 || !experienceLevel) ? 0.45 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 18px rgba(28,10,0,0.20)",
                transition: "opacity 0.16s",
              }}
            >
              {questionLoading && (
                <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
              )}
              {questionLoading ? "Generating…" : questions.length > 0 ? "Regenerate questions" : "Generate questions"}
            </button>

            {questionError && (
              <p style={{ fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "8px 12px", marginTop: "12px" }}>
                {questionError}
              </p>
            )}
          </div>

          {/* Current question */}
          <div style={card}>
            <p style={{ ...labelStyle, marginBottom: "12px" }}>Current question</p>
            {questions.length === 0 ? (
              <p style={{ fontSize: "15px", color: "#9a6040", lineHeight: 1.6, margin: 0 }}>
                {questionLoading
                  ? "Generating questions tailored to your role…"
                  : "Configure your role above and click Generate questions to begin."}
              </p>
            ) : (
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#1c0800", lineHeight: 1.4, margin: 0 }}>
                {questions[activeQuestion]}
              </p>
            )}
            {questions.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                  onClick={() => setActiveQuestion(c => Math.max(0, c - 1))}
                  disabled={activeQuestion === 0}
                  style={{
                    fontSize: "13px", color: "#5c3012",
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(200,100,50,0.22)",
                    borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                    opacity: activeQuestion === 0 ? 0.3 : 1,
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "13px", color: "#9a6040" }}>{activeQuestion + 1} / {questions.length}</span>
                <button
                  onClick={() => setActiveQuestion(c => Math.min(questions.length - 1, c + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  style={{
                    fontSize: "13px", color: "#5c3012",
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(200,100,50,0.22)",
                    borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                    opacity: activeQuestion === questions.length - 1 ? 0.3 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Waveform */}
          <div style={card}>
            <p style={{ ...labelStyle, marginBottom: "16px" }}>Audio Input</p>
            <Waveform analyserRef={analyserRef} active={recording} />
          </div>

          {/* Record controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              {!recording ? (
                <button
                  onClick={() => start(questions[activeQuestion] || "", activeQuestion)}
                  disabled={questions.length === 0 || analyzing}
                  style={{
                    flex: 1, padding: "13px",
                    background: questions.length === 0 || analyzing ? "rgba(200,100,50,0.25)" : "rgba(28,10,0,0.88)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    fontSize: "14px", fontWeight: 600,
                    cursor: questions.length === 0 || analyzing ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 4px 18px rgba(28,10,0,0.18)",
                    transition: "opacity 0.16s, background 0.16s",
                  }}
                >
                  {analyzing && (
                    <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                  )}
                  {analyzing ? "Analyzing…" : questionAnswers[activeQuestion] ? "Re-record answer" : "Start recording"}
                </button>
              ) : (
                <button
                  onClick={stop}
                  style={{
                    flex: 1, padding: "13px",
                    background: "rgba(255,255,255,0.62)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    color: "#ef4444",
                    border: "1.5px solid rgba(239,68,68,0.45)",
                    borderRadius: "10px",
                    fontSize: "14px", fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    boxShadow: "0 2px 12px rgba(239,68,68,0.12)",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "blink 1s ease-in-out infinite", flexShrink: 0 }} />
                  Stop recording
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#ef4444", opacity: 0.85 }}>
                    {formatTime(elapsedSeconds)}
                  </span>
                </button>
              )}
            </div>

            {recording && (
              <p style={{ fontSize: "12px", color: "#7a4020", textAlign: "center", margin: 0 }}>
                Recording question {activeQuestion + 1} — take your time, click Stop whenever you&apos;re done.
              </p>
            )}

            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)", borderRadius: "10px", padding: "12px 14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: "13px", color: "#dc2626", margin: 0, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Question list */}
          <div>
            <p style={{ ...labelStyle, marginBottom: "12px" }}>Question Set</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {questions.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#9a6040", lineHeight: 1.6 }}>
                  {questionLoading ? "Generating…" : "Click \"Generate questions\" to create a personalized set for your role and level."}
                </p>
              ) : questions.map((question, index) => {
                const isAnswered = !!questionAnswers[index]
                const isActive   = activeQuestion === index
                return (
                  <button
                    key={`${question}-${index}`}
                    onClick={() => {
                      setActiveQuestion(index)
                      setViewingAnalysisFor(isAnswered ? index : viewingAnalysisFor)
                    }}
                    style={{
                      textAlign: "left", borderRadius: "10px", padding: "12px 14px",
                      fontSize: "13px", cursor: "pointer",
                      background: isActive
                        ? "rgba(234,88,12,0.08)"
                        : "rgba(255,255,255,0.52)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: isActive
                        ? "1.5px solid rgba(234,88,12,0.32)"
                        : "1px solid rgba(255,255,255,0.62)",
                      color: isActive ? "#9a3412" : "#4a2810",
                      transition: "background 0.14s, border-color 0.14s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ ...labelStyle, color: isActive ? "#ea580c" : "#9a6040" }}>Question {index + 1}</span>
                      {isAnswered && (
                        <span style={{
                          fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                          color: "#16a34a", background: "rgba(22,163,74,0.10)",
                          border: "1px solid rgba(22,163,74,0.25)",
                          borderRadius: "100px", padding: "2px 8px",
                        }}>
                          Answered
                        </span>
                      )}
                    </div>
                    <span style={{ lineHeight: 1.5 }}>{question}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Analysis panel */}
          <div>
            <p style={{ ...labelStyle, marginBottom: "12px" }}>Analysis</p>
            <FeedbackPanel
              segment={viewingAnalysisFor !== null ? (questionAnswers[viewingAnalysisFor] ?? null) : null}
              questionIndex={viewingAnalysisFor}
              questionText={viewingAnalysisFor !== null ? (questions[viewingAnalysisFor] ?? "") : ""}
              analyzing={analyzing}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  )
}
