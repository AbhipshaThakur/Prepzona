import { motion } from "framer-motion"

export default function TiltedCard({ children }) {
  return (
    <motion.div
      initial={{ rotateX: 0, rotateY: 0, y: 0 }}
      whileHover={{ rotateX: 6, rotateY: -6, y: -6 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="relative"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/0 blur-3xl opacity-60 pointer-events-none" />
      <div className="relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </motion.div>
  )
}
