"use client"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import Waveform from "@/components/Waveform"
import FeedbackPanel from "@/components/FeedbackPanel"
import type { InterviewSegment } from "@/types"

export default function InterviewPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [segments, setSegments] = useState<InterviewSegment[]>([])

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

  const handleSegment = useCallback((seg: InterviewSegment) => {
    setSegments((prev) => [...prev, seg])
  }, [])

  const { start, stop, recording, analyserRef, error } = useAudioCapture(token, handleSegment)

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
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-border rounded-lg px-3 py-1.5 transition-colors">
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        {/* Left panel */}
        <div className="p-8 flex flex-col gap-8 border-r border-border">
          <div>
            <h1 className="font-display font-bold text-xl text-zinc-100 mb-1">Mock Interview</h1>
            <p className="text-sm text-zinc-500 font-mono">Speak naturally. Audio is analyzed every ~5 seconds.</p>
          </div>

          <div className="bg-panel border border-border rounded-xl p-6">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-mono mb-4">Audio Input</p>
            <Waveform analyserRef={analyserRef} active={recording} />
          </div>

          <div className="flex gap-3">
            {!recording ? (
              <button onClick={start} className="flex-1 py-3 bg-accent text-[#0a0a0a] rounded-xl font-display font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all">
                Start Interview
              </button>
            ) : (
              <button onClick={stop} className="flex-1 py-3 bg-transparent text-red-400 border border-red-400/50 rounded-xl font-display font-bold text-sm hover:bg-red-400/10 transition-all">
                Stop Recording
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

        {/* Right panel */}
        <div className="p-8 overflow-y-auto">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">Real-time Analysis</p>
          <FeedbackPanel segments={segments} />
        </div>
      </div>
    </div>
  )
}