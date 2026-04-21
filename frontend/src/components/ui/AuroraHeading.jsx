import { motion } from "framer-motion"


export default function AuroraHeading({ title, subtitle, className = "", dark = false }) {
  const titleColor = dark ? "text-white" : "text-gray-900"
  const subtitleColor = dark ? "text-white/80" : "text-gray-900"

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center text-center"
      >
        <h1 className={`max-w-6xl text-5xl font-black tracking-tight md:text-6xl ${titleColor}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mx-auto mt-4 max-w-3xl text-center text-lg ${subtitleColor}`}>{subtitle}</p>
        )}
      </motion.div>
    </div>
  )
}