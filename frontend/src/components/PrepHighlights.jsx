import { useTheme } from "@/hooks/useTheme"

const HIGHLIGHTS = [
  {
    tag: "Relevant",
    title: "Questions stay tied to your background",
    description: "Role, experience, interview type, focus topics, and resume details all feed the round.",
    color: "#6366f1",
  },
  {
    tag: "Natural",
    title: "You get room to finish your answer",
    description: "The interview waits for silence or your finish tap, so the next question does not cut you off.",
    color: "#ec4899",
  },
  {
    tag: "Useful",
    title: "Each session leaves something behind",
    description: "Saved resumes, recordings, answers, and feedback make your next practice round more focused.",
    color: "#10b981",
  },
]

export default function PrepHighlights() {
  const { theme } = useTheme()
  const dark = theme === "dark"

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${dark ? "text-pink-400" : "text-pink-600"}`}>
          Highlights
        </p>
        <h2 className={`text-4xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
          Why PrepZona works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl p-6 border transition-transform duration-200 hover:-translate-y-1 ${
              dark ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-200 shadow-sm"
            }`}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.24em] mb-4" style={{ color: item.color }}>
              {item.tag}
            </p>
            <h3 className={`text-xl font-black leading-tight mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
              {item.title}
            </h3>
            <p className={`text-sm leading-relaxed ${dark ? "text-white/60" : "text-gray-600"}`}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
