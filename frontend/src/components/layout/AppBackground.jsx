import { useEffect, useRef, useCallback } from "react"
import { useTheme } from "@/hooks/useTheme"

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:255,g:255,b:255 }
}

export default function AppBackground({ children }) {
  const { theme }    = useTheme()
  const dark         = theme === "dark"
  const canvasRef    = useRef(null)
  const wavesRef     = useRef([])
  const animRef      = useRef()
  const t0Ref        = useRef(Date.now())
  const darkRef      = useRef(dark)

  // keep darkRef in sync
  useEffect(() => { darkRef.current = dark }, [dark])

  const LIGHT_COLORS = ["#ff7e5f","#ff9966","#ff5f6d","#ffc371","#f093fb"]
  const DARK_COLORS  = ["#4f46e5","#7c3aed","#2563eb","#6d28d9","#818cf8"]

  const initWaves = useCallback((h, cols) => {
    wavesRef.current = Array.from({ length: 5 }, (_, i) => ({
      y:         h * (0.3 + (i / 5) * 0.5),
      amplitude: h * (0.12 + Math.random() * 0.15),
      frequency: 0.002 + Math.random() * 0.002,
      speed:     (0.15 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
      phase:     Math.random() * Math.PI * 2,
      color:     cols[i % cols.length],
      opacity:   0.18 + Math.random() * 0.12,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width  = w
    canvas.height = h

    const cols = darkRef.current ? DARK_COLORS : LIGHT_COLORS
    initWaves(h, cols)

    const handleResize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = w
      canvas.height = h
      initWaves(h, darkRef.current ? DARK_COLORS : LIGHT_COLORS)
    }
    window.addEventListener("resize", handleResize)

    const draw = () => {
      const isDark = darkRef.current
      const activeCols = isDark ? DARK_COLORS : LIGHT_COLORS
      const t = (Date.now() - t0Ref.current) * 0.001

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      if (isDark) {
        bg.addColorStop(0, "#0f0c29")
        bg.addColorStop(0.5, "#1e1b4b")
        bg.addColorStop(1, "#0a0520")
      } else {
        bg.addColorStop(0, "#fff1eb")
        bg.addColorStop(0.5, "#ffd1b5")
        bg.addColorStop(1, "#ffb3ba")
      }
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Glow spots
      ctx.globalCompositeOperation = "lighter"
      const spots = [
        { x: w * 0.15, y: h * 0.25, r: Math.min(w,h) * 0.45, c: activeCols[0] },
        { x: w * 0.85, y: h * 0.55, r: Math.min(w,h) * 0.40, c: activeCols[1] },
        { x: w * 0.50, y: h * 0.85, r: Math.min(w,h) * 0.35, c: activeCols[2] },
      ]
      for (const s of spots) {
        const rgb = hexToRgb(s.c)
        const alpha = isDark ? 0.08 : 0.12
        const g = ctx.createRadialGradient(
          s.x + Math.sin(t * 0.3) * 60,
          s.y + Math.cos(t * 0.2) * 40,
          0, s.x, s.y, s.r
        )
        g.addColorStop(0,   `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`)
        g.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha * 0.4})`)
        g.addColorStop(1,   "transparent")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      // Waves
      ctx.globalCompositeOperation = "source-over"
      for (const wave of wavesRef.current) {
        const rgb = hexToRgb(wave.color)
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 4) {
          const y = wave.y
            + Math.sin(x * wave.frequency + t * wave.speed + wave.phase) * wave.amplitude
            + Math.sin(x * wave.frequency * 0.5 + t * wave.speed * 0.7 + wave.phase * 1.3) * wave.amplitude * 0.4
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.lineTo(0, h)
        ctx.closePath()
        const wg = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, h)
        const op = isDark ? wave.opacity * 0.5 : wave.opacity
        wg.addColorStop(0,   `rgba(${rgb.r},${rgb.g},${rgb.b},${op})`)
        wg.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},${op * 0.4})`)
        wg.addColorStop(1,   "transparent")
        ctx.fillStyle = wg
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [initWaves])

  // Re-init waves on theme change
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && wavesRef.current.length > 0) {
      initWaves(canvas.height, dark ? DARK_COLORS : LIGHT_COLORS)
    }
  }, [dark, initWaves])

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Fixed canvas always behind everything */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
      />
      {/* Vignette overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: dark
          ? "radial-gradient(ellipse at center, transparent 40%, rgba(5,2,20,0.6) 100%)"
          : "radial-gradient(ellipse at center, transparent 40%, rgba(255,160,130,0.35) 100%)"
      }} />
      {/* Scrollable content */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  )
}