"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import AuthForm from "@/components/AuthForm"

export default function Home() {
  const { user, loading, error, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push("/dashboard")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "rgba(125,211,252,0.2)", borderTopColor: "#7dd3fc" }}
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
