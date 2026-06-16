"use client"

import { useEffect, useRef } from "react"

export default function WaterBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const lines = Array.from({ length: 54 }, (_, index) => ({
      seed: index * 41.37,
      y: Math.random(),
      speed: 0.18 + Math.random() * 0.28,
      amp: 18 + Math.random() * 42,
      width: 0.8 + Math.random() * 1.8,
      alpha: 0.12 + Math.random() * 0.22,
    }))

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY }
    }

    const onPointerLeave = () => {
      pointerRef.current = { x: -9999, y: -9999 }
    }

    const draw = (time: number) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const pointer = pointerRef.current
      const t = time * 0.001

      ctx.clearRect(0, 0, width, height)
      const wash = ctx.createLinearGradient(0, 0, width, height)
      wash.addColorStop(0, "rgba(238, 251, 255, 0.72)")
      wash.addColorStop(0.5, "rgba(185, 233, 255, 0.44)")
      wash.addColorStop(1, "rgba(112, 195, 232, 0.32)")
      ctx.fillStyle = wash
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = "screen"
      for (const line of lines) {
        const baseY = line.y * height
        const proximity = Math.max(0, 1 - Math.abs(pointer.y - baseY) / 230)
        const lift = proximity * 26

        ctx.beginPath()
        for (let x = -80; x <= width + 80; x += 14) {
          const distance = Math.hypot(pointer.x - x, pointer.y - baseY)
          const ripple = Math.max(0, 1 - distance / 260)
          const y =
            baseY +
            Math.sin(x * 0.011 + t * line.speed + line.seed) * line.amp +
            Math.sin(x * 0.028 - t * 0.9 + line.seed) * 7 -
            lift * ripple

          if (x === -80) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha + proximity * 0.28})`
        ctx.lineWidth = line.width + proximity * 1.2
        ctx.shadowColor = "rgba(92, 190, 232, 0.32)"
        ctx.shadowBlur = 18 + proximity * 24
        ctx.stroke()
      }

      ctx.globalCompositeOperation = "source-over"
      ctx.shadowBlur = 0
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerleave", onPointerLeave)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />
}
