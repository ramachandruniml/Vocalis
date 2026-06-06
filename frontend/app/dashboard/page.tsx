"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { getSessions } from "@/lib/api"
import SessionHistory from "@/components/SessionHistory"
import type { Session } from "@/types"

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

  useEffect(() => {
    if (token) {
      getSessions(token)
        .then((data) => setSessions(data.sessions))
        .catch(console.error)
        .finally(() => setFetching(false))
    }
  }, [token])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-zinc-700 border-t-accent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-border bg-panel px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-accent text-[#0a0a0a] font-display font-black text-xs">VC</span>
          <span className="font-display font-bold text-zinc-100">Vocalis</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 font-mono">{user?.email}</span>
          <button onClick={logout} className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-border rounded-lg px-3 py-1.5 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-bold text-2xl text-zinc-100">Dashboard</h1>
            <p className="text-sm text-zinc-500 font-mono mt-1">Track your interview performance over time.</p>
          </div>
          <Link
            href="/dashboard/interview"
            className="px-5 py-2.5 bg-accent text-[#0a0a0a] rounded-lg font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            New Interview
          </Link>
        </div>

        <section>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-4">Recent Sessions</h2>
          {fetching
            ? <div className="flex justify-center py-8"><span className="w-5 h-5 border-2 border-zinc-700 border-t-accent rounded-full animate-spin" /></div>
            : <SessionHistory sessions={sessions} />
          }
        </section>
      </main>
    </div>
  )
}