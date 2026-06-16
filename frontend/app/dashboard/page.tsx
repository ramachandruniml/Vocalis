"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { getSessions } from "@/lib/api"
import SessionHistory from "@/components/SessionHistory"
import WaterBackground from "@/components/WaterBackground"
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
    <div className="min-h-screen bg-[#05101e] flex items-center justify-center">
      <span
        className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: "rgba(125,211,252,0.2)", borderTopColor: "#7dd3fc" }}
      />
    </div>
  )

  return (
    <div className="relative min-h-screen bg-[#05101e] overflow-hidden">
      <WaterBackground />

      {/* Header */}
      <header
        className="relative border-b px-6 py-4 flex items-center justify-between"
        style={{
          zIndex: 10,
          background: "rgba(5, 16, 30, 0.7)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(125,211,252,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-accent font-display font-black text-xs">VC</span>
          <span className="font-display font-bold text-[#e0f2fe]">Vocalis</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono" style={{ color: "rgba(125,211,252,0.45)" }}>{user?.email}</span>
          <button
            onClick={logout}
            className="text-xs font-mono btn-ghost rounded-lg px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-6 py-12" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#e0f2fe]">Dashboard</h1>
            <p className="text-sm font-mono mt-1" style={{ color: "rgba(125,211,252,0.5)" }}>
              Track your interview performance over time.
            </p>
          </div>
          <Link
            href="/dashboard/interview"
            className="px-5 py-2.5 rounded-xl btn-accent font-display font-bold text-sm"
          >
            New Interview
          </Link>
        </div>

        <section>
          <p className="label-mono mb-4">Recent Sessions</p>
          <div className="glass rounded-2xl p-6">
            {fetching ? (
              <div className="flex justify-center py-8">
                <span
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: "rgba(125,211,252,0.2)", borderTopColor: "#7dd3fc" }}
                />
              </div>
            ) : (
              <SessionHistory sessions={sessions} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
