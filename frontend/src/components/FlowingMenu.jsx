import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"

const FLOW_ITEMS = [
  { step: "01", label: "Pick a Role",         sub: "Type any job title — frontend, backend, PM, anything" },
  { step: "02", label: "Choose Round",        sub: "Technical or HR — tailored questions for each type" },
  { step: "03", label: "Upload Resume",       sub: "Optional but powerful — questions from your actual CV" },
  { step: "04", label: "Answer 5 Questions",  sub: "Speak or type — AI listens and scores each response" },
  { step: "05", label: "Get Feedback",        sub: "Strengths, improvements, and follow-up questions" },
  { step: "06", label: "Track Progress",      sub: "Charts and session history to show your growth" },
]

function FlowRow({ item, index }) {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const [hovered, setHovered] = useState(false)
  const rowRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const bgX = useTransform(mouseXSpring, [-200, 200], ["-10%", "10%"])

  function onMouseMove(e) {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
  }

  const colors = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6"]
  const color  = colors[index % colors.length]

  return (
    <motion.div
      ref={rowRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden flex items-center justify-between px-8 py-5 border-b cursor-default transition-colors duration-200 ${
        dark
          ? "border-white/8 hover:border-white/20"
          : "border-gray-200 hover:border-indigo-200"
      }`}
      animate={{ paddingLeft: hovered ? 48 : 32 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* flowing bg on hover */}
      {hovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: bgX, background: `linear-gradient(135deg, ${color}12, transparent 60%)` }}
        />
      )}

      <div className="flex items-center gap-6 relative">
        <span className="text-[11px] font-black tabular-nums" style={{ color: hovered ? color : dark ? "rgba(255,255,255,0.2)" : "#d1d5db" }}>
          {item.step}
        </span>
        <motion.div animate={{ x: hovered ? 4 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
          <p className={`font-black text-lg leading-tight ${dark ? "text-white" : "text-gray-900"}`}>
            {item.label}
          </p>
          <p className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-gray-500"}`}>{item.sub}</p>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
        transition={{ duration: 0.2 }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm relative"
        style={{ background: color }}
      >
        →
      </motion.div>
    </motion.div>
  )
}

export default function FlowingMenu() {
  const { theme } = useTheme()
  const dark = theme === "dark"

  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
          Flow at a glance
        </p>
        <h2 className={`text-4xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
          How PrepZona works
        </h2>
      </div>

      <div className={`rounded-3xl overflow-hidden border ${dark ? "border-white/10 bg-white/3" : "border-gray-200 bg-white/60"}`}>
        {FLOW_ITEMS.map((item, i) => (
          <FlowRow key={item.step} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}