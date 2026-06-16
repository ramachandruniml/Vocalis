"use client"
import type { Session } from "@/types"

interface Props { sessions: Session[] }

export default function SessionHistory({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <p className="text-zinc-600 text-sm font-mono text-center py-8">
        No sessions yet. Start your first interview above.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <div key={s.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-zinc-500 font-mono">
              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-sm text-zinc-300 font-mono">
              {s.segmentCount} segments / {s.totalWords} words / {Math.round(s.avgWpm)} WPM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-display font-bold ${
              s.avgConfidence >= 75 ? "text-accent" :
              s.avgConfidence >= 50 ? "text-yellow-400" : "text-red-400"
            }`}>
              {Math.round(s.avgConfidence)}%
            </span>
            <span className="text-xs text-zinc-600 font-mono">conf.</span>
          </div>
        </div>
      ))}
    </div>
  )
}
