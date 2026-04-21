import { useEffect, useState } from "react"

/**
 * Thin vertical scroll-progress line on the left edge.
 * Renders only on large screens to avoid mobile overlap.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setProgress(pct)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="hidden lg:block fixed left-2 top-24 z-40 h-[70vh] w-2 rounded-full bg-gray-200/50 dark:bg-white/10 overflow-hidden">
      <div
        className="w-full bg-indigo-500 rounded-full transition-all duration-150"
        style={{ height: `${progress}%` }}
      />
    </div>
  )
}
