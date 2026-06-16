"use client"
import { useEffect, useRef } from "react"

/**
 * Renders a full-screen animated noise field — same organic blob/cloud look
 * as the reference image, colored in baby blue instead of black/gray.
 *
 * Technique: layered-sine approximation of Perlin noise rendered onto a
 * small offscreen canvas (1/8 screen res) then scaled up. The bilinear
 * upscaling gives the signature smooth, organic blob shapes for free.
 *
 * Mouse effect: UV coordinates near the cursor are warped with a
 * ripple displacement — the blobs appear to part like water around a finger.
 */

export default function WaterBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const mouseRef   = useRef({ x: -1, y: -1, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!

    // Low-res offscreen canvas — scaled up for smooth blobs
    const SCALE = 7
    const off    = document.createElement("canvas")
    const offCtx = off.getContext("2d")!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      off.width  = Math.ceil(canvas.width  / SCALE)
      off.height = Math.ceil(canvas.height / SCALE)
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        active: true,
      }
    }
    const onLeave = () => { mouseRef.current.active = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseleave", onLeave)

    // ── Color gradient: dark navy ──▶ ocean ──▶ baby-blue ──▶ pale sky ──
    const toRGB = (v: number): [number, number, number] => {
      if (v < 0.28) {
        const k = v / 0.28
        return [2 + k * 4, 6 + k * 16, 18 + k * 44]          // near-black → dark navy
      }
      if (v < 0.52) {
        const k = (v - 0.28) / 0.24
        return [6 + k * 12, 22 + k * 42, 62 + k * 72]         // dark navy → deep blue
      }
      if (v < 0.72) {
        const k = (v - 0.52) / 0.20
        return [18 + k * 38, 64 + k * 80, 134 + k * 72]       // deep blue → ocean blue
      }
      if (v < 0.87) {
        const k = (v - 0.72) / 0.15
        return [56 + k * 68, 144 + k * 68, 206 + k * 36]      // ocean → baby blue
      }
      {
        const k = (v - 0.87) / 0.13
        return [124 + k * 96, 212 + k * 28, 242 + k * 13]     // baby blue → pale sky
      }
    }

    let t   = 0
    let raf = 0

    const draw = () => {
      raf = requestAnimationFrame(draw)
      t  += 0.004

      const OW = off.width
      const OH = off.height
      const img = offCtx.createImageData(OW, OH)
      const d   = img.data
      const m   = mouseRef.current

      for (let py = 0; py < OH; py++) {
        for (let px = 0; px < OW; px++) {
          let nx = px / OW
          let ny = py / OH

          // Ripple displacement around cursor — blobs "part" like water
          if (m.active) {
            const dx = nx - m.x
            const dy = ny - m.y
            const dd = Math.sqrt(dx * dx + dy * dy)
            if (dd > 0.001 && dd < 0.22) {
              const ring     = (0.22 - dd) / 0.22
              const ripple   = Math.sin(dd * 28 - t * 9) * ring * 0.018
              nx += (dx / dd) * ripple
              ny += (dy / dd) * ripple
            }
          }

          // Layered-sine noise — four octaves, different frequencies & speeds
          const n =
            Math.sin(nx * 3.6 + t * 0.60) * Math.cos(ny * 3.1 + t * 0.42) * 0.36 +
            Math.sin(nx * 1.9 - ny * 2.5 + t * 0.31) * 0.27 +
            Math.cos(nx * 5.8 + ny * 4.8 + t * 0.52) * 0.20 +
            Math.sin(nx * 2.4 + ny * 4.0 - t * 0.27) * 0.17

          // Normalize to [0,1]
          const v = Math.max(0, Math.min(1, (n + 0.88) / 1.76))

          const [r, g, b] = toRGB(v)
          const i = (py * OW + px) * 4
          d[i]   = r
          d[i+1] = g
          d[i+2] = b
          d[i+3] = 255
        }
      }

      offCtx.putImageData(img, 0, 0)

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: "none" }}
    />
  )
}
