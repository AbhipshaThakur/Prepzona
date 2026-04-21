import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"
import { getReviews, postReview } from "@/services/ApiService"
import { useAuth } from "@/context/AuthContext"
import Marquee from "@/components/ui/Marquee"

const AVATAR_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6"]

function normalizeReviews(items) {
  if (!Array.isArray(items)) return []

  const seen = new Set()
  return items.filter((review) => {
    const text = review?.text?.trim() || ""
    const key = review?.id ? `id:${review.id}` : `${review?.email || ""}|${review?.date || ""}|${text.toLowerCase()}`
    if (!text || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function ReviewCard({ r, className = "" }) {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const color = AVATAR_COLORS[(r.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
  return (
    <div className={`shrink-0 w-72 rounded-2xl p-5 mx-3 flex flex-col gap-3 border ${
      dark ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-200 shadow-sm"
    } ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
          style={{ background: color }}>
          {r.avatar || r.name?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <p className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>{r.name}</p>
          <p className={`text-xs ${dark ? "text-white/35" : "text-gray-400"}`}>{r.email}</p>
        </div>
      </div>
      <p className={`text-xs leading-relaxed flex-1 ${dark ? "text-white/65" : "text-gray-600"}`}>
        "{r.text}"
      </p>
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
        <span className={`text-xs ${dark ? "text-white/30" : "text-gray-400"}`}>{r.date}</span>
      </div>
    </div>
  )
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-125"
        >
          <span className={(hover || value) >= s ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function ReviewsMarquee() {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const { user } = useAuth()
  const [reviews, setReviews]       = useState([])
  const [hasLoaded, setHasLoaded]   = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ rating: 5, text: "" })
  const [submitted, setSubmitted]   = useState(false)
  const [loading, setLoading]       = useState(false)

  const FALLBACK = [
    { id:1, name:"Rahul S.",  email:"rahul.s...@gmail.com",  avatar:"RS", rating:5, text:"Got my dream job at Amazon! The AI feedback was spot on and the resume questions were incredibly relevant.", date:"Apr 29, 2025" },
    { id:2, name:"Priya M.",  email:"priya.m...@gmail.com",  avatar:"PM", rating:5, text:"The real-time answers gave me so much confidence. The radar chart showed exactly where I needed to improve.", date:"Mar 15, 2025" },
    { id:3, name:"Aryan K.",  email:"aryan.k...@gmail.com",  avatar:"AK", rating:4, text:"Absolutely loved the session feedback. Very detailed, very accurate. Helped me crack my first technical round.", date:"Feb 20, 2025" },
    { id:4, name:"Sonal T.",  email:"sonal.t...@gmail.com",  avatar:"ST", rating:5, text:"The resume-based questions section is a game changer. It asked me about my exact projects and experience.", date:"Jan 10, 2025" },
    { id:5, name:"Dev P.",    email:"dev.p...@gmail.com",    avatar:"DP", rating:5, text:"Finally a tool that takes interview prep seriously. The follow-up questions feel like a real interview.", date:"Dec 5, 2024" },
    { id:6, name:"Sneha R.",  email:"sneha.r...@gmail.com",  avatar:"SR", rating:4, text:"Voice recognition works perfectly. No lag, no errors. My answers sounded natural and the AI scored them fairly.", date:"Nov 20, 2024" },
  ]

  async function loadReviews() {
    try {
      const data = await getReviews()
      const nextReviews = Array.isArray(data) && data.length > 0 ? data : FALLBACK
      setReviews(normalizeReviews(nextReviews))
    } catch {
      setReviews(normalizeReviews(FALLBACK))
    } finally {
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  async function submit(e) {
    e.preventDefault()
    const text = form.text.trim()
    if (!text) return
    setLoading(true)

    try {
      await postReview({ rating: form.rating, text })
      await loadReviews()
      setForm({ rating: 5, text: "" })
      setShowModal(false)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const displayReviews = reviews.length > 0 ? reviews : (hasLoaded ? FALLBACK : [])
  const row1 = displayReviews.filter((_, index) => index % 2 === 0)
  const row2 = displayReviews.filter((_, index) => index % 2 === 1)
  const topRow = row1.length > 0 ? row1 : displayReviews
  const bottomRow = row2.length > 0 ? row2 : topRow

  return (
    <section id="reviews" className="py-24">
      <div className="text-center mb-14 px-6">
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
          Reviews
        </p>
        <h2 className={`text-4xl font-black tracking-tight mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
          What users say 💬
        </h2>
        {user ? (
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-all hover:scale-105">
            + Write a Review
          </button>
        ) : (
          <p className={`text-sm ${dark ? "text-white/40" : "text-gray-500"}`}>
            Sign in to leave a review
          </p>
        )}
        {submitted && (
          <p className="text-emerald-500 text-sm mt-3 font-semibold">✓ Review added — thank you!</p>
        )}
      </div>

      {displayReviews.length > 0 && (
        <div className="space-y-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <Marquee pauseOnHover className="[--duration:36s] [--gap:1.25rem]">
            {topRow.map((review) => (
              <ReviewCard key={review.id || `${review.email}-${review.date}-top`} r={review} />
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className="[--duration:42s] [--gap:1.25rem]">
            {bottomRow.map((review) => (
              <ReviewCard key={review.id || `${review.email}-${review.date}-bottom`} r={review} />
            ))}
          </Marquee>
        </div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-8 shadow-2xl ${
                dark ? "bg-gray-900 border border-white/15" : "bg-white border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}>Write a Review</h3>
                <button onClick={() => setShowModal(false)}
                  className={`text-2xl ${dark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>×</button>
              </div>
              <form onSubmit={submit} className="flex flex-col gap-5">
                <div>
                  <p className={`text-xs font-bold mb-2 ${dark ? "text-white/40" : "text-gray-500"}`}>Rating</p>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div>
                  <p className={`text-xs font-bold mb-2 ${dark ? "text-white/40" : "text-gray-500"}`}>Your Review</p>
                  <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Share your experience..." rows={4} required
                    className={`w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      dark ? "bg-white/8 border border-white/15 text-white placeholder-white/30"
                           : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm transition-all disabled:opacity-60">
                  {loading ? "Submitting..." : "Submit Review →"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
