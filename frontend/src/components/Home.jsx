import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/hooks/useTheme"
import { getMe, addResume, deleteResume, getResumeText } from "@/services/ApiService"

const BTECH_TECH_ROLES = [
  "Software Engineer", "Associate Software Engineer", "Software Development Engineer", "Graduate Engineer Trainee",
  "Trainee Software Engineer", "Application Developer", "Web Developer", "Frontend Developer", "Senior Frontend Developer",
  "React Developer", "Vue Developer", "Angular Developer", "Next.js Developer", "Backend Developer",
  "Node.js Developer", "Python Developer", "Java Developer", "Spring Boot Developer", "Django Developer",
  "Flask Developer", "FastAPI Developer", "Go Developer", "Rust Developer", "C++ Developer", ".NET Developer",
  "Full Stack Developer", "MERN Stack Developer", "MEAN Stack Developer", "Mobile Developer", "Android Developer",
  "iOS Developer", "React Native Developer", "Flutter Developer", "Embedded Systems Engineer", "Firmware Engineer",
  "Electronics Engineer", "VLSI Engineer", "Cloud Engineer", "AWS Engineer", "Azure Engineer", "GCP Engineer",
  "DevOps Engineer", "Site Reliability Engineer", "Platform Engineer", "Security Engineer", "Cybersecurity Analyst",
  "QA Engineer", "Automation Engineer", "Test Engineer", "Database Administrator", "SQL Developer",
  "PostgreSQL Developer", "Data Analyst", "Data Engineer", "Data Scientist", "Business Intelligence Analyst",
  "BI Developer", "ML Engineer", "AI Engineer", "NLP Engineer", "Computer Vision Engineer",
  "Blockchain Developer", "Web3 Developer", "Network Engineer", "System Engineer", "Solutions Architect",
  "Cloud Architect", "Technical Lead", "Engineering Manager",
]

const MBA_TECH_ROLES = [
  "Business Analyst", "Product Analyst", "Associate Product Manager", "Product Manager", "Technical Product Manager",
  "Program Manager", "Technical Program Manager", "Project Manager", "Operations Analyst", "Business Operations Analyst",
  "Strategy Analyst", "Strategy and Operations Manager", "Consulting Analyst", "Technology Consultant",
  "ERP Consultant", "SAP Consultant", "CRM Consultant", "Pre-Sales Consultant", "Solutions Consultant",
  "Customer Success Manager", "Implementation Consultant", "Growth Analyst", "Marketing Analyst",
  "Digital Marketing Analyst", "Market Research Analyst", "Financial Analyst", "FinTech Analyst",
  "Supply Chain Analyst", "Risk Analyst", "Revenue Operations Analyst", "Category Manager",
  "Analytics Manager", "Data Analyst", "Business Intelligence Analyst", "Vendor Management Analyst",
]

const ALL_ROLES = [...new Set([...BTECH_TECH_ROLES, ...MBA_TECH_ROLES])]

const EXP_OPTS = [

  { value: "0", label: "Fresher (0 years)" },

  { value: "1", label: "1 year" },

  { value: "2", label: "2 years" },

  { value: "3", label: "3 years" },

  { value: "4", label: "4 years" },

  { value: "5", label: "5 years" },

  { value: "6", label: "6 years" },

  { value: "7", label: "7 years" },

  { value: "8", label: "8+ years" },

  { value: "10", label: "10+ years" },

  { value: "15", label: "15+ years" },

]

const TYPES = [

  { value: "technical", label: "Technical", icon: "SE", desc: "DSA, system design, coding", color: "#6366f1" },

  { value: "hr", label: "HR Round", icon: "HR", desc: "Behavioral and situational", color: "#ec4899" },

]

async function extractPdfText(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader()

    reader.onload = async (event) => {

      try {

        if (!window.pdfjsLib) {

          await new Promise((res, rej) => {

            const script = document.createElement("script")

            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"

            script.onload = res

            script.onerror = rej

            document.head.appendChild(script)

          })

          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        }

        const pdf = await window.pdfjsLib.getDocument(new Uint8Array(event.target.result)).promise

        let text = ""

        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {

          const page = await pdf.getPage(pageIndex)

          const content = await page.getTextContent()

          text += content.items.map((item) => item.str).join(" ") + "\n"

        }

        resolve(text.trim())

      } catch (error) {

        reject(error)

      }

    }

    reader.onerror = reject

    reader.readAsArrayBuffer(file)

  })

}

