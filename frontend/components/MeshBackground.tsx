"use client"
import { useEffect, useRef } from "react"

export default function MeshBackground() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const spotRef       = useRef<HTMLDivElement>(null)  // fast warm spotlight
  const lensRef       = useRef<HTMLDivElement>(null)  // frosted-lens warp ring

  useEffect(() => {
    const container = containerRef.current
    const spot      = spotRef.current
    const lens      = lensRef.current
    if (!container) return

    const blobs    = Array.from(container.querySelectorAll<HTMLElement>("[data-blob]"))
    const factors  = blobs.map(b => parseFloat(b.dataset.factor ?? "0.015"))

    let rafId: number

    // Parallax targets (offset from viewport centre)
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    // Cursor raw position for the warp effects (starts at centre)
    let cursorX = typeof window !== "undefined" ? window.innerWidth  / 2 : 0
    let cursorY = typeof window !== "undefined" ? window.innerHeight / 2 : 0
    let warpX   = cursorX
    let warpY   = cursorY

    const onMouseMove = (e: MouseEvent) => {
      tx      = e.clientX - window.innerWidth  / 2
      ty      = e.clientY - window.innerHeight / 2
      cursorX = e.clientX
      cursorY = e.clientY
    }

    const tick = () => {
      // Slow parallax for background blobs
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      blobs.forEach((b, i) => {
        b.style.transform = `translate(${cx * factors[i]}px, ${cy * factors[i]}px)`
      })

      // Fast warp-cursor lerp (snappier than blob parallax)
      warpX += (cursorX - warpX) * 0.18
      warpY += (cursorY - warpY) * 0.18

      // Warm spotlight — centred on cursor
      if (spot) {
        spot.style.transform = `translate(${warpX - 190}px, ${warpY - 190}px)`
      }

      // Frosted lens ring — centred on cursor, slightly behind
      if (lens) {
        lens.style.transform = `translate(${warpX - 80}px, ${warpY - 80}px)`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    window.addEventListener("mousemove", onMouseMove)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: "linear-gradient(145deg, #fff9f5 0%, #fff4ef 45%, #fff0ee 100%)",
        pointerEvents: "none",
      }}
    >
      {/* ── Static gradient blobs ───────────────────────── */}

      {/* orange — top-left */}
      <div data-blob data-factor="0.022" style={{
        position: "absolute", width: "680px", height: "680px",
        top: "-180px", left: "-130px", borderRadius: "50%",
        background: "radial-gradient(circle at 45% 45%, #f97316 0%, rgba(249,115,22,0.35) 45%, transparent 70%)",
        filter: "blur(95px)", opacity: 0.68, willChange: "transform",
      }} />

      {/* amber — top-right */}
      <div data-blob data-factor="-0.014" style={{
        position: "absolute", width: "600px", height: "600px",
        top: "-120px", right: "-80px", borderRadius: "50%",
        background: "radial-gradient(circle at 55% 40%, #fbbf24 0%, rgba(251,191,36,0.3) 45%, transparent 70%)",
        filter: "blur(85px)", opacity: 0.58, willChange: "transform",
      }} />

      {/* coral-pink — mid-right */}
      <div data-blob data-factor="0.019" style={{
        position: "absolute", width: "760px", height: "760px",
        top: "22%", right: "-180px", borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #fb7185 0%, rgba(251,113,133,0.28) 45%, transparent 70%)",
        filter: "blur(115px)", opacity: 0.62, willChange: "transform",
      }} />

      {/* hot-pink — bottom-left */}
      <div data-blob data-factor="-0.017" style={{
        position: "absolute", width: "640px", height: "640px",
        bottom: "-160px", left: "8%", borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #f43f5e 0%, rgba(244,63,94,0.28) 45%, transparent 70%)",
        filter: "blur(105px)", opacity: 0.52, willChange: "transform",
      }} />

      {/* soft peach — centre bloom */}
      <div data-blob data-factor="0.009" style={{
        position: "absolute", width: "900px", height: "900px",
        top: "50%", left: "50%", marginTop: "-450px", marginLeft: "-450px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, rgba(254,215,170,0.95) 0%, rgba(254,215,170,0.4) 40%, transparent 70%)",
        filter: "blur(75px)", opacity: 0.72, willChange: "transform",
      }} />

      {/* red-orange — left-centre */}
      <div data-blob data-factor="-0.013" style={{
        position: "absolute", width: "500px", height: "500px",
        top: "32%", left: "-90px", borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #ef4444 0%, rgba(239,68,68,0.22) 45%, transparent 70%)",
        filter: "blur(90px)", opacity: 0.48, willChange: "transform",
      }} />

      {/* warm yellow — bottom-right */}
      <div data-blob data-factor="0.016" style={{
        position: "absolute", width: "520px", height: "520px",
        bottom: "-80px", right: "5%", borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #fde68a 0%, rgba(253,230,138,0.3) 45%, transparent 70%)",
        filter: "blur(80px)", opacity: 0.5, willChange: "transform",
      }} />

      {/* ── Cursor warp effects ─────────────────────────── */}

      {/* Warm spotlight — soft glow that follows the cursor */}
      <div
        ref={spotRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "380px", height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,248,0.90) 0%, rgba(255,252,240,0.50) 40%, rgba(255,248,235,0.15) 65%, transparent 80%)",
          filter: "blur(55px)",
          opacity: 1,
          willChange: "transform",
        }}
      />

      {/* Soft lens — backdrop-filter masked to fade at edges, no hard border */}
      <div
        ref={lensRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "160px", height: "160px",
          borderRadius: "50%",
          backdropFilter: "blur(4px) brightness(1.05) saturate(1.1)",
          WebkitBackdropFilter: "blur(4px) brightness(1.05) saturate(1.1)",
          maskImage: "radial-gradient(circle at 50% 50%, black 25%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 25%, transparent 68%)",
          willChange: "transform",
        }}
      />
    </div>
  )
}
