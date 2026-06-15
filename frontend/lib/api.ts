const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function authFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

export const getSessions = (token: string) =>
  authFetch("/api/sessions", token)

export const getSession = (token: string, id: string) =>
  authFetch(`/api/sessions/${id}`, token)

export interface InterviewQuestionRequest {
  jobType: string
  experienceLevel: string
  focusAreas: string[]
  count?: number
}

export const getInterviewQuestions = (token: string, payload: InterviewQuestionRequest) =>
  authFetch("/api/interview/questions", token, {
    method: "POST",
    body: JSON.stringify(payload),
  })
