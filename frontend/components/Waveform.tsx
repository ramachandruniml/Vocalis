"use client"
import { useEffect, useRef } from "react"

interface Props {
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  active: boolean
}

export default function Waveform({ analyserRef, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const analyser = analyserRef.current
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (!analyser || !active) {
        ctx.strokeStyle = "#222"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
        ctx.stroke()
        return
      }

      const buffer = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteTimeDomainData(buffer)
      ctx.strokeStyle = "#c8f564"
      ctx.lineWidth   = 1.5
      ctx.shadowColor = "#c8f564"
      ctx.shadowBlur  = 8
      ctx.beginPath()
      buffer.forEach((val, i) => {
        const x = (i / buffer.length) * w
        const y = ((val - 128) / 128) * (h / 2) + h / 2
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, analyserRef])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={80}
      className="w-full h-20 block"
    />
  )
}