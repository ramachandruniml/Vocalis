"use client"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import { getInterviewQuestions } from "@/lib/api"
import Waveform from "@/components/Waveform"
import FeedbackPanel from "@/components/FeedbackPanel"
import type { InterviewQuestionsResponse, InterviewSegment } from "@/types"

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
        focusAreas: focusAreas
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean),
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
    if (token && questions.length === 0 && !questionLoading) {
      void generateQuestions()
    }
  }, [generateQuestions, questionLoading, questions.length, token])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b border-border bg-panel px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-accent text-[#0a0a0a] font-display font-black text-xs">VC</span>
          <span className="font-display font-bold text-zinc-100">Vocalis</span>
          {recording && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-mono animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-border rounded-lg px-3 py-1.5 transition-colors"
        >
          Back to dashboard
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        <div className="p-8 flex flex-col gap-8 border-r border-border">
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-100 mb-1">Practice Interview</h1>
            <p className="text-sm text-zinc-500 font-mono">Choose any job type, generate questions, then answer out loud.</p>
          </div>

          <div className="bg-panel border border-border rounded-lg p-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Job type</span>
                <input
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  placeholder="Nurse, product manager, teacher..."
                  className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-accent-dim transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Level</span>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-accent-dim transition-colors"
                >
                  <option value="entry-level">Entry-level</option>
                  <option value="mid-level">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="leadership">Leadership</option>
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Focus areas</span>
              <input
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="behavioral, technical, customer service"
                className="bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-accent-dim transition-colors"
              />
            </label>
            <button
              onClick={generateQuestions}
              disabled={!token || questionLoading || jobType.trim().length < 2}
              className="py-2.5 bg-accent text-[#0a0a0a] rounded-lg font-display font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {questionLoading ? "Generating..." : "Generate questions"}
            </button>
            {questionError && (
              <p className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {questionError}
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-5 min-h-[150px]">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">
              Current question
            </p>
            <p className="text-lg text-zinc-100 font-display font-bold leading-snug">
              {questions[activeQuestion] ?? "Generate a question set to begin."}
            </p>
            {questions.length > 0 && (
              <div className="flex items-center justify-between gap-3 mt-5">
                <button
                  onClick={() => setActiveQuestion((current) => Math.max(0, current - 1))}
                  disabled={activeQuestion === 0}
                  className="text-xs font-mono text-zinc-400 hover:text-zinc-200 border border-border rounded-lg px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-zinc-500 font-mono">
                  {activeQuestion + 1} / {questions.length}
                </span>
                <button
                  onClick={() => setActiveQuestion((current) => Math.min(questions.length - 1, current + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  className="text-xs font-mono text-zinc-400 hover:text-zinc-200 border border-border rounded-lg px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="bg-panel border border-border rounded-xl p-6">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-mono mb-4">Audio Input</p>
            <Waveform analyserRef={analyserRef} active={recording} />
          </div>

          <div className="flex gap-3">
            {!recording ? (
              <button onClick={start} className="flex-1 py-3 bg-accent text-[#0a0a0a] rounded-xl font-display font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all">
                Start recording
              </button>
            ) : (
              <button onClick={stop} className="flex-1 py-3 bg-transparent text-red-400 border border-red-400/50 rounded-xl font-display font-bold text-sm hover:bg-red-400/10 transition-all">
                Stop recording
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {segments.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Segments</p>
                <p className="text-2xl font-display font-bold text-zinc-100 mt-1">{segments.length}</p>
              </div>
              <div className="bg-card border border-accent/20 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Avg Confidence</p>
                <p className="text-2xl font-display font-bold text-accent mt-1">
                  {Math.round(segments.reduce((a, s) => a + s.confidence_score, 0) / segments.length)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 overflow-y-auto">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">Question Set</p>
          <div className="flex flex-col gap-3 mb-8">
            {questions.length === 0 ? (
              <p className="text-sm text-zinc-600 font-mono">Questions will appear here after generation.</p>
            ) : questions.map((question, index) => (
              <button
                key={`${question}-${index}`}
                onClick={() => setActiveQuestion(index)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  activeQuestion === index
                    ? "border-accent/50 bg-accent/10 text-zinc-100"
                    : "border-border bg-card text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-widest text-zinc-600 font-mono mb-1">
                  Question {index + 1}
                </span>
                <span className="text-sm leading-relaxed">{question}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">Real-time Analysis</p>
          <FeedbackPanel segments={segments} />
        </div>
      </div>
    </div>
  )
}
