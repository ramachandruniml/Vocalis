import type { InterviewSegment } from "@/types"
import MetricCard from "./MetricCard"

interface Props { segments: InterviewSegment[] }

export default function FeedbackPanel({ segments }: Props) {
  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-600 text-sm font-mono">
        Start speaking — analysis appears here.
      </div>
    )
  }

  const latest = segments[segments.length - 1]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="WPM"        value={latest.features.wpm}                            sub="words/min" accent />
        <MetricCard label="Confidence" value={`${latest.confidence_score}%`}                  accent />
        <MetricCard label="Filler Rate" value={`${(latest.features.filler_rate * 100).toFixed(1)}%`} sub="of words" />
      </div>

      {latest.features.filler_words.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-mono">Filler words</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(latest.features.filler_words)].map((w) => (
              <span key={w} className="px-2 py-0.5 rounded text-xs font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/20">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
        <p className="text-xs text-accent-dim uppercase tracking-widest mb-2 font-mono">AI Feedback</p>
        <p className="text-sm text-zinc-200 leading-relaxed font-mono">{latest.feedback}</p>
      </div>

      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-mono">Transcript History</p>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {[...segments].reverse().map((s, i) => (
            <div key={i} className="rounded-md border border-border bg-panel p-3 text-xs font-mono text-zinc-400 leading-relaxed">
              <span className="text-zinc-600 mr-2">
                {s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : ""}
              </span>
              {s.transcript}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}