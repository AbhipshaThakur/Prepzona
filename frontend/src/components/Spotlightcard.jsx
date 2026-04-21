import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"


export default function SpotlightCard({ title, description, icon, tag, color = "#6366f1", onClick }) {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const cardRef = useRef(null)
  const [spot, setSpot] = useState({ x: 0, y: 0, opacity: 0 })

  function onMouseMove(e) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 })
  }
  function onMouseLeave() {
    setSpot(s => ({ ...s, opacity: 0 }))
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
        dark
          ? "bg-white/5 border border-white/10"
          : "bg-white/90 border border-gray-200/80 shadow-sm"
      }`}
    >
      {/* Spotlight layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: spot.opacity,
          background: `radial-gradient(350px circle at ${spot.x}px ${spot.y}px, ${color}22, transparent 70%)`,
        }}
      />

      {/* Bottom gradient line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="relative p-6 flex flex-col gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-200"
          style={{ background: `${color}20` }}>
          {icon}
        </div>

        {/* Tag + title */}
        <div>
          {tag && (
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>
              {tag}
            </span>
          )}
          <h3 className={`font-bold text-sm mt-0.5 transition-colors group-hover:text-indigo-500 ${
            dark ? "text-white" : "text-gray-900"
          }`}>{title}</h3>
        </div>

        <p className={`text-xs leading-relaxed ${dark ? "text-white/60" : "text-gray-600"}`}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}