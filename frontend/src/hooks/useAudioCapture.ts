import { useRef, useCallback, useState } from "react"
import { InterviewMessage } from "../types"

const WS_URL = import.meta.env.VITE_WS_URL

export function useAudioCapture(
  token: string,
  onMessage: (msg: InterviewMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Web Audio API — waveform analyser
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser
      audioCtxRef.current = ctx

      // WebSocket connection with token auth
      const ws = new WebSocket(`${WS_URL}/ws/interview?token=${token}`)
      ws.binaryType = "arraybuffer"

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          onMessage({ ...data, timestamp: Date.now() })
        } catch {}
      }

      ws.onerror = () => setError("WebSocket connection error")
      ws.onclose = () => setRecording(false)

      socketRef.current = ws

      // MediaRecorder — stream chunks every 1s
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })

      recorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN && e.data.size > 0) {
          ws.send(e.data)
        }
      }

      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
    } catch (e: any) {
      setError(e.message || "Microphone access denied")
    }
  }, [token, onMessage])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    socketRef.current?.close()
    audioCtxRef.current?.close()
    analyserRef.current = null
    setRecording(false)
  }, [])

  return { start, stop, recording, analyserRef, error }
}