const BASE = import.meta.env.VITE_API_URL

export async function register(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Registration failed")
  }
  const data = await res.json()
  return data.access_token
}

export async function login(email: string, password: string): Promise<string> {
  const params = new URLSearchParams({ username: email, password })
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Login failed")
  }
  const data = await res.json()
  return data.access_token
}

export async function getMe(token: string) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Unauthorized")
  return res.json()
}