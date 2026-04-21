import { motion } from "framer-motion"

export default function NeonCard({ title, description, badge }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative p-[1px] rounded-2xl bg-gradient-to-r from-[#00f5a0] via-[#00d9f5] to-[#b600f5]"
    >
      <div className="relative rounded-2xl bg-gray-900 text-white p-5 overflow-hidden">
        <div className="absolute inset-0 opacity-40 blur-3xl bg-gradient-to-br from-[#00f5a0]/50 via-[#00d9f5]/40 to-[#b600f5]/40" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">{badge}</p>
            <h4 className="text-lg font-bold mb-2">{title}</h4>
            <p className="text-sm text-white/75 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
