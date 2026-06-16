"use client"
import { useRef, useCallback, useState } from "react"
import type { InterviewSegment } from "@/types"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"

export function useAudioCapture(
  token: string | null,
  onSegment: (seg: InterviewSegment) => void
) {
  const socketRef   = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const start = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const ctx      = new AudioContext()
      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      audioCtxRef.current = ctx

      const ws = new WebSocket(`${WS_URL}/ws/interview?token=${token}`)
      ws.binaryType = "arraybuffer"
      ws.onmessage  = (e) => {
        try { onSegment({ ...JSON.parse(e.data), timestamp: Date.now() }) }
        catch {}
      }
      ws.onerror = () => setError("WebSocket error - is the backend running?")
      ws.onclose = () => setRecording(false)
      socketRef.current = ws

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN && e.data.size > 0)
          ws.send(e.data)
      }
      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
    } catch (e: any) {
      setError(e.message || "Microphone access denied")
    }
  }, [token, onSegment])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    socketRef.current?.close()
    audioCtxRef.current?.close()
    analyserRef.current = null
    setRecording(false)
  }, [])

  return { start, stop, recording, analyserRef, error }
}
