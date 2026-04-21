import { motion } from "framer-motion"

export default function RainbowButton({ children, onClick, className = "" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-5 py-3 font-semibold text-white overflow-hidden rounded-xl shadow-lg ${className}`}
    >
      <span className="absolute inset-[-40%] bg-[conic-gradient(at_50%_50%,#f97316,#facc15,#22c55e,#06b6d4,#3b82f6,#a855f7,#f472b6,#f97316)] animate-spin-slow opacity-80" />
      <span className="absolute inset-[2px] rounded-[0.75rem] bg-gray-900" />
      <span className="relative z-10"> {children} </span>
    </motion.button>
  )
}
