import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function HeroVideoDialog({ title = "Watch how PrepZona works", videoSrc = "", poster }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/15 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-500">Demo</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Click play to open the video dialog. Replace the source with your own demo later.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-indigo-600 font-bold shadow-lg hover:shadow-xl transition-all"
          >
            ▶ Play demo
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-3xl border border-white/10"
            >
              {videoSrc ? (
                <video src={videoSrc} poster={poster} controls autoPlay className="w-full h-full" />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white/60 text-sm">
                  Add your .mp4 or YouTube embed later
                </div>
              )}
              <div className="p-3 flex justify-end">
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
