"use client"
import { useState, useEffect } from "react"
import {
  auth,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  logout,
  onAuthStateChanged,
  getGoogleRedirectResult,
  type User,
} from "@/lib/firebase"

function friendlyError(e: any): string {
  const code: string = e?.code ?? ""
  if (code === "auth/email-already-in-use")  return "An account with this email already exists."
  if (code === "auth/wrong-password")         return "Incorrect password. Please try again."
  if (code === "auth/user-not-found")         return "No account found with this email."
  if (code === "auth/invalid-credential")     return "Incorrect email or password."
  if (code === "auth/invalid-email")          return "Please enter a valid email address."
  if (code === "auth/weak-password")          return "Password must be at least 6 characters."
  if (code === "auth/too-many-requests")      return "Too many attempts. Please try again later."
  if (code === "auth/network-request-failed") return "Network error. Check your connection."
  return "Something went wrong. Please try again."
}

export function useAuth() {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]  = useState<string | null>(null)

  useEffect(() => {
    // Complete any pending Google redirect sign-in
    getGoogleRedirectResult().catch((e: any) => {
      if (e?.code && e.code !== "auth/no-auth-event") {
        setError(friendlyError(e))
      }
    })

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const t = await u.getIdToken()
        setToken(t)
      } else {
        setToken(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const withError = async (fn: () => Promise<any>) => {
    setError(null)
    try { await fn() }
    catch (e: any) { setError(friendlyError(e)) }
  }

  return {
    user,
    token,
    loading,
    error,
    signInWithGoogle: () => withError(signInWithGoogle),
    signUpWithEmail:  (e: string, p: string) => withError(() => signUpWithEmail(e, p)),
    signInWithEmail:  (e: string, p: string) => withError(() => signInWithEmail(e, p)),
    logout,
  }
}