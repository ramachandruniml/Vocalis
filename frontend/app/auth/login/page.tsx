"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import AuthForm from "@/components/AuthForm"

export default function LoginPage() {
  const { user, loading, error, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push("/dashboard")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <span
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "#111" }}
        />
      </div>
    )
  }

  return (
    <AuthForm
      onEmail={(email, password, mode) =>
        mode === "login" ? signInWithEmail(email, password) : signUpWithEmail(email, password)
      }
      onGoogle={signInWithGoogle}
      error={error}
      loading={false}
    />
  )
}
