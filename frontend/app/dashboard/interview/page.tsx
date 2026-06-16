"use client"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import { getInterviewQuestions } from "@/lib/api"
import Waveform from "@/components/Waveform"
import FeedbackPanel from "@/components/FeedbackPanel"
import WaterBackground from "@/components/WaterBackground"
import type { InterviewQuestionsResponse, InterviewSegment } from "@/types"

const inputCls = "input-blue rounded-xl px-3 py-2.5 text-sm font-mono w-full"

export default function InterviewPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [segments, setSegments] = useState<InterviewSegment[]>([])
  const [jobType, setJobType] = useState("Software engineer")
  const [experienceLevel, setExperienceLevel] = useState("mid-level")
  const [focusAreas, setFocusAreas] = useState("behavioral, technical, problem solving")
  const [questions, setQuestions] = useState<string[]>([])
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

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
        focusAreas: focusAreas.split(",").map((a) => a.trim()).filter(Boolean),
        count: 8,
      }) as InterviewQuestionsResponse
      setQuestions(data.questions)
      setActiveQuestion(0)
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "Could not generate questions")
    } finally {
      setQuestionLoading(false)
    }
  }, [experienceLevel, focusAreas, jobType, token])

  useEffect(() => {
    if (token && questions.length === 0 && !questionLoading) void generateQuestions()
  }, [generateQuestions, questionLoading, questions.length, token])

  return (
    <div className="relative min-h-screen bg-[#05101e] flex flex-col overflow-hidden">
      <WaterBackground />

      {/* Header */}
      <header
        className="relative border-b px-6 py-4 flex items-center justify-between"
        style={{ zIndex: 10, background: "rgba(5,16,30,0.7)", backdropFilter: "blur(12px)", borderColor: "rgba(125,211,252,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-accent font-display font-black text-xs">VC</span>
          <span className="font-display font-bold text-[#e0f2fe]">Vocalis</span>
          {recording && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs font-mono btn-ghost rounded-lg px-3 py-1.5"
        >
          Back to dashboard
        </button>
      </header>

      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px]" style={{ zIndex: 10 }}>
        {/* Left column */}
        <div className="p-8 flex flex-col gap-8" style={{ borderRight: "1px solid rgba(125,211,252,0.08)" }}>
          <div>
            <h1 className="font-display font-bold text-xl text-[#e0f2fe] mb-1">Practice Interview</h1>
            <p className="text-sm font-mono" style={{ color: "rgba(125,211,252,0.5)" }}>
              Choose any job type, generate questions, then answer out loud.
            </p>
          </div>

          {/* Config panel */}
          <div className="glass rounded-2xl p-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
              <label className="flex flex-col gap-1.5">
                <span className="label-mono">Job type</span>
                <input
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="Nurse, product manager, teacher…"
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label-mono">Level</span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={inputCls}
                  style={{ background: "rgba(5,15,35,0.6)", border: "1px solid rgba(125,211,252,0.15)" }}
                >
                  <option value="entry-level">Entry-level</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="leadership">Leadership</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="label-mono">Focus areas</span>
              <input
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="behavioral, technical, customer service"
                className={inputCls}
              />
            </label>
            <button
              onClick={generateQuestions}
              disabled={!token || questionLoading || jobType.trim().length < 2}
              className="py-2.5 rounded-xl btn-accent font-display font-bold text-sm"
            >
              {questionLoading ? "Generating…" : "Generate questions"}
            </button>
            {questionError && (
              <p className="text-xs font-mono rounded-xl px-3 py-2"
                 style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {questionError}
              </p>
            )}
          </div>

          {/* Current question */}
          <div className="glass rounded-2xl p-5 min-h-[150px]">
            <p className="label-mono mb-3">Current question</p>
            <p className="text-lg text-[#e0f2fe] font-display font-bold leading-snug">
              {questions[activeQuestion] ?? "Generate a question set to begin."}
            </p>
            {questions.length > 0 && (
              <div className="flex items-center justify-between gap-3 mt-5">
                <button
                  onClick={() => setActiveQuestion((c) => Math.max(0, c - 1))}
                  disabled={activeQuestion === 0}
                  className="text-xs font-mono btn-ghost rounded-lg px-3 py-2 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-xs font-mono" style={{ color: "rgba(125,211,252,0.45)" }}>
                  {activeQuestion + 1} / {questions.length}
                </span>
                <button
                  onClick={() => setActiveQuestion((c) => Math.min(questions.length - 1, c + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  className="text-xs font-mono btn-ghost rounded-lg px-3 py-2 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Waveform */}
          <div className="glass rounded-2xl p-6">
            <p className="label-mono mb-4">Audio Input</p>
            <Waveform analyserRef={analyserRef} active={recording} />
          </div>

          {/* Record controls */}
          <div className="flex gap-3">
            {!recording ? (
              <button onClick={start} className="flex-1 py-3 rounded-xl btn-accent font-display font-bold text-sm">
                Start recording
              </button>
            ) : (
              <button
                onClick={stop}
                className="flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all"
                style={{ border: "1px solid rgba(248,113,113,0.5)", color: "#f87171" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Stop recording
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs font-mono rounded-xl px-4 py-3"
               style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          {segments.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4">
                <p className="label-mono">Segments</p>
                <p className="text-2xl font-display font-bold text-[#e0f2fe] mt-1">{segments.length}</p>
              </div>
              <div className="rounded-xl p-4"
                   style={{ background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.2)" }}>
                <p className="label-mono">Avg Confidence</p>
                <p className="text-2xl font-display font-bold text-[#7dd3fc] mt-1">
                  {Math.round(segments.reduce((a, s) => a + s.confidence_score, 0) / segments.length)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="p-8 overflow-y-auto">
          <p className="label-mono mb-6">Question Set</p>
          <div className="flex flex-col gap-3 mb-8">
            {questions.length === 0 ? (
              <p className="text-sm font-mono" style={{ color: "rgba(125,211,252,0.35)" }}>
                Questions will appear here after generation.
              </p>
            ) : questions.map((question, index) => (
              <button
                key={`${question}-${index}`}
                onClick={() => setActiveQuestion(index)}
                className="text-left rounded-xl p-3 transition-all font-mono text-sm"
                style={
                  activeQuestion === index
                    ? { background: "rgba(125,211,252,0.08)", border: "1px solid rgba(125,211,252,0.3)", color: "#d4eeff" }
                    : { background: "rgba(5,16,30,0.4)", border: "1px solid rgba(125,211,252,0.08)", color: "rgba(125,211,252,0.55)" }
                }
              >
                <span className="block label-mono mb-1">Question {index + 1}</span>
                <span className="leading-relaxed">{question}</span>
              </button>
            ))}
          </div>

          <p className="label-mono mb-6">Real-time Analysis</p>
          <FeedbackPanel segments={segments} />
        </div>
      </div>
    </div>
  )
}
