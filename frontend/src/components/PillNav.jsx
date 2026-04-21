import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/context/AuthContext"
import ThemeToggleFancy from "@/components/ui/ThemeToggleFancy"

const DEFAULT_NAV_LINKS = [
  { href: "#usecases", label: "Use Cases" },
  { href: "#features", label: "Features" },
  { href: "#feedback", label: "Feedback" },
  { href: "#reviews", label: "Reviews" },
]

export default function PillNav({ navigate, links = [] }) {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const dark = theme === "dark"

  const [menuOpen, setMenuOpen] = useState(false)
  const [logoOk, setLogoOk] = useState(true)
  const [activeLink, setActiveLink] = useState("")

  const navLinks = links.length ? links : DEFAULT_NAV_LINKS

  useEffect(() => {
    let frame = null
    const sectionEntries = navLinks
      .map(({ href }) => {
        const id = href.replace("#", "")
        const element = document.getElementById(id)
        return element ? { href, element } : null
      })
      .filter(Boolean)

    if (!sectionEntries.length) {
      setActiveLink(navLinks[0]?.href || "")
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => {
            const topDiff = Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top)
            if (topDiff !== 0) return topDiff
            return right.intersectionRatio - left.intersectionRatio
          })

        const nextEntry = visibleEntries[0]
        if (!nextEntry) return

        const nextLink = sectionEntries.find(({ element }) => element.id === nextEntry.target.id)?.href || navLinks[0]?.href || ""
        if (frame) window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(() => {
          setActiveLink((current) => (current === nextLink ? current : nextLink))
          frame = null
        })
      },
      {
        rootMargin: "-16% 0px -58% 0px",
        threshold: [0.05, 0.15, 0.3, 0.45, 0.6],
      }
    )

    sectionEntries.forEach(({ element }) => observer.observe(element))

    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [navLinks])

  const tx = dark ? "text-white" : "text-gray-900"
  const sub = dark ? "text-white/65" : "text-gray-600"
  const nav = dark
    ? "bg-gray-950/75 border-b border-white/10 backdrop-blur-xl"
    : "bg-white/80 border-b border-gray-200/80 backdrop-blur-xl shadow-sm"

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3 ${nav}`}>
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
        {logoOk ? (
          <img src="/logo.svg" alt="PrepZona" className="h-8 w-auto drop-shadow-sm" onError={() => setLogoOk(false)} />
        ) : (
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
            PZ
          </div>
        )}
        <span className={`font-black text-base tracking-tight ${tx}`}>PrepZona</span>
      </div>

      <div className={`hidden md:flex items-center rounded-full px-1 py-1 gap-1 ${dark ? "bg-white/8 border border-white/12" : "bg-gray-100/80 border border-gray-200"}`}>
        {navLinks.map(({ href, label }) => {
          const isActive = activeLink === href
          return (
            <a
              key={href}
              href={href}
              onClick={() => setActiveLink(href)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-75 ${
                isActive
                  ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                  : `${sub} ${dark ? "hover:bg-white/6 hover:text-white" : "hover:bg-white hover:text-gray-900"}`
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggleFancy />
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 hover:bg-indigo-500/25 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className={`text-sm font-semibold ${tx}`}>{user.name.split(" ")[0]}</span>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50 ${dark ? "bg-gray-900 border border-white/15" : "bg-white border border-gray-200"}`}
                >
                  {[
                    { label: "Start Interview", action: () => { navigate("/home"); setMenuOpen(false) } },
                    { label: "My Stats", action: () => { navigate("/stats"); setMenuOpen(false) } },
                    { label: "Sign Out", action: () => { logout(); setMenuOpen(false) }, red: true },
                  ].map(({ label, action, red }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${red ? "text-red-400 hover:bg-red-500/10" : `${sub} ${dark ? "hover:text-white hover:bg-white/5" : "hover:text-gray-900 hover:bg-gray-50"}`}`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className={`text-sm font-medium ${sub} ${dark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>
              Sign In
            </button>
            <button onClick={() => navigate("/login")} className="px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
              Try Free
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