export default function Home() {

  const navigate = useNavigate()

  const { user } = useAuth()

  const { theme } = useTheme()

  const dark = theme === "dark"

  const [roleInput, setRole] = useState("")

  const [showDrop, setDrop] = useState(false)

  const [experience, setExp] = useState("0")

  const [topics, setTopics] = useState("")

  const [itype, setType] = useState("technical")

  const [savedResumes, setSaved] = useState([])

  const [selectedId, setSelId] = useState(null)

  const [uploading, setUploading] = useState(false)

  const [uploadMsg, setMsg] = useState("")

  const [deleting, setDeleting] = useState(null)

  const dropRef = useRef(null)

  useEffect(() => {

    if (!user) return

    getMe()

      .then((data) => {

        if (!data?.resumes) return

        setSaved(data.resumes)

        if (data.resumes.length > 0) setSelId(data.resumes[0].id)

      })

      .catch(() => {})

  }, [user])

  useEffect(() => {

    const handleClick = (event) => {

      if (dropRef.current && !dropRef.current.contains(event.target)) setDrop(false)

    }

    document.addEventListener("mousedown", handleClick)

    return () => document.removeEventListener("mousedown", handleClick)

  }, [])

  const filtered = roleInput.trim()

    ? ALL_ROLES.filter((role) => role.toLowerCase().includes(roleInput.toLowerCase())).slice(0, 8)

    : ALL_ROLES.slice(0, 8)

  async function handleUpload(file) {

    if (!file) return

    setUploading(true)

    setMsg("")

    try {

      const text = file.type === "application/pdf" ? await extractPdfText(file) : await file.text()

      const res = await addResume({ name: file.name, text })

      if (res?.id) {

        setSaved((prev) => [res, ...prev])

        setSelId(res.id)

        setMsg(`Saved ${file.name}`)

      } else {

        setMsg("Upload failed. Try again.")

      }

    } catch {

      setMsg("Could not read file.")

    } finally {

      setUploading(false)

    }

  }

  async function handleDelete(id) {

    setDeleting(id)

    try {

      await deleteResume(id)

      setSaved((prev) => {

        const next = prev.filter((resume) => resume.id !== id)

        if (selectedId === id) setSelId(next[0]?.id || null)

        return next

      })

    } catch {

      setMsg("Could not delete that resume.")

    } finally {

      setDeleting(null)

    }

  }

  async function handleStart() {

    if (!roleInput.trim()) {

      alert("Please enter a job role")

      return

    }

    let resume_text = ""

    if (selectedId) {

      try {

        const res = await getResumeText(selectedId)

        resume_text = res?.text || ""

      } catch {

        setMsg("Resume could not be loaded, but you can still continue.")

      }

    }

    navigate("/interview", {

      state: {

        role: roleInput.trim(),

        experience,

        notes: topics,

        interview_type: itype,

        resume_text,

      },

    })

  }

  const tx = dark ? "text-white" : "text-gray-900"

  const mu = dark ? "text-white/40" : "text-gray-500"

  const su = dark ? "text-white/70" : "text-gray-600"

  const card = dark ? "bg-white/10 border border-white/20" : "bg-white/88 border border-gray-200 shadow-xl"

  const inputCls = `w-full px-4 py-3 rounded-xl border transition-all text-sm focus:outline-none focus:border-indigo-400 ${

    dark

      ? "bg-white/10 border-white/20 text-white placeholder-white/30 focus:bg-white/15"

      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"

  }`

  return (

    <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">

      <motion.div

        initial={{ opacity: 0, y: 40 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5 }}

        className={`relative w-full max-w-lg ${card} backdrop-blur-xl rounded-3xl p-10 ${tx}`}

      >

        <h2 className="text-3xl font-black text-center mb-1">Start Your Interview</h2>

        <p className={`text-center text-sm mb-8 ${mu}`}>Customize your session</p>

        <div className="mb-4" ref={dropRef}>

          <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-1.5 ${mu}`}>Job Role</label>

          <div className="relative">

            <input

              type="text"

              placeholder="e.g. React Developer, Data Analyst"

              className={inputCls}

              value={roleInput}

              onChange={(event) => { setRole(event.target.value); setDrop(true) }}

              onFocus={() => setDrop(true)}

            />

            <AnimatePresence>

              {showDrop && (

                <motion.div

                  initial={{ opacity: 0, y: -6 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: -6 }}

                  transition={{ duration: 0.15 }}

                  className={`absolute top-full mt-1 w-full rounded-2xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto ${

                    dark ? "border border-white/12 bg-gray-900/95" : "border border-gray-200 bg-white"

                  }`}

                >

                  {roleInput.trim() && !ALL_ROLES.some((role) => role.toLowerCase() === roleInput.toLowerCase()) && (

                    <div onMouseDown={() => setDrop(false)} className={`px-4 py-3 text-sm font-semibold border-b cursor-pointer flex items-center gap-2 ${dark ? "text-white border-white/8 hover:bg-white/5" : "text-gray-900 border-gray-100 hover:bg-gray-50"}`}>

                      <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-white/10" : "bg-gray-100"}`}>Custom</span>

                      Use "{roleInput}"

                    </div>

                  )}

                  {filtered.map((role) => (

                    <div

                      key={role}

                      onMouseDown={() => { setRole(role); setDrop(false) }}

                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${dark ? "text-white/75 hover:bg-white/8 hover:text-white" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}

                    >

                      {role}

                    </div>

                  ))}

                </motion.div>

              )}

            </AnimatePresence>

          </div>

        </div>

        <div className="mb-4">

          <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-1.5 ${mu}`}>Experience</label>

          <select value={experience} onChange={(event) => setExp(event.target.value)} className={`${inputCls} cursor-pointer`}>

            {EXP_OPTS.map((option) => (

              <option key={option.value} value={option.value} className={dark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>

                {option.label}

              </option>

            ))}

          </select>

        </div>

        <div className="mb-4">

          <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-1.5 ${mu}`}>Interview Type</label>

          <div className="grid grid-cols-2 gap-3">

            {TYPES.map((type) => (

              <motion.button

                key={type.value}

                whileHover={{ scale: 1.03 }}

                whileTap={{ scale: 0.97 }}

                onClick={() => setType(type.value)}

                className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all ${

                  itype === type.value

                    ? dark ? "bg-white/15 text-white" : "bg-gray-50 text-gray-900"

                    : dark ? "border-white/12 bg-white/4 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"

                }`}

                style={itype === type.value ? { borderColor: type.color } : {}}

              >

                <span className="text-lg font-black">{type.icon}</span>

                <span className="font-black text-sm">{type.label}</span>

                <span className={`text-[11px] ${su}`}>{type.desc}</span>

              </motion.button>

            ))}

          </div>

        </div>

        <div className="mb-4">

          <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-1.5 ${mu}`}>

            Focus Topics <span className={`normal-case font-normal ${mu}`}>(optional)</span>

          </label>

          <textarea

            placeholder="e.g. React hooks, SQL, System Design"

            className={`${inputCls} resize-none`}

            rows={2}

            value={topics}

            onChange={(event) => setTopics(event.target.value)}

          />

        </div>

        <div className="mb-6">

          <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-1.5 ${mu}`}>

            Resume <span className={`normal-case font-normal ${mu}`}>(select from saved or upload new)</span>

          </label>

          {savedResumes.length > 0 && (

            <div className="flex flex-col gap-2 mb-3">

              {savedResumes.map((resume) => (

                <div

                  key={resume.id}

                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${

                    selectedId === resume.id

                      ? dark ? "border-white/30 bg-white/10" : "border-gray-300 bg-gray-50"

                      : dark ? "border-white/12 bg-white/4 hover:bg-white/8" : "border-gray-200 bg-white hover:bg-gray-50"

                  }`}

                  onClick={() => setSelId(selectedId === resume.id ? null : resume.id)}

                >

                  <div className="flex items-center gap-2">

                    <span className={`text-xs font-semibold ${tx}`}>{resume.name}</span>

                    <span className={`text-[10px] ${mu}`}>{resume.created_at}</span>

                  </div>

                  <div className="flex items-center gap-2">

                    {selectedId === resume.id && <span className={`text-xs font-black ${tx}`}>Selected</span>}

                    <button

                      onClick={(event) => { event.stopPropagation(); handleDelete(resume.id) }}

                      disabled={deleting === resume.id}

                      className={`text-xs transition-colors ${dark ? "text-white/35 hover:text-red-300" : "text-gray-400 hover:text-red-500"}`}

                    >

                      {deleting === resume.id ? "..." : "X"}

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {savedResumes.length === 0 && <p className={`text-xs mb-2 ${mu}`}>No saved resumes yet. Upload one below.</p>}

          <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${

            uploading

              ? dark ? "border-white/35 bg-white/10" : "border-gray-300 bg-gray-50"

              : dark ? "border-white/15 hover:border-white/40 bg-white/4" : "border-gray-300 hover:border-gray-400 bg-white"

          }`}>

            <input type="file" accept=".pdf,.txt" className="hidden" onChange={(event) => handleUpload(event.target.files?.[0])} />

            {uploading ? (

              <span className={`text-sm flex items-center gap-2 ${su}`}>

                <div className={`w-4 h-4 border-2 rounded-full animate-spin ${dark ? "border-white/40 border-t-white" : "border-gray-300 border-t-gray-700"}`} />

                Reading...

              </span>

            ) : (

              <span className={`text-sm ${su}`}>Upload PDF or TXT</span>

            )}

          </label>

          {uploadMsg && <p className={`text-xs mt-1.5 ${uploadMsg.toLowerCase().startsWith("saved") ? "text-emerald-400" : dark ? "text-yellow-300" : "text-yellow-700"}`}>{uploadMsg}</p>}

        </div>

        <motion.button

          whileHover={{ scale: 1.03 }}

          whileTap={{ scale: 0.97 }}

          onClick={handleStart}

          className="w-full py-4 rounded-xl font-black text-base text-white shadow-lg transition-all"

          style={{

            background: itype === "hr" ? "linear-gradient(135deg,#ec4899,#8b5cf6)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",

            boxShadow: itype === "hr" ? "0 8px 24px rgba(236,72,153,0.3)" : "0 8px 24px rgba(99,102,241,0.3)",

          }}

        >

          {itype === "hr" ? "Start HR Interview" : "Start Technical Interview"}

        </motion.button>

      </motion.div>

    </div>

  )

}
