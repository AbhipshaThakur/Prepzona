import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }
})

function ScoreRing({ score, color, size = 64, max = 10 }) {
  const pct = Math.round((score / max) * 100)
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={size * 0.09}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.09}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text
        x={size / 2}
        y={size / 2 + size * 0.06}
        textAnchor="middle"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="800"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.22}
        textAnchor="middle"
        fill="rgba(255,255,255,0.3)"
        fontSize={size * 0.14}
      >
        /{max}
      </text>
    </svg>
  )
}

function ScoreBar({ label, value, max = 10, color }) {
  const pct = Math.round((value / max) * 100)

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="font-bold" style={{ color }}>
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export default function Feedback({
  results = [],
  role = "Software Engineer",
  sessionId,
  onRestart,
  saveStatus
}) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const [tab, setTab] = useState("overview")
  const [expanded, setExpanded] = useState(null)

  const totalQ = results.length
  const avgScore =
    totalQ > 0
      ? parseFloat((results.reduce((s, r) => s + (r.score || 0), 0) / totalQ).toFixed(1))
      : 0
  const bestQ = totalQ > 0 ? results.reduce((b, r) => (r.score > b.score ? r : b), results[0]) : null
  const worstQ = totalQ > 0 ? results.reduce((w, r) => (r.score < w.score ? r : w), results[0]) : null

  const scoreColor = avgScore >= 8 ? "#10b981" : avgScore >= 6 ? "#f59e0b" : "#ef4444"
  const scoreLabel = avgScore >= 8 ? "Excellent" : avgScore >= 6 ? "Good" : avgScore >= 4 ? "Fair" : "Needs Work"

  const allStrengths = results.flatMap(r => r.strengths || []).filter(Boolean)
  const allImprovements = results.flatMap(r => r.improvements || []).filter(Boolean)
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5)
  const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5)

  const card = dark ? "bg-white/5 border border-white/10" : "bg-white/90 border border-gray-200 shadow-sm"
  const tx = dark ? "text-white" : "text-gray-900"
  const mu = dark ? "text-white/40" : "text-gray-500"
  const su = dark ? "text-white/65" : "text-gray-600"

  const TABS = ["overview", "questions", "plan"]

  return (
    <div className={`relative z-10 min-h-screen p-6 ${dark ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-5xl mx-auto">
        <motion.div {...f(0)} className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className={`text-sm flex items-center gap-1 mb-2 transition-colors ${mu} ${dark ? "hover:text-white" : "hover:text-gray-900"}`}
            >
              ← Back to Home
            </button>
            <h1 className={`text-3xl font-black tracking-tight ${tx}`}>Interview Report</h1>
            <p className={`text-sm mt-1 ${mu}`}>
              {role} · {totalQ} questions
            </p>
          </div>
          <button
            onClick={onRestart || (() => navigate("/home"))}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-black transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
          >
            + New Interview
          </button>
        </motion.div>

        {saveStatus && (saveStatus.saved || saveStatus.error) && (
          <motion.div
            {...f(0.02)}
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              saveStatus.error
                ? dark
                  ? "bg-red-500/12 border-red-500/30 text-red-200"
                  : "bg-red-50 border-red-200 text-red-700"
                : dark
                  ? "bg-emerald-500/12 border-emerald-500/30 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {saveStatus.error
              ? saveStatus.error
              : saveStatus.videoSaved
                ? "Session, answers, and recording saved successfully."
                : "Session and answers saved successfully."}
          </motion.div>
        )}

        <motion.div {...f(0.05)} className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${dark ? "bg-white/8" : "bg-gray-100"}`}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                tab === t
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : `${mu} ${dark ? "hover:text-white" : "hover:text-gray-900"}`
              }`}
            >
              {t === "overview" ? "📊 Overview" : t === "questions" ? "💬 Per Question" : "🎯 Action Plan"}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg Score", val: `${avgScore}/10`, color: scoreColor, icon: "⭐" },
                  { label: "Questions", val: totalQ, color: "#6366f1", icon: "💬" },
                  { label: "Best Answer", val: bestQ ? `${bestQ.score}/10` : "—", color: "#10b981", icon: "🏆" },
                  { label: "Performance", val: scoreLabel, color: scoreColor, icon: "📈" }
                ].map(({ label, val, color, icon }, i) => (
                  <motion.div key={i} {...f(i * 0.06)} className={`${card} rounded-2xl p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs uppercase tracking-widest ${mu}`}>{label}</span>
                      <span className="text-lg">{icon}</span>
                    </div>
                    <p className="text-2xl font-black" style={{ color }}>
                      {val}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div {...f(0.1)} className={`${card} rounded-2xl p-6 flex flex-col items-center gap-4`}>
                  <p className={`text-xs uppercase tracking-widest ${mu}`}>Overall Score</p>
                  <ScoreRing score={avgScore} color={scoreColor} size={120} />
                  <div className={`text-center text-sm ${su}`}>
                    {avgScore >= 8
                      ? "Outstanding performance! You're interview-ready."
                      : avgScore >= 6
                        ? "Good job! A few areas to polish before the real thing."
                        : "Keep practising — focus on the action plan below."}
                  </div>
                </motion.div>

                <motion.div {...f(0.12)} className={`${card} rounded-2xl p-6 space-y-4`}>
                  <p className={`text-xs uppercase tracking-widest ${mu} mb-4`}>Score Breakdown</p>
                  {results.map((r, i) => (
                    <ScoreBar
                      key={i}
                      label={`Q${i + 1}: ${r.question.slice(0, 40)}…`}
                      value={r.score}
                      max={10}
                      color={r.score >= 8 ? "#10b981" : r.score >= 6 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div {...f(0.14)} className={`${card} rounded-2xl p-6`}>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">✓ Strengths</p>
                  {uniqueStrengths.length > 0 ? (
                    <div className="space-y-2">
                      {uniqueStrengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 text-xs mt-0.5">●</span>
                          <span className={`text-sm ${su}`}>{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${mu}`}>Complete an interview to see your strengths.</p>
                  )}
                </motion.div>

                <motion.div {...f(0.16)} className={`${card} rounded-2xl p-6`}>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">↑ Areas to Improve</p>
                  {uniqueImprovements.length > 0 ? (
                    <div className="space-y-2">
                      {uniqueImprovements.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 text-xs mt-0.5">●</span>
                          <span className={`text-sm ${su}`}>{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${mu}`}>No improvement areas identified.</p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {tab === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {results.length === 0 ? (
                <div className={`${card} rounded-2xl p-12 text-center`}>
                  <p className={mu}>No questions recorded.</p>
                </div>
              ) : (
                results.map((r, i) => {
                  const color = r.score >= 8 ? "#10b981" : r.score >= 6 ? "#f59e0b" : "#ef4444"
                  const isOpen = expanded === i

                  return (
                    <motion.div
                      key={i}
                      {...f(i * 0.05)}
                      className={`${card} rounded-2xl overflow-hidden cursor-pointer`}
                      onClick={() => setExpanded(isOpen ? null : i)}
                    >
                      <div className="p-5 flex items-center gap-4">
                        <ScoreRing score={r.score} color={color} size={52} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs uppercase tracking-widest mb-1 ${mu}`}>Question {i + 1}</p>
                          <p className={`font-semibold text-sm leading-snug ${tx}`}>{r.question}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-lg font-bold ${
                              r.score >= 8
                                ? "bg-emerald-500/15 text-emerald-400"
                                : r.score >= 6
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {r.score >= 8 ? "Strong" : r.score >= 6 ? "Good" : "Weak"}
                          </span>
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className={`text-lg ${mu}`}>
                            ▾
                          </motion.span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`border-t ${dark ? "border-white/8" : "border-gray-100"} overflow-hidden`}
                          >
                            <div className="p-5 space-y-4">
                              <div>
                                <p className={`text-xs font-black uppercase tracking-widest mb-2 ${mu}`}>Your Answer</p>
                                <p className={`text-sm leading-relaxed ${su}`}>{r.answer}</p>
                              </div>

                              <div className={`rounded-xl p-4 ${dark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
                                <p className={`text-xs font-black uppercase tracking-widest mb-2 ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                                  AI Feedback
                                </p>
                                <p className={`text-sm leading-relaxed ${su}`}>{r.feedback}</p>
                              </div>

                              {r.sample_answer && (
                                <div className={`rounded-xl p-4 ${dark ? "bg-white/4 border border-white/10" : "bg-gray-50 border border-gray-100"}`}>
                                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${mu}`}>Correct Answer Example</p>
                                  <p className={`text-sm leading-relaxed ${su}`}>{r.sample_answer}</p>
                                </div>
                              )}

                              {r.follow_up_question && (
                                <div className={`rounded-xl p-4 ${dark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
                                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${dark ? "text-amber-300" : "text-amber-700"}`}>
                                    Follow-Up Question
                                  </p>
                                  <p className={`text-sm leading-relaxed ${su}`}>{r.follow_up_question}</p>
                                </div>
                              )}

                              {r.strengths?.length > 0 && (
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">Strengths</p>
                                  <div className="flex flex-wrap gap-2">
                                    {r.strengths.map((s, j) => (
                                      <span
                                        key={j}
                                        className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {r.improvements?.length > 0 && (
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Improve</p>
                                  <div className="flex flex-wrap gap-2">
                                    {r.improvements.map((s, j) => (
                                      <span
                                        key={j}
                                        className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}

          {tab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div {...f(0)} className={`${card} rounded-2xl p-6`}>
                <h3 className={`text-xl font-black mb-1 ${tx}`}>Your Personalised Action Plan</h3>
                <p className={`text-sm mb-6 ${mu}`}>Based on your actual answers in this session.</p>

                {uniqueImprovements.length === 0 ? (
                  <p className={`text-sm ${mu}`}>No specific action items — great session!</p>
                ) : (
                  <div className="space-y-4">
                    {uniqueImprovements.map((item, i) => (
                      <motion.div
                        key={i}
                        {...f(i * 0.07)}
                        className={`flex items-start gap-4 rounded-xl p-4 border ${
                          dark ? "bg-white/3 border-white/8 hover:border-indigo-500/40" : "bg-gray-50 border-gray-100 hover:border-indigo-200"
                        } transition-all`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-base shrink-0">
                          {i === 0 ? "🎯" : i === 1 ? "📚" : i === 2 ? "💬" : i === 3 ? "⏱️" : "🔄"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-bold text-sm ${tx}`}>{item}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${i < 2 ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                              {i < 2 ? "High" : "Medium"}
                            </span>
                          </div>
                          <p className={`text-xs ${su}`}>Practice this consistently before your next session.</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div {...f(0.1)} className={`${card} rounded-2xl p-6`}>
                <h3 className={`font-black mb-4 ${tx}`}>Next Steps</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { icon: "🔄", title: "Practice Again", desc: "Run another session focusing on your weak areas.", action: () => onRestart?.() },
                    { icon: "📊", title: "View Progress", desc: "Check your performance charts over time.", action: () => navigate("/stats") },
                    { icon: "🏠", title: "Back to Home", desc: "Return to the dashboard.", action: () => navigate("/") }
                  ].map(({ icon, title, desc, action }, i) => (
                    <button
                      key={i}
                      onClick={action}
                      className={`text-left p-4 rounded-xl border transition-all hover:border-indigo-500/50 hover:scale-105 ${
                        dark ? "bg-white/3 border-white/8" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-2xl mb-2">{icon}</div>
                      <p className={`font-bold text-sm mb-1 ${tx}`}>{title}</p>
                      <p className={`text-xs ${mu}`}>{desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
