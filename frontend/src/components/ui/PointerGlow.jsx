import { useEffect, useRef } from "react"

export default function PointerGlow({ color = "rgba(99,102,241,0.25)" }) {
  const glowRef = useRef(null)
  const frameRef = useRef(null)
  const targetRef = useRef({ x: -240, y: -240 })
  const currentRef = useRef({ x: -240, y: -240 })

  useEffect(() => {
    const handlePointerMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerLeave = () => {
      targetRef.current = { x: -240, y: -240 }
    }

    const tick = () => {
      const current = currentRef.current
      const target = targetRef.current

      current.x += (target.x - current.x) * 0.14
      current.y += (target.y - current.y) * 0.14

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      }

      frameRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerleave", handlePointerLeave)
    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-10 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl mix-blend-screen will-change-transform"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 68%)` }}
    />
  )
}
