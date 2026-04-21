import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { getMyStats } from "@/services/ApiService"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/hooks/useTheme"

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"]
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

function getSessionStatus(score) {
  if (score >= 8) {
    return {
      dot: "bg-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-500",
      textColor: "text-emerald-500",
      text: "Excellent",
    }
  }

  if (score >= 5) {
    return {
      dot: "bg-yellow-400",
      badge: "bg-yellow-500/15 text-yellow-500",
      textColor: "text-yellow-500",
      text: "Good",
    }
  }

  return {
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-500",
    textColor: "text-red-500",
    text: "Needs Work",
  }
}

export default function Stats() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState(null)

  const tx = dark ? "text-white" : "text-gray-900"
  const mu = dark ? "text-white/40" : "text-gray-500"
  const su = dark ? "text-white/65" : "text-gray-600"
  const bg = dark
    ? "bg-white/5 border border-white/10 backdrop-blur"
    : "bg-white/90 border border-gray-200 shadow-sm"

  const tooltipStyle = {
    contentStyle: {
      background: dark ? "#1e293b" : "#fff",
      border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
      borderRadius: 12,
      color: dark ? "#fff" : "#111",
      fontSize: 12,
    },
    cursor: { fill: "rgba(99,102,241,0.08)" },
  }

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchStats()
  }, [user])

  async function fetchStats() {
    setLoading(true)
    setError("")
    try {
      const res = await getMyStats()
      if (res?.summary && typeof res.summary.total_sessions !== "undefined") {
        setData(res)
      } else {
        setData(null)
      }
    } catch (err) {
      setError(err.message || "Could not connect to server")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-sm ${mu}`}>Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">Lock</div>
          <h2 className={`text-2xl font-black mb-2 ${tx}`}>Sign in to see your stats</h2>
          <p className={`text-sm mb-6 ${su}`}>Your performance is personal. Sign in to track it.</p>
          <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">!</div>
          <h2 className={`text-xl font-black mb-2 ${tx}`}>Could not load stats</h2>
          <p className={`text-sm mb-6 ${su}`}>{error}</p>
          <button onClick={fetchStats} className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data || !data.sessions?.length) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">Target</div>
          <h2 className={`text-2xl font-black mb-2 ${tx}`}>No sessions yet</h2>
          <p className={`text-sm mb-6 ${su}`}>
            Complete your first interview to see your analytics here.
            {user && <span className={`block mt-1 text-xs ${mu}`}>Logged in as {user.email}</span>}
          </p>
          <button onClick={() => navigate("/home")} className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:scale-105 transition-all">
            Start First Interview
          </button>
        </div>
      </div>
    )
  }

  const { summary, charts, sessions } = data

  return (
    <div className={`relative z-10 min-h-screen ${tx} p-6 max-w-7xl mx-auto`}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate("/")}
            className={`text-sm mb-2 flex items-center gap-1 transition-colors ${mu} ${dark ? "hover:text-white" : "hover:text-gray-900"}`}
          >
            Back
          </button>
          <h1 className={`text-3xl font-black tracking-tight ${tx}`}>Performance Analytics</h1>
          <p className={`text-sm mt-1 ${mu}`}>{user.name}'s progress - {summary.total_sessions} session{summary.total_sessions > 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              dark ? "border-white/15 text-white/60 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Refresh
          </button>
          <button onClick={() => navigate("/home")} className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all hover:scale-105">
            New Session
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions", val: summary.total_sessions, icon: "Count", color: "#6366f1" },
          { label: "Overall Average", val: `${summary.overall_avg}/10`, icon: "Avg", color: "#f59e0b" },
          { label: "Best Score", val: `${summary.best_score}/10`, icon: "Best", color: "#10b981" },
          { label: "Practice Days", val: `${summary.active_days ?? summary.streak} days`, icon: "Days", color: "#ec4899" },
        ].map(({ label, val, icon, color }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className={`${bg} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs uppercase tracking-widest ${mu}`}>{label}</span>
              <span className={`text-xs font-bold ${mu}`}>{icon}</span>
            </div>
            <p className="text-2xl font-black" style={{ color }}>{val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`${bg} rounded-2xl p-6`}>
          <h3 className={`font-black mb-1 ${tx}`}>Score Over Time</h3>
          <p className={`text-xs mb-5 ${mu}`}>Your progress across sessions</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.line}>
              <XAxis dataKey="date" tick={{ fill: dark ? "#ffffff50" : "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: dark ? "#ffffff50" : "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className={`${bg} rounded-2xl p-6`}>
          <h3 className={`font-black mb-1 ${tx}`}>Score by Role</h3>
          <p className={`text-xs mb-5 ${mu}`}>Average per role</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.bar} barSize={28}>
              <XAxis dataKey="role" tick={{ fill: dark ? "#ffffff50" : "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: dark ? "#ffffff50" : "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {charts.bar.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className={`${bg} rounded-2xl p-6`}>
          <h3 className={`font-black mb-1 ${tx}`}>Skills Radar</h3>
          <p className={`text-xs mb-5 ${mu}`}>Competency breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={charts.radar}>
              <PolarGrid stroke={dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"} />
              <PolarAngleAxis dataKey="topic" tick={{ fill: dark ? "#ffffff60" : "#4b5563", fontSize: 11 }} />
              <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip {...tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className={`${bg} rounded-2xl p-6`}>
          <h3 className={`font-black mb-1 ${tx}`}>Interview Types</h3>
          <p className={`text-xs mb-5 ${mu}`}>Session distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts.pie}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {charts.pie.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: dark ? "#ffffff60" : "#6b7280" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`${bg} rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${dark ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
          <h3 className={`font-black ${tx}`}>Session History</h3>
          <span className={`text-xs ${mu}`}>Click a session to see details</span>
        </div>
        {sessions.map((session, index) => {
          const status = getSessionStatus(session.score)

          return (
            <div key={session.id}>
              <div
                onClick={() => setSelected(selected === index ? null : index)}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 cursor-pointer transition-colors ${
                  dark ? "hover:bg-white/3" : "hover:bg-gray-50"
                } ${index < sessions.length - 1 ? `border-b ${dark ? "border-white/5" : "border-gray-100"}` : ""}`}
              >
                <div>
                  <p className={`font-bold text-sm ${tx}`}>{session.role}</p>
                  <p className={`text-xs capitalize ${mu}`}>{session.type}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                  <span className={`font-black text-sm ${tx}`}>{session.score}/10</span>
                </div>
                <span className={`text-sm ${mu}`}>{session.questions} Qs</span>
                <span className={`text-sm ${mu}`}>{session.date}</span>
                <span className={`text-xs px-2 py-1 rounded-lg font-bold ${status.badge}`}>
                  {status.text}
                </span>
                <span className={`text-sm ${mu} transition-transform ${selected === index ? "rotate-180" : ""}`}>v</span>
              </div>

              <AnimatePresence>
                {selected === index && session.answers?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`overflow-hidden border-b ${dark ? "border-white/5" : "border-gray-100"}`}
                  >
                    <div className="px-6 py-4 space-y-3">
                      {session.video_url && (
                        <a href={`${API_BASE}${session.video_url}`} target="_blank" rel="noreferrer" className={`inline-flex text-xs font-semibold ${tx} underline underline-offset-2`}>
                          Open saved recording
                        </a>
                      )}
                      {session.answers.map((answer, answerIndex) => {
                        const answerStatus = getSessionStatus(answer.score)

                        return (
                          <div key={answerIndex} className={`rounded-xl p-4 ${dark ? "bg-white/3 border border-white/8" : "bg-gray-50 border border-gray-100"}`}>
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <p className={`text-xs font-black uppercase tracking-widest ${mu}`}>Q{answerIndex + 1}</p>
                              <span className={`text-xs font-black ${answerStatus.textColor}`}>
                                {answer.score}/10
                              </span>
                            </div>
                            <p className={`text-sm font-semibold mb-1 ${tx}`}>{answer.question}</p>
                            <p className={`text-xs mb-2 ${su}`}>{answer.answer}</p>
                            <p className={`text-xs italic ${mu}`}>{answer.feedback}</p>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
