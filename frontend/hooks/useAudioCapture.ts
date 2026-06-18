"use client"
import { useRef, useCallback, useState } from "react"
import type { InterviewSegment, FeedbackAnalysis } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function useAudioCapture(
  token: string | null,
  onSegment: (seg: InterviewSegment) => void
) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const durationRef = useRef<number>(0)
  const qIndexRef   = useRef<number>(0)
  const questionRef = useRef<string>("")
  const mimeRef     = useRef<string>("audio/webm")

  const [recording, setRecording] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const start = useCallback(async (questionText: string = "", questionIndex: number = 0) => {
    if (!token) return
    setError(null)
    setAnalyzing(false)
    chunksRef.current   = []
    durationRef.current = 0
    qIndexRef.current   = questionIndex
    questionRef.current = questionText

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not available. Make sure you're on localhost or HTTPS.")
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e: any) {
      const name: string = e?.name ?? ""
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("Microphone permission denied. Click the lock icon in your browser's address bar, allow microphone, then try again.")
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("No microphone detected. Please connect a microphone and try again.")
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setError("Microphone is in use by another application. Close other apps using it and try again.")
      } else {
        setError(e?.message || "Could not access microphone. Check your browser settings.")
      }
      return
    }

    try {
      // AudioContext for the waveform visualizer only
      const ctx      = new AudioContext()
      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      audioCtxRef.current = ctx

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      mimeRef.current = mimeType

      const recorder = new MediaRecorder(stream, { mimeType })

      // Collect chunks locally — no network connection during recording
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          durationRef.current += 1
        }
      }

      // When recorder finishes, POST the full audio to the backend for analysis
      recorder.addEventListener("stop", async () => {
        stream.getTracks().forEach(t => t.stop())

        const chunks = chunksRef.current
        if (chunks.length === 0) return

        setAnalyzing(true)
        try {
          const blob = new Blob(chunks, { type: "audio/webm" })
          const form = new FormData()
          form.append("audio",    blob,                        "recording.webm")
          form.append("question", questionRef.current)
          form.append("duration", String(durationRef.current))

          const res = await fetch(`${API_BASE}/api/analyze`, {
            method:  "POST",
            headers: { Authorization: `Bearer ${token}` },
            body:    form,
          })
          if (!res.ok) throw new Error(`Server returned ${res.status}`)

          const seg = await res.json()

          // Try to parse structured JSON from the feedback field
          let analysis: FeedbackAnalysis | undefined
          try {
            const parsed = JSON.parse(seg.feedback)
            if (parsed && typeof parsed === "object" && "expand" in parsed)
              analysis = parsed as FeedbackAnalysis
          } catch {}

          onSegment({
            ...seg,
            analysis,
            timestamp:     Date.now(),
            questionIndex: qIndexRef.current,
          })
        } catch (e: any) {
          setError(e?.message || "Failed to analyze your response. Make sure the backend is running.")
        } finally {
          setAnalyzing(false)
        }
      }, { once: true })

      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
    } catch (e: any) {
      setError(e?.message || "Something went wrong starting the recording.")
      stream.getTracks().forEach(t => t.stop())
    }
  }, [token, onSegment])

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop()  // triggers ondataavailable → "stop" event → POST to backend
    }
    audioCtxRef.current?.close()
    analyserRef.current = null
    setRecording(false)
    // analyzing flips to true inside the "stop" handler once the POST is in-flight
  }, [])

  return { start, stop, recording, analyzing, analyserRef, error }
}
