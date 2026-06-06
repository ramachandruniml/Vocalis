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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-zinc-700 border-t-accent rounded-full animate-spin" />
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