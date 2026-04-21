import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/context/AuthContext"
import AuroraHeading from "@/components/ui/AuroraHeading"
import RainbowButton from "@/components/ui/RainbowButton"
import PointerGlow from "@/components/ui/PointerGlow"
import ScrollProgress from "@/components/ui/ScrollProgress"
import TiltedCard from "@/components/ui/TiltedCard"
import HeroVideoDialog from "@/components/ui/HeroVideoDialog"
import NeonCard from "@/components/ui/NeonCard"
import PillNav from "@/components/Pillnav"
import SpotlightCard from "@/components/Spotlightcard"
import CoachScrollStack from "@/components/Coachscrollstack"
import FlowingMenu from "@/components/Flowingmenu"
import SessionStepper from "@/components/Sessionstepper"
import PrepHighlights from "@/components/PrepHighlights"
import PracticeIconCloud from "@/components/PracticeIconCloud"
import ReviewsMarquee from "@/components/Reviewsmarquee"
import ResumeLanyard from "@/components/Resumelanyard"

const fv = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
})

const USE_CASES = [
  { icon: "💼", title: "Job Interviews",      desc: "Ace technical and HR rounds at any company.", color: "#6366f1" },
  { icon: "🎓", title: "Campus Placements",   desc: "Prepare for on-campus drives and aptitude rounds.", color: "#ec4899" },
  { icon: "🏢", title: "Walk-in Interviews",  desc: "Practice on the go before a walk-in session.", color: "#f59e0b" },
  { icon: "🌐", title: "Remote Interviews",   desc: "Get real-time AI help during video call interviews.", color: "#10b981" },
  { icon: "💻", title: "Coding Rounds",       desc: "Solve LeetCode-style problems with AI guidance.", color: "#3b82f6" },
  { icon: "📋", title: "Resume-Based Q&A",    desc: "Get questions tailored to your actual resume.", color: "#8b5cf6" },
]

const FEATURES = [
  { tag: "AI Answers",   icon: "🤖", title: "Real-Time AI Answers",      desc: "Get instant, accurate answers to any interview question the moment it's asked.", color: "#6366f1" },
  { tag: "Transcription",icon: "🎙️", title: "Blazing Fast Transcription", desc: "State-of-the-art speech-to-text converts your answers in milliseconds.", color: "#ec4899" },
  { tag: "Resume",       icon: "📄", title: "Resume-Based Questions",     desc: "Upload your resume and get questions tailored to your actual experience.", color: "#f59e0b" },
  { tag: "Analytics",    icon: "📊", title: "Deep Performance Tracking",  desc: "Pie, line, bar, and radar charts to visualise every dimension of progress.", color: "#10b981" },
  { tag: "Feedback",     icon: "✍️", title: "Detailed AI Feedback",       desc: "Strengths, weaknesses, and improvement tips after every single answer.", color: "#3b82f6" },
  { tag: "Notes",        icon: "📝", title: "Auto Session Notes",          desc: "Full summary with scores and insights generated after each session.", color: "#8b5cf6" },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { user } = useAuth()
  const dark = theme === "dark"

  const neonHighlights = [
    { badge: "Live", title: "Real-time AI answers", description: "Answer detection, smart prompts, and on-the-fly hints." },
    { badge: "Transcripts", title: "Speech-to-text", description: "Fast transcripts with filler-word cleanup and time stamps." },
    { badge: "Insights", title: "Interview analytics", description: "Scores, charts, and drilldowns for every session." },
    { badge: "Delivery", title: "Communication coach", description: "Tone, pace, confidence, and clarity tracking." },
  ]

  // ── COLOR TOKENS ──────────────────────────────────────
  // Light mode: deep charcoal text on warm bg
  // Dark mode: clean white text on dark bg
  const tx   = dark ? "text-white"          : "text-gray-900"
  const su   = dark ? "text-white/65"       : "text-gray-600"
  const mu   = dark ? "text-white/40"       : "text-gray-400"
  const head = dark ? "text-white"          : "text-gray-900"

  // Card surfaces
  const card = dark
    ? "bg-white/6 border border-white/10 backdrop-blur-sm"
    : "bg-white/80 border border-gray-200/80 backdrop-blur-sm shadow-sm"

  const cardHover = dark
    ? "hover:bg-white/10 hover:border-white/20"
    : "hover:bg-white hover:border-gray-300 hover:shadow-md"

  return (
    <div className={`relative z-10 min-h-screen ${tx}`}>
      <ScrollProgress />
      <PointerGlow color={dark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)"} />

      {/* ── NAV ── */}
      <PillNav navigate={navigate} />

      {/* ── HERO ── */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
            dark ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"
          }`}
        >
          <span>🎯</span> AI-Powered Interview Preparation
        </motion.div>

        <AuroraHeading
          title="PrepZona. Interview flow with a spark."
          subtitle="Practice with AI, get instant feedback, and track your progress in one calm workspace."
          className="w-full"
          dark={dark}
        />

        <div id="demo" className="w-full max-w-4xl">
          <HeroVideoDialog
            title="See PrepZona in action"
            videoSrc="/PREPZONAVdo.mp4"
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <RainbowButton onClick={() => navigate(user ? "/home" : "/login")}>
            {user ? "Start New Session" : "Start Free Session"}
          </RainbowButton>
          <button onClick={() => navigate("/stats")}
            className={`px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:scale-105 ${
              dark ? "border-white/20 text-white/70 hover:bg-white/8" : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/60"
            }`}
          >
            View Analytics
          </button>
        </motion.div>

        {/* Mock UI card with tilted effect */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-4xl w-full"
        >
          <TiltedCard>
            <div className="p-6 md:p-8">
              <div className={`flex items-center gap-2 mb-4 text-sm ${dark ? "text-white/70" : "text-gray-700"}`}>
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs font-mono">prepzona - live session</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`rounded-2xl p-4 border ${dark ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200"}`}>
                  <p className={`text-xs uppercase tracking-widest mb-2 font-semibold ${dark ? "text-white/60" : "text-gray-600"}`}>Question Detected</p>
                  <p className={`text-sm leading-relaxed ${dark ? "text-white/85" : "text-gray-900"}`}>"Tell me about a time you optimised a slow database query in production..."</p>
                </div>
                <div className={`rounded-2xl p-4 border ${dark ? "bg-white/5 border-indigo-300/30" : "bg-white/60 border-indigo-200/60"}`}>
                  <p className={`text-xs uppercase tracking-widest mb-2 font-semibold ${dark ? "text-indigo-200" : "text-indigo-600"}`}>AI Answer</p>
                  <p className={`text-sm leading-relaxed ${dark ? "text-white/85" : "text-gray-900"}`}>"In my last role I identified an N+1 query using EXPLAIN ANALYZE, added a compound index, reducing load time from 4s to 180ms..."</p>
                </div>
              </div>
              <div className={`flex items-center justify-between mt-4 pt-4 border-t text-xs ${dark ? "border-white/10 text-white/70" : "border-gray-200 text-gray-700"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${dark ? "bg-emerald-400" : "bg-emerald-500"}`}></div>
                  <span>Listening...</span>
                </div>
                <span>Session: 08:42 · Score: 8.5/10</span>
              </div>
            </div>
          </TiltedCard>
        </motion.div>
      </section>

      <CoachScrollStack />

      {/* ── USE CASES ── */}
      <section id="usecases" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fv(0)} className="text-center mb-14">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? "text-indigo-400" : "text-indigo-500"}`}>Versatile</p>
          <h2 className={`text-4xl font-black tracking-tight mb-4 ${head}`}>Can be used for...</h2>
          <p className={`max-w-xl mx-auto ${su}`}>PrepZona adapts to every interview scenario you face.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {USE_CASES.map((u, i) => (
            <SpotlightCard
              key={i}
              title={u.title}
              description={u.desc}
              icon={u.icon}
              color={u.color}
              onClick={() => navigate(user ? "/home" : "/login")}
            />
          ))}
        </div>
      </section>

      <FlowingMenu />

      {/* ── RESUME SECTION ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fv(0)}
          className={`rounded-3xl p-10 grid md:grid-cols-2 gap-10 items-center ${
            dark
              ? "bg-gradient-to-br from-indigo-900/40 to-purple-900/25 border border-indigo-500/20"
              : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
          }`}
        >
          <div>
            <span className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-500"}`}>Resume Intelligence</span>
            <h2 className={`text-3xl font-black mt-2 mb-4 ${head}`}>Questions Based on YOUR Resume</h2>
            <p className={`${su} leading-relaxed mb-6`}>Upload your resume once. PrepZona reads your actual projects, skills, and experience - then asks questions a real interviewer would ask about your specific background.</p>
            <ul className="flex flex-col gap-3 mb-8">
              {["Questions about your exact projects","Role-specific technical deep dives","Gap analysis - spots weak areas in your CV","Tailored feedback for your experience level"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${dark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>✓</div>
                  <span className={`text-sm ${su}`}>{item}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => navigate(user ? "/home" : "/login")}
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
              Try Resume Interview →
            </button>
          </div>
          <div className={`rounded-2xl p-6 ${dark ? "bg-black/30" : "bg-white shadow-md"}`}>
            <ResumeLanyard />
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>📄</div>
              <div>
                <p className={`text-sm font-semibold ${head}`}>resume_2025.pdf</p>
                <p className={`text-xs ${mu}`}>Uploaded · 3 pages</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className={`text-xs font-mono ${dark ? "text-indigo-400" : "text-indigo-500"}`}>// AI generating resume-based question...</p>
              <div className={`rounded-xl p-3 ${dark ? "bg-white/5" : "bg-gray-50 border border-gray-100"}`}>
                <p className={`text-xs font-semibold ${mu} mb-1`}>Question</p>
                <p className={`text-xs ${su}`}>"You listed building a payment gateway at FinTech Corp - what was the biggest technical challenge and how did you resolve it?"</p>
              </div>
              <div className={`rounded-xl p-3 ${dark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200"}`}>
                <p className={`text-xs font-semibold mb-1 ${dark ? "text-indigo-400" : "text-indigo-500"}`}>Score after answer</p>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-1.5 rounded-full ${dark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <div className="h-full rounded-full bg-indigo-500 w-4/5"></div>
                  </div>
                  <span className={`font-bold text-sm ${dark ? "text-indigo-300" : "text-indigo-600"}`}>8.2/10</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <SessionStepper />

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fv(0)} className="text-center mb-14">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? "text-indigo-400" : "text-indigo-500"}`}>Features</p>
          <h2 className={`text-4xl font-black tracking-tight mb-4 ${head}`}>Everything you need to ace interviews</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((ft, i) => (
            <motion.div key={i} {...fv(i * 0.06)}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(user ? "/home" : "/login")}
              className={`${card} ${cardHover} rounded-2xl p-6 flex flex-col gap-3 cursor-pointer transition-all duration-200 group relative overflow-hidden`}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${ft.color}12, transparent)` }}
              />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-200 relative"
                style={{ background: `${ft.color}20` }}>
                {ft.icon}
              </div>
              <div className="relative">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ft.color }}>{ft.tag}</span>
                <h3 className={`font-bold text-sm mt-0.5 ${head} group-hover:text-indigo-500 transition-colors`}>{ft.title}</h3>
              </div>
              <p className={`text-xs leading-relaxed ${su} relative`}>{ft.desc}</p>
              <div className="h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-300" style={{ background: ft.color }}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── NEON GRADIENT STACK ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <motion.div {...fv(0)} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? "text-cyan-300" : "text-cyan-600"}`}>Deep dive</p>
            <h3 className={`text-3xl font-black ${head}`}>PrepZona's neon stack</h3>
            <p className={`${su} mt-2 max-w-xl`}>A quick peek at the experience layers: live answers, speech, analytics, and delivery coaching.</p>
          </div>
          <RainbowButton onClick={() => navigate(user ? "/home" : "/login")}>Launch PrepZona</RainbowButton>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          {neonHighlights.map((item, idx) => (
            <NeonCard key={item.title} title={item.title} description={item.description} badge={item.badge} delay={idx * 0.05} />
          ))}
        </div>
      </section>

      <PrepHighlights />

      <PracticeIconCloud />

      {/* ── FEEDBACK PREVIEW ── */}
      <section id="feedback" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div {...fv(0)} className="text-center mb-14">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? "text-indigo-400" : "text-indigo-500"}`}>Feedback</p>
          <h2 className={`text-4xl font-black tracking-tight mb-4 ${head}`}>Detailed Feedback After Every Answer</h2>
          <p className={`max-w-xl mx-auto ${su}`}>Not just a score - understand exactly what you did well and how to improve.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Overall Score", content: (
              <div>
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-5xl font-black ${dark ? "text-indigo-400" : "text-indigo-600"}`}>8.2</span>
                  <span className={`text-lg mb-1 ${mu}`}>/10</span>
                </div>
                <div className="space-y-3">
                  {[["Technical","90%","#6366f1"],["Communication","80%","#ec4899"],["Confidence","75%","#f59e0b"]].map(([l,v,c]) => (
                    <div key={l}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={su}>{l}</span>
                        <span className="font-bold" style={{ color: c }}>{v}</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${dark ? "bg-white/10" : "bg-gray-100"}`}>
                        <motion.div className="h-full rounded-full" style={{ background: c }}
                          initial={{ width: 0 }} whileInView={{ width: v }} viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )},
            { label: "Strengths & Improvements", content: (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">✓ Strengths</p>
                  {["Clear problem decomposition","Good use of real examples","Confident delivery"].map(s => (
                    <div key={s} className="flex items-start gap-2 mb-1.5">
                      <span className="text-emerald-500 text-xs mt-0.5">●</span>
                      <span className={`text-xs ${su}`}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className={`border-t ${dark ? "border-white/10" : "border-gray-100"} pt-3`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">↑ Improve</p>
                  {["Add time/space complexity","Be more concise"].map(s => (
                    <div key={s} className="flex items-start gap-2 mb-1.5">
                      <span className="text-orange-500 text-xs mt-0.5">●</span>
                      <span className={`text-xs ${su}`}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )},
            { label: "AI Written Feedback", content: (
              <div className="flex flex-col gap-3">
                <p className={`text-sm leading-relaxed ${su}`}>"Your answer demonstrated strong practical knowledge. You correctly identified the root cause and proposed a clean solution. Mention Big O notation next time."</p>
                <div className={`rounded-xl p-3 ${dark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200"}`}>
                  <p className={`text-xs font-semibold mb-1 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>Follow-up Question</p>
                  <p className={`text-xs ${dark ? "text-white/70" : "text-gray-700"}`}>"What would happen if the dataset was 100x larger and didn't fit in memory?"</p>
                </div>
              </div>
            )},
          ].map(({ label, content }, i) => (
            <motion.div key={i} {...fv(i * 0.08)}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`${card} ${cardHover} rounded-2xl p-6 transition-all duration-200 cursor-default`}
            >
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${mu}`}>{label}</p>
              {content}
            </motion.div>
          ))}
        </div>
        <motion.div {...fv(0.2)} className="text-center">
          <button onClick={() => navigate(user ? "/home" : "/login")}
            className="px-8 py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
          >
            Get Detailed Feedback →
          </button>
        </motion.div>
      </section>

      <ReviewsMarquee />

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div {...fv(0)} className="max-w-4xl mx-auto rounded-3xl p-12 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-indigo-500/25">
          <h2 className="text-4xl font-black tracking-tight mb-4 text-white">Ready to ace your next interview?</h2>
          <p className="text-white/75 mb-8 max-w-xl mx-auto">Join thousands of job seekers who use PrepZona to practice smarter and land their dream jobs.</p>
          <button onClick={() => navigate(user ? "/home" : "/login")}
            className="px-10 py-4 rounded-2xl bg-white text-indigo-600 font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            {user ? "Start New Session →" : "Create Free Account →"}
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t ${dark ? "border-white/10" : "border-gray-200"} px-8 py-10`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <span className={`font-bold text-sm ${head}`}>PrepZona</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {[["#usecases","Use Cases"],["#features","Features"],["#feedback","Feedback"],["#reviews","Reviews"]].map(([href, label]) => (
              <a key={href} href={href} className={`${su} hover:text-indigo-500 transition-colors`}>{label}</a>
            ))}
          </div>
          <p className={`text-xs ${mu}`}>© 2025 PrepZona. All rights reserved.</p>
        </div>
      </footer>

      <style>{`html { scroll-behavior: smooth; }`}</style>
    </div>
  )
}
