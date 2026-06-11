"use client"
import { useState, useEffect } from "react"
import {
  auth,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  logout,
  onAuthStateChanged,
  type User,
} from "@/lib/firebase"

export function useAuth() {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]  = useState<string | null>(null)

  useEffect(() => {
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
    catch (e: any) { setError(e.message) }
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