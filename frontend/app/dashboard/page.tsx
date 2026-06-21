"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import VocalisLogo from "@/components/VocalisLogo"
import { useAuth } from "@/hooks/useAuth"
import { getSessions } from "@/lib/api"
import SessionHistory from "@/components/SessionHistory"
import type { Session } from "@/types"

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.65)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 24px rgba(180,60,10,0.07), 0 1px 4px rgba(0,0,0,0.03)",
}

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
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: "rgba(234,88,12,0.15)", borderTopColor: "#ea580c" }} />
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>

      {/* Header */}
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
        <VocalisLogo iconHeight={40} wordmarkSize={20} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "16px", color: "#9a6040" }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              fontSize: "16px", fontWeight: 600, color: "#5c3012",
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(200,100,50,0.22)",
              borderRadius: "10px", padding: "9px 22px", cursor: "pointer",
              backdropFilter: "blur(8px)",
              transition: "background 0.16s, border-color 0.16s",
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "108px 24px 48px" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1c0800", margin: "0 0 4px" }}>Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#7a4020", margin: 0 }}>Track your interview performance over time.</p>
          </div>
          <Link
            href="/dashboard/interview"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "rgba(28,10,0,0.88)",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 18px rgba(28,10,0,0.22)",
            }}
          >
            New Interview
          </Link>
        </div>

        {/* Sessions card */}
        <section>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9a6040", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
            Recent Sessions
          </p>
          <div style={glassCard}>
            {fetching ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                <span className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(234,88,12,0.15)", borderTopColor: "#ea580c" }} />
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
