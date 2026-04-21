import { motion } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"

export default function ThemeToggleFancy() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === "dark"
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.94 }}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/60 dark:bg-white/5 shadow-sm"
    >
      <motion.div
        layout
        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
          dark ? "bg-indigo-500 text-white" : "bg-amber-400 text-gray-900"
        }`}
      >
        {dark ? "🌙" : "☀️"}
      </motion.div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
        {dark ? "Dark" : "Light"}
      </span>
    </motion.button>
  )
}
