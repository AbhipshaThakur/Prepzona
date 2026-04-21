import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { loginUser, registerUser, googleAuth } from "@/services/ApiService"
import { useTheme } from "@/hooks/useTheme"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const [tab, setTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.")
      return
    }

    setGLoading(true)
    setError("")

    const client = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (response) => {
        if (response.error) {
          setError("Google sign-in failed. Try again.")
          setGLoading(false)
          return
        }

        try {
          const res = await googleAuth(response.access_token)
          if (res.token) {
            login(res.user, res.token)
            navigate("/")
          } else {
            setError(res.detail || "Google sign-in failed")
          }
        } catch (err) {
          setError(err.message || "Could not connect to server")
        } finally {
          setGLoading(false)
        }
      },
    })

    client?.requestAccessToken()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (tab === "register") {
      if (form.password !== form.confirm) return setError("Passwords don't match")
      if (form.password.length < 6) return setError("Password must be at least 6 characters")
    }

    setLoading(true)
    try {
      const res = tab === "login"
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser({ name: form.name, email: form.email, password: form.password })

      if (res.token) {
        login(res.user, res.token)
        navigate("/")
      } else {
        setError(res.detail || "Something went wrong")
      }
    } catch (err) {
      setError(err.message || "Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  const tx = dark ? "text-white" : "text-gray-900"
  const mu = dark ? "text-white/40" : "text-gray-500"
  const card = dark ? "bg-white/10 border border-white/20" : "bg-white/90 border border-gray-200"
  const inputCls = `w-full px-4 py-3 rounded-xl border transition-all text-sm focus:outline-none focus:border-indigo-400 ${
    dark
      ? "bg-white/10 border-white/20 text-white placeholder-white/30 focus:bg-white/15"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
  }`

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <span className="text-white font-bold">PZ</span>
          </div>
          <span className={`font-bold text-xl tracking-tight ${tx}`}>PrepZona</span>
        </div>

        <div className={`${card} backdrop-blur-xl rounded-3xl p-8 shadow-2xl`}>
          <div className={`flex rounded-xl p-1 mb-8 ${dark ? "bg-white/5" : "bg-gray-100"}`}>
            {["login", "register"].map((item) => (
              <button
                key={item}
                onClick={() => { setTab(item); setError("") }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  tab === item
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : `${tx} opacity-70 hover:opacity-100`
                }`}
              >
                {item === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {tab === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input type="text" placeholder="Full Name" value={form.name} onChange={set("name")} required className={inputCls} />
                </motion.div>
              )}
            </AnimatePresence>

            <input type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required className={inputCls} />
            <input type="password" placeholder="Password" value={form.password} onChange={set("password")} required className={inputCls} />

            <AnimatePresence mode="wait">
              {tab === "register" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={set("confirm")} required className={inputCls} />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`px-4 py-3 rounded-xl border text-sm ${
                  dark ? "bg-red-500/20 border-red-500/30 text-red-200" : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60 mt-2"
            >
              {loading ? "Please wait..." : tab === "login" ? "Sign In ->" : "Create Account ->"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-gray-200"}`}></div>
            <span className={`text-xs ${mu}`}>or continue with</span>
            <div className={`flex-1 h-px ${dark ? "bg-white/10" : "bg-gray-200"}`}></div>
          </div>

          <button
            onClick={handleGoogleClick}
            disabled={gLoading}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              dark
                ? "bg-white/5 border border-white/15 hover:bg-white/10 text-white/80"
                : "bg-gray-50 border border-gray-200 hover:bg-white text-gray-700"
            }`}
          >
            {gLoading ? (
              <div className={`w-4 h-4 border-2 rounded-full animate-spin ${dark ? "border-white/40 border-t-white" : "border-gray-300 border-t-gray-700"}`} />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {gLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className={`text-center text-xs mt-6 ${mu}`}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError("") }} className={`font-semibold ${tx} hover:underline`}>
              {tab === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
