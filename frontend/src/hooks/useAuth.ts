import { useState, useCallback } from "react"
import { login as apiLogin, register as apiRegister } from "../api"

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const t = await apiLogin(email, password)
      localStorage.setItem("token", t)
      setToken(t)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const t = await apiRegister(email, password)
      localStorage.setItem("token", t)
      setToken(t)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setToken(null)
  }, [])

  return { token, error, loading, login, register, logout }
}