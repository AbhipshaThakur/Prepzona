import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"


export default function ResumeLanyard() {
  const { theme } = useTheme()
  const dark = theme === "dark"

  return (
    <div className="relative flex items-start justify-center select-none" style={{ height: 320 }}>
      {/* Lanyard cord */}
      <svg className="absolute top-0 left-1/2 -translate-x-1/2" width="80" height="160"
        viewBox="0 0 80 160" fill="none">
        <motion.path
          d="M40 0 C40 60, 10 80, 40 160"
          stroke={dark ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.4)"}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ d: [
            "M40 0 C40 60, 10 80, 40 160",
            "M40 0 C40 60, 70 80, 40 160",
            "M40 0 C40 60, 10 80, 40 160",
          ]}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Clip/hook */}
        <motion.rect x="33" y="154" width="14" height="8" rx="3"
          fill={dark ? "#6366f1" : "#4f46e5"}
          animate={{ x: [33, 33, 33], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Badge card */}
      <motion.div
        style={{ marginTop: 150, transformOrigin: "top center" }}
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`relative w-52 rounded-3xl overflow-hidden shadow-2xl border ${
          dark
            ? "bg-gray-900 border-indigo-500/40 shadow-indigo-500/20"
            : "bg-white border-indigo-300/60 shadow-indigo-200/60"
        }`}
      >
        {/* Top color bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Hole */}
        <div className="flex justify-center pt-3 pb-1">
          <div className={`w-5 h-5 rounded-full border-4 ${
            dark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"
          }`} />
        </div>

        {/* Badge content */}
        <div className="px-5 pb-6 pt-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            PZ
          </div>
          <p className={`font-black text-base tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            PrepZona
          </p>
          <p className={`text-[10px] uppercase tracking-[0.2em] mt-0.5 ${dark ? "text-indigo-400" : "text-indigo-500"}`}>
            AI Interview Coach
          </p>

          <div className={`mt-4 pt-3 border-t text-left space-y-1.5 ${dark ? "border-white/10" : "border-gray-100"}`}>
            {[
              { label: "Role",    val: "Full Stack Dev" },
              { label: "Mode",    val: "Technical Round" },
              { label: "Status",  val: "🟢 Active" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold ${dark ? "text-white/35" : "text-gray-400"}`}>{label}</span>
                <span className={`text-[10px] font-bold ${dark ? "text-white/80" : "text-gray-700"}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* Barcode */}
          <div className="mt-4 flex gap-px justify-center">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i}
                className={dark ? "bg-white/20" : "bg-gray-300"}
                style={{ width: i % 4 === 0 ? 3 : 1, height: i % 3 === 0 ? 20 : 14 }}
              />
            ))}
          </div>
          <p className={`text-[8px] mt-1 tracking-widest ${dark ? "text-white/20" : "text-gray-300"}`}>
            PREPZONA-2025-AI
          </p>
        </div>
      </motion.div>
    </div>
  )
}