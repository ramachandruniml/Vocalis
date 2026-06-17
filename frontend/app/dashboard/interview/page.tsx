"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import { getInterviewQuestions } from "@/lib/api"
import Waveform from "@/components/Waveform"
import FeedbackPanel from "@/components/FeedbackPanel"
import type { InterviewQuestionsResponse, InterviewSegment } from "@/types"

const labelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, color: "#9ca3af",
  letterSpacing: "0.08em", textTransform: "uppercase",
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#0d0d0d",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #f0f0f0",
  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
}

export default function InterviewPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [segments, setSegments] = useState<InterviewSegment[]>([])
  const [jobType, setJobType] = useState("Software engineer")
  const [experienceLevel, setExperienceLevel] = useState("mid-level")
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["behavioral", "technical", "situational"])
  const [areaMenuOpen, setAreaMenuOpen] = useState(false)
  const areaRef = useRef<HTMLDivElement>(null)
  const [questions, setQuestions] = useState<string[]>([])
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

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
    setSegments((prev) => [...prev, seg])
  }, [])

  const { start, stop, recording, analyserRef, error } = useAudioCapture(token, handleSegment)

  const generateQuestions = useCallback(async () => {
    if (!token) return
    setQuestionLoading(true)
    setQuestionError(null)
    try {
      const data = await getInterviewQuestions(token, {
        jobType,
        experienceLevel,
        focusAreas: selectedAreas,
        count: 8,
      }) as InterviewQuestionsResponse
      setQuestions(data.questions)
      setActiveQuestion(0)
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Could not generate questions")
    } finally {
      setQuestionLoading(false)
    }
  }, [experienceLevel, selectedAreas, jobType, token])

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="28" height="20" viewBox="0 0 32 22" aria-hidden>
            <path d="M 1 21 A 15 15 0 0 1 31 21 Z" fill="#4f46e5"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "16px", color: "#111" }}>Vocalis</span>
          {recording && (
            <span className="flex items-center gap-1.5 animate-pulse" style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            fontSize: "13px", fontWeight: 500, color: "#6b7280",
            background: "none", border: "1px solid #e5e7eb",
            borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
          }}
        >
          Back to dashboard
        </button>
      </header>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]" style={{ flex: 1 }}>

        {/* Left column */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", borderRight: "1px solid #e5e7eb" }}>

          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0d0d0d", margin: "0 0 4px" }}>Practice Interview</h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Choose a job type, generate questions, then answer out loud.</p>
          </div>

          {/* Config panel */}
          <div style={card}>
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]" style={{ marginBottom: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={labelStyle}>Job type</span>
                <input
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="Nurse, product manager, teacher…"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#6366f1")}
                  onBlur={e  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={labelStyle}>Level</span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  style={{ ...inputStyle, appearance: "auto" }}
                  onFocus={e => (e.target.style.borderColor = "#6366f1")}
                  onBlur={e  => (e.target.style.borderColor = "#e5e7eb")}
                >
                  <option value="entry-level">Entry-level</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="leadership">Leadership</option>
                </select>
              </label>
            </div>
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
                    borderColor: areaMenuOpen ? "#6366f1" : "#e5e7eb",
                  }}
                >
                  <span style={{ color: selectedAreas.length ? "#0d0d0d" : "#9ca3af", fontSize: "14px" }}>
                    {selectedAreas.length
                      ? selectedAreas.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")
                      : "Select focus areas…"}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: areaMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {areaMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                    background: "#fff", border: "1.5px solid #6366f1", borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden",
                  }}>
                    {[
                      { label: "Behavioral",    value: "behavioral" },
                      { label: "Situational",   value: "situational" },
                      { label: "Technical",     value: "technical" },
                      { label: "Problem Solving", value: "problem solving" },
                      { label: "Leadership",    value: "leadership" },
                      { label: "Communication", value: "communication" },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 14px", cursor: "pointer", fontSize: "14px", color: "#0d0d0d",
                          background: selectedAreas.includes(opt.value) ? "rgba(99,102,241,0.06)" : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes(opt.value)}
                          onChange={() => toggleArea(opt.value)}
                          style={{ accentColor: "#6366f1", width: "15px", height: "15px", flexShrink: 0 }}
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
              disabled={!token || questionLoading || jobType.trim().length < 2}
              style={{
                width: "100%", padding: "11px",
                background: "#111", color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600,
                cursor: (!token || questionLoading || jobType.trim().length < 2) ? "not-allowed" : "pointer",
                opacity: (!token || questionLoading || jobType.trim().length < 2) ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
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
              <p style={{ fontSize: "15px", color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>
                {questionLoading
                  ? "Generating questions tailored to your role…"
                  : "Configure your role above and click Generate questions to begin."}
              </p>
            ) : (
              <p style={{ fontSize: "18px", fontWeight: 700, color: "#0d0d0d", lineHeight: 1.4, margin: 0 }}>
                {questions[activeQuestion]}
              </p>
            )}
            {questions.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                  onClick={() => setActiveQuestion((c) => Math.max(0, c - 1))}
                  disabled={activeQuestion === 0}
                  style={{ fontSize: "13px", color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", opacity: activeQuestion === 0 ? 0.3 : 1 }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>{activeQuestion + 1} / {questions.length}</span>
                <button
                  onClick={() => setActiveQuestion((c) => Math.min(questions.length - 1, c + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  style={{ fontSize: "13px", color: "#6b7280", background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", opacity: activeQuestion === questions.length - 1 ? 0.3 : 1 }}
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
          <div style={{ display: "flex", gap: "12px" }}>
            {!recording ? (
              <button
                onClick={start}
                style={{ flex: 1, padding: "13px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Start recording
              </button>
            ) : (
              <button
                onClick={stop}
                style={{ flex: 1, padding: "13px", background: "none", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Stop recording
              </button>
            )}
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "12px 16px" }}>
              {error}
            </p>
          )}

          {segments.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={card}>
                <p style={labelStyle}>Segments</p>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#0d0d0d", margin: "4px 0 0" }}>{segments.length}</p>
              </div>
              <div style={{ ...card, borderColor: "rgba(99,102,241,0.2)" }}>
                <p style={labelStyle}>Avg Confidence</p>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#4f46e5", margin: "4px 0 0" }}>
                  {Math.round(segments.reduce((a, s) => a + s.confidence_score, 0) / segments.length)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ padding: "32px", overflowY: "auto" }}>
          <p style={{ ...labelStyle, marginBottom: "20px" }}>Question Set</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
            {questions.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: 1.6 }}>
                {questionLoading ? "Generating…" : "Click \"Generate questions\" to create a personalized set for your role and level."}
              </p>
            ) : questions.map((question, index) => (
              <button
                key={`${question}-${index}`}
                onClick={() => setActiveQuestion(index)}
                style={{
                  textAlign: "left", borderRadius: "10px", padding: "12px 14px",
                  fontSize: "13px", cursor: "pointer",
                  background: activeQuestion === index ? "rgba(99,102,241,0.06)" : "#fff",
                  border: activeQuestion === index ? "1.5px solid rgba(99,102,241,0.35)" : "1px solid #e5e7eb",
                  color: activeQuestion === index ? "#3730a3" : "#4b5563",
                }}
              >
                <span style={{ display: "block", ...labelStyle, marginBottom: "4px" }}>Question {index + 1}</span>
                <span style={{ lineHeight: 1.5 }}>{question}</span>
              </button>
            ))}
          </div>

          <p style={{ ...labelStyle, marginBottom: "20px" }}>Real-time Analysis</p>
          <FeedbackPanel segments={segments} />
        </div>
      </div>
    </div>
  )
}
