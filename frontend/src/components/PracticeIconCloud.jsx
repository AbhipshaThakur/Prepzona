import { useEffect, useMemo, useRef } from "react"
import { useTheme } from "@/hooks/useTheme"

const QUICK_POINTS = [
  "Role-aware interview flow",
  "Resume-based follow-ups",
  "Focus-topic drilling",
  "Saved session recordings",
  "Answer-by-answer review",
  "Progress you can revisit",
]

const CLOUD_ICONS = [
  { symbol: "\u269b\ufe0f", label: "React" },
  { symbol: "\ud83d\udc0d", label: "Python" },
  { symbol: "\u2615", label: "Java" },
  { symbol: "\ud83d\udfe8", label: "JavaScript" },
  { symbol: "\ud83d\uddc4\ufe0f", label: "SQL" },
  { symbol: "\ud83d\udc0b", label: "Docker" },
  { symbol: "\u2638\ufe0f", label: "Kubernetes" },
  { symbol: "\ud83d\udcca", label: "DSA" },
  { symbol: "\ud83c\udfd7\ufe0f", label: "System Design" },
  { symbol: "\ud83d\udd37", label: "TypeScript" },
  { symbol: "\ud83e\udd80", label: "Rust" },
  { symbol: "\ud83d\udc39", label: "Go" },
  { symbol: "\ud83c\udf3f", label: "MongoDB" },
  { symbol: "\ud83d\udc18", label: "PostgreSQL" },
  { symbol: "\u26a1", label: "Node.js" },
  { symbol: "\ud83c\udf10", label: "REST API" },
  { symbol: "\ud83d\udd01", label: "GraphQL" },
  { symbol: "\ud83e\udd16", label: "AI/ML" },
  { symbol: "\ud83e\uddee", label: "C++" },
  { symbol: "\ud83d\udd34", label: "Redis" },
  { symbol: "\u2601\ufe0f", label: "AWS" },
  { symbol: "\ud83d\udd25", label: "Firebase" },
  { symbol: "\ud83e\uddea", label: "Testing" },
  { symbol: "\ud83d\udd10", label: "Security" },
]

const CLOUD_RADIUS = 148

function spherePositions(count, radius) {
  const positions = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2

  for (let index = 0; index < count; index += 1) {
    const theta = Math.acos(1 - (2 * (index + 0.5)) / count)
    const phi = (2 * Math.PI * index) / goldenRatio

    positions.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
    })
  }

  return positions
}

export default function PracticeIconCloud() {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const tagsRef = useRef([])
  const frameRef = useRef(null)
  const anglesRef = useRef({ x: 0.14, y: 0.06 })
  const positions = useMemo(() => spherePositions(CLOUD_ICONS.length, CLOUD_RADIUS), [])

  useEffect(() => {
    let previousTime = 0

    const animate = (time) => {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0.016
      previousTime = time

      anglesRef.current.x += 0.07 * delta
      anglesRef.current.y += 0.22 * delta

      const cosX = Math.cos(anglesRef.current.x)
      const sinX = Math.sin(anglesRef.current.x)
      const cosY = Math.cos(anglesRef.current.y)
      const sinY = Math.sin(anglesRef.current.y)

      tagsRef.current.forEach((element, index) => {
        if (!element) return

        const point = positions[index]
        const rotatedX = point.x * cosY + point.z * sinY
        const rotatedZ = -point.x * sinY + point.z * cosY
        const rotatedY = point.y * cosX - rotatedZ * sinX
        const depth = point.y * sinX + rotatedZ * cosX

        const scale = (depth + CLOUD_RADIUS) / (2 * CLOUD_RADIUS)
        const x = rotatedX + CLOUD_RADIUS
        const y = rotatedY + CLOUD_RADIUS

        element.style.transform = `translate(${x}px, ${y}px) scale(${0.54 + scale * 0.86})`
        element.style.opacity = String(0.28 + scale * 0.72)
        element.style.zIndex = String(Math.round(scale * 100))
        element.style.fontSize = `${18 + scale * 16}px`
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [positions])

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
            Built for practice
          </p>
          <h2 className={`text-4xl font-black tracking-tight mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
            What keeps each session useful
          </h2>
          <p className={`text-sm leading-relaxed mb-6 max-w-xl ${dark ? "text-white/60" : "text-gray-600"}`}>
            Every round stays centered on your background, saves what matters, and gives you a cleaner next step before the next interview.
          </p>
          <div className="flex flex-wrap gap-2 max-w-2xl">
            {QUICK_POINTS.map((point) => (
              <span
                key={point}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  dark ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"
                }`}
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center min-h-[360px]">
          <div
            className={`absolute h-72 w-72 rounded-full blur-3xl ${
              dark ? "bg-indigo-500/20" : "bg-indigo-200/70"
            }`}
          />
          <div className="relative flex items-center justify-center w-full min-h-[360px]">
            <div className="relative" style={{ width: CLOUD_RADIUS * 2, height: CLOUD_RADIUS * 2 }}>
              {CLOUD_ICONS.map((icon, index) => (
                <div
                  key={icon.label}
                  ref={(element) => {
                    tagsRef.current[index] = element
                  }}
                  title={icon.label}
                  className="absolute left-0 top-0 select-none cursor-default transition-none"
                  style={{
                    lineHeight: 1,
                    transformOrigin: "0 0",
                    filter: dark ? "drop-shadow(0 0 10px rgba(99,102,241,0.28))" : "drop-shadow(0 8px 20px rgba(15,23,42,0.12))",
                  }}
                >
                  {icon.symbol}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
