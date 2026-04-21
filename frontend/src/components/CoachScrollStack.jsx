import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"

const COACH_CARDS = [
  {
    icon: "🎯",
    tag: "Focus",
    title: "Role-Specific Questions",
    desc: "PrepZona tailors every question to your exact job role — whether it's a frontend engineer or a product manager, no generic prompts.",
    color: "#6366f1",
  },
  {
    icon: "🎙️",
    tag: "Voice",
    title: "Speech-to-Text in Real Time",
    desc: "Speak your answer naturally. Our blazing-fast transcription captures every word so you never have to type during an interview.",
    color: "#ec4899",
  },
  {
    icon: "🤖",
    tag: "AI Feedback",
    title: "Instant Scoring & Coaching",
    desc: "Each answer is scored 1–10 with specific feedback on clarity, depth, and structure — like having a senior interviewer in your pocket.",
    color: "#f59e0b",
  },
  {
    icon: "📊",
    tag: "Analytics",
    title: "Track Every Session",
    desc: "Line charts, radar scores, and role breakdowns let you see exactly where you're improving and what still needs work.",
    color: "#10b981",
  },
  {
    icon: "📄",
    tag: "Resume",
    title: "Resume-Based Deep Dives",
    desc: "Upload your CV once. PrepZona reads your actual projects and asks the questions a real interviewer would — about your specific work.",
    color: "#3b82f6",
  },
  {
    icon: "🔁",
    tag: "Follow-Up",
    title: "Smart Follow-Up Questions",
    desc: "After every answer the AI generates a relevant follow-up, simulating the natural back-and-forth of a real interview conversation.",
    color: "#8b5cf6",
  },
]

function CoachCard({ card, index, total, scrollYProgress }) {
  const { theme } = useTheme()
  const dark = theme === "dark"

  const start = index / total
  const end   = (index + 1) / total

  const y       = useTransform(scrollYProgress, [start, end], [60 * (index + 1), 0])
  const opacity = useTransform(scrollYProgress, [start - 0.05, start + 0.1], [0, 1])
  const scale   = useTransform(scrollYProgress, [start, end], [0.92, 1])

  return (
    <motion.div
      style={{ y, opacity, scale, zIndex: index + 1, position: "sticky", top: `${80 + index * 16}px` }}
      className={`rounded-3xl p-6 md:p-8 border shadow-xl mb-4 ${
        dark
          ? "bg-gray-900/95 border-white/10 backdrop-blur-xl"
          : "bg-white/95 border-gray-200 backdrop-blur-xl shadow-gray-200/80"
      }`}
    >
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: `${card.color}18` }}>
          {card.icon}
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: card.color }}>
            {card.tag}
          </span>
          <h3 className={`text-xl font-black mt-1 mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
            {card.title}
          </h3>
          <p className={`text-sm leading-relaxed ${dark ? "text-white/60" : "text-gray-600"}`}>
            {card.desc}
          </p>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: `${card.color}20`, color: card.color }}>
          {index + 1}
        </div>
      </div>
      {/* Bottom accent line */}
      <div className="mt-5 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${card.color}60, transparent)` }} />
    </motion.div>
  )
}

export default function CoachScrollStack() {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
          Live Typing Coach
        </p>
        <h2 className={`text-4xl font-black tracking-tight mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
          Your friendly guidance block
        </h2>
        <p className={`max-w-xl mx-auto text-sm ${dark ? "text-white/60" : "text-gray-600"}`}>
          Six ways PrepZona coaches you through every interview, live and in real time.
        </p>
      </div>

      <div ref={containerRef} style={{ height: `${COACH_CARDS.length * 120 + 400}px` }}>
        <div className="sticky top-20">
          {COACH_CARDS.map((card, i) => (
            <CoachCard
              key={card.title}
              card={card}
              index={i}
              total={COACH_CARDS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}