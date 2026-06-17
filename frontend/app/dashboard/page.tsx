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
    <div style={{ minHeight: "100vh", background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "#111" }} />
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>

      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="28" height="20" viewBox="0 0 32 22" aria-hidden>
            <path d="M 1 21 A 15 15 0 0 1 31 21 Z" fill="#4f46e5"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "16px", color: "#111" }}>Vocalis</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              fontSize: "13px", fontWeight: 500, color: "#6b7280",
              background: "none", border: "1px solid #e5e7eb",
              borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0d0d0d", margin: "0 0 4px" }}>Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Track your interview performance over time.</p>
          </div>
          <Link
            href="/dashboard/interview"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#111",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            New Interview
          </Link>
        </div>

        {/* Sessions card */}
        <section>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
            Recent Sessions
          </p>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}>
            {fetching ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                <span className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "#111" }} />
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
