import { useEffect, useRef, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { FaMicrophone } from "react-icons/fa"
import { useAuth } from "@/context/AuthContext"
import useSpeechRecognition from "@/hooks/useSpeechRecognition"
import { useTheme } from "@/hooks/useTheme"
import { getQuestion, evaluateSession, saveSession, saveSessionRecording } from "@/services/ApiService"
import { playAudio, stopAudio } from "@/services/AudioPlayer"
import Feedback from "./Feedback"

const MAX = 5
const MotionDiv = motion.div
const MotionP = motion.p

function getRecorderMimeType() {
  if (typeof window === "undefined" || !window.MediaRecorder) return ""
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ]
  return candidates.find((type) => window.MediaRecorder.isTypeSupported(type)) || ""
}

function normalizeQuestion(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim()
}

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length
}

function isUsableInterviewQuestion(text) {
  const clean = (text || "").trim()
  const lower = clean.toLowerCase()
  if (!clean || wordCount(clean) > 50) return false
  if (
    lower.includes("we need to ask") ||
    lower.includes("ask about") ||
    lower.includes("the candidate") ||
    lower.includes("they previously") ||
    lower.includes("let's ask") ||
    lower.includes("current stage") ||
    lower.includes("exactly one question")
  ) {
    return false
  }
  return true
}

function buildFallbackQuestions(role, interviewType, notes, experience, resumeText, questionNumber) {
  const stage = Math.min(Math.max(questionNumber || 1, 1), 5)
  const hasResume = Boolean(resumeText?.trim())
  const focus = notes?.trim()
  const level = experience === "0" ? "fresher" : `${experience} year${experience === "1" ? "" : "s"} experienced`

  if (interviewType === "hr") {
    if (stage === 1) {
      return [
        `Tell me about yourself and why your background fits a ${role} role.`,
        `Why are you interested in this ${role} opportunity right now?`,
        hasResume
          ? `Pick one experience from your background that best shows why you're ready for this ${role} role.`
          : `What kind of impact are you hoping to make in your next ${role} role?`,
      ]
    }
    if (stage === 2) {
      return [
        `Describe a time you had to handle disagreement with a teammate or stakeholder.`,
        `Tell me about feedback you received and what changed after that.`,
        focus
          ? `Tell me about a real situation where your work on ${focus} depended on strong communication.`
          : `Tell me about a time clear communication changed the outcome of a task or project.`,
      ]
    }
    if (stage === 3) {
      return [
        `Tell me about a time you handled a difficult situation under pressure.`,
        `Describe a mistake you made and what changed in your approach after that.`,
        `Tell me about a situation where you had to prioritise several urgent tasks at once.`,
      ]
    }
    if (stage === 4) {
      return [
        `Imagine two important priorities hit you at the same time. How would you decide what to do first?`,
        `Describe a time you had to influence someone without formal authority.`,
        `Tell me about a time you made a judgment call with incomplete information.`,
      ]
    }

    return [
      `Why should we hire you for this ${role} role?`,
      `What have you learned most about how you work over the last few experiences?`,
      `What strength would you bring first as a ${level} ${role} candidate?`,
    ]
  }

  if (stage === 1) {
    return [
      `Walk me through a recent ${role} project and the hardest problem you solved.`,
      hasResume
        ? `Which project from your background best represents your current level as a ${role}?`
        : `What technical decision from your recent work are you most confident discussing?`,
      focus
        ? `Tell me about a real project where you used ${focus} and what you personally owned.`
        : `What part of your recent engineering work best shows you're ready for a ${role} interview?`,
    ]
  }
  if (stage === 2) {
    return [
      `Tell me about a bug or issue you debugged. How did you find the root cause?`,
      `Pick one feature you built recently and explain how it works under the hood.`,
      `Tell me about a time you used logs, metrics, or test failures to understand what was really going wrong.`,
    ]
  }
  if (stage === 3) {
    return [
      focus
        ? `What trade-offs have you handled while working on ${focus}?`
        : `Tell me about a design or implementation trade-off you had to make recently.`,
      `If your current solution had 10x more traffic, what would you check first?`,
      `Imagine you had to redesign one part of your current stack for better scale or reliability. What would you change?`,
    ]
  }
  if (stage === 4) {
    return [
      `How do you test your work before shipping it in a ${role} role?`,
      `Describe a performance bottleneck you fixed and what improved after the fix.`,
      `What checks or safeguards do you rely on to make sure a change is safe in production?`,
    ]
  }

  return [
    `Looking back at a project you built, what would you redesign today and why?`,
    `What did your last major technical challenge teach you about how you engineer systems or features?`,
    `What part of your work as a ${level} ${role} candidate are you strongest at, and how have you proved it?`,
  ]
}

function pickUniqueQuestion(candidates, askedQuestions) {
  const used = new Set((askedQuestions || []).map(normalizeQuestion))
  return candidates.find((candidate) => !used.has(normalizeQuestion(candidate))) || candidates[0]
}
export default function Interview() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const {
    role = "Software Engineer",
    experience = "0",
    notes = "",
    interview_type = "technical",
    resume_text = "",
  } = state || {}

  const [phase, setPhase] = useState("loading")
  const [question, setQuestion] = useState("")
  const [questionSource, setQuestionSource] = useState("fallback")
  const [liveAnswer, setLiveAnswer] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [count, setCount] = useState(1)
  const [results, setResults] = useState([])
  const [saveStatus, setSaveStatus] = useState({ saved: false, videoSaved: false, error: "" })

  const rawRef = useRef([])
  const askedRef = useRef([])
  const videoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const recorderRef = useRef(null)
  const recordingRef = useRef(null)
  const chunksRef = useRef([])
  const autoStartRef = useRef(null)
  const questionAudioTokenRef = useRef(0)
  const handleAnswerReceivedRef = useRef(null)

  const tx = dark ? "text-white" : "text-gray-900"
  const mu = dark ? "text-white/50" : "text-gray-500"
  const su = dark ? "text-white/75" : "text-gray-700"
  const shell = dark ? "bg-white/5 border border-white/10" : "bg-white/90 border border-gray-200 shadow-sm"

  const cleanupStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const startRecording = useCallback((stream) => {
    if (!window.MediaRecorder || recorderRef.current) return

    try {
      const mimeType = getRecorderMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        if (!chunksRef.current.length) return
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" })
        recordingRef.current = new File([blob], `session-${Date.now()}.webm`, {
          type: blob.type || "video/webm",
        })
      }
      recorder.start(1000)
      recorderRef.current = recorder
    } catch (error) {
      console.error("Recording could not start", error)
    }
  }, [])

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === "inactive") {
      cleanupStream()
      return recordingRef.current
    }

    return new Promise((resolve) => {
      recorder.addEventListener(
        "stop",
        () => {
          recorderRef.current = null
          cleanupStream()
          resolve(recordingRef.current)
        },
        { once: true },
      )
      recorder.stop()
    })
  }, [cleanupStream])

  async function startCamera() {
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      } catch {
        return
      }
    }

    mediaStreamRef.current = stream
    if (videoRef.current) videoRef.current.srcObject = stream
    startRecording(stream)
  }

  const { start, stop, listening } = useSpeechRecognition(
    (transcript, result = {}) => {
      if (!transcript?.trim()) return
      const clean = transcript.trim()
      setLiveAnswer(clean)
      if (result.isFinal) {
        handleAnswerReceivedRef.current?.(clean)
      }
    },
    { silenceDelay: 4500 },
  )

  function scheduleMicStart(delay = 400) {
    if (autoStartRef.current) {
      window.clearTimeout(autoStartRef.current)
      autoStartRef.current = null
    }
    autoStartRef.current = window.setTimeout(() => {
      setPhase("listening")
      start()
    }, delay)
  }

  function speakQuestion(audioPath) {
    questionAudioTokenRef.current += 1
    const token = questionAudioTokenRef.current
    stopAudio()

    if (!audioPath) {
      setIsSpeaking(false)
      scheduleMicStart()
      return
    }

    const finishSpeaking = () => {
      if (token !== questionAudioTokenRef.current) return
      setIsSpeaking(false)
      scheduleMicStart(250)
    }

    try {
      setIsSpeaking(true)
      playAudio(audioPath, finishSpeaking)
    } catch (error) {
      console.error("Question speech failed", error)
      setIsSpeaking(false)
      scheduleMicStart()
    }
  }

  async function loadQuestion(previousTurn = null) {
    setPhase("loading")
    setLiveAnswer("")
    setIsSpeaking(false)
    if (autoStartRef.current) {
      window.clearTimeout(autoStartRef.current)
      autoStartRef.current = null
    }
    questionAudioTokenRef.current += 1
    stopAudio()

    try {
      const response = await getQuestion({
        role,
        experience,
        notes,
        interview_type,
        resume_text,
        asked_questions: askedRef.current,
        previous_question: previousTurn?.question || "",
        previous_answer: previousTurn?.answer || "",
        with_audio: true,
      })

      const fallbackQuestions = buildFallbackQuestions(
        role,
        interview_type,
        notes,
        experience,
        resume_text,
        askedRef.current.length + 1,
      )
      const nextQuestion = pickUniqueQuestion(
        [isUsableInterviewQuestion(response?.question) ? response.question : null, ...fallbackQuestions].filter(Boolean),
        askedRef.current,
      )

      askedRef.current = [...askedRef.current, nextQuestion]
      setQuestion(nextQuestion)
      setQuestionSource(response?.source === "llm" ? "llm" : "fallback")
      setPhase("ready")
      speakQuestion(response?.audio || null)
    } catch (error) {
      console.error("Question generation failed", error)
      const nextQuestion = pickUniqueQuestion(
        buildFallbackQuestions(
          role,
          interview_type,
          notes,
          experience,
          resume_text,
          askedRef.current.length + 1,
        ),
        askedRef.current,
      )
      askedRef.current = [...askedRef.current, nextQuestion]
      setQuestion(nextQuestion)
      setQuestionSource("fallback")
      setPhase("ready")
      speakQuestion(null)
    }
  }

  async function finishSession() {
    const recordingFile = await stopRecording()

    let evaluated = []
    try {
      const evalRes = await evaluateSession({
        role,
        interview_type,
        answers: rawRef.current,
      })
      evaluated = evalRes?.results?.length
        ? evalRes.results
        : rawRef.current.map((item) => ({
            ...item,
            score: 4,
            feedback: "The answer needs more specifics and a clearer result.",
            strengths: [],
            improvements: ["Add one real example and a measurable outcome."],
          }))
    } catch (error) {
      console.error("Session evaluation failed", error)
      evaluated = rawRef.current.map((item) => ({
        ...item,
        score: 0,
        feedback: "Evaluation failed.",
        strengths: [],
        improvements: ["Try the answer again with a clearer structure."],
      }))
    }

    const nextSaveStatus = { saved: false, videoSaved: false, error: "" }
    if (user) {
      try {
        const savedSession = await saveSession({
          role,
          interview_type,
          topics: notes,
          answers: evaluated,
        })
        nextSaveStatus.saved = Boolean(savedSession?.session_id)

        if (savedSession?.session_id && recordingFile) {
          await saveSessionRecording(savedSession.session_id, recordingFile)
          nextSaveStatus.videoSaved = true
        }
      } catch (error) {
        nextSaveStatus.error = error.message || "Session could not be saved."
      }
    }

    setSaveStatus(nextSaveStatus)
    setResults(evaluated)
    setPhase("done")
  }

  async function handleAnswerReceived(transcript) {
    const turn = { question, answer: transcript }
    rawRef.current = [...rawRef.current, turn]

    if (rawRef.current.length >= MAX) {
      setPhase("evaluating")
      await finishSession()
      return
    }

    setCount((current) => current + 1)
    await loadQuestion(turn)
  }

  useEffect(() => {
    handleAnswerReceivedRef.current = handleAnswerReceived
  })

  useEffect(() => {
    if (!role) {
      navigate("/home")
      return
    }

    startCamera()
    const questionLoadTimer = window.setTimeout(() => {
      loadQuestion()
    }, 0)

    return () => {
      window.clearTimeout(questionLoadTimer)
      if (autoStartRef.current) window.clearTimeout(autoStartRef.current)
      questionAudioTokenRef.current += 1
      stopAudio()
      stop()
      stopRecording().catch(() => cleanupStream())
    }
  }, [])

  if (phase === "evaluating") {
    return (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-14 h-14 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className={`text-xl font-black mb-2 ${tx}`}>Evaluating your session...</p>
          <p className={`text-sm ${mu}`}>Saving answers and preparing grounded feedback.</p>
        </div>
      </div>
    )
  }

  if (phase === "done") {
    return (
      <Feedback
        results={results}
        role={role}
        interviewType={interview_type}
        saveStatus={saveStatus}
        onRestart={() => navigate("/home")}
      />
    )
  }

  const progress = ((count - 1) / MAX) * 100
  const isLoading = phase === "loading"
  const isBusy = isLoading || isSpeaking
  const statusLabel = isLoading ? "Generating" : isSpeaking ? "Asking" : listening ? "Listening" : "Ready"
  const statusDotClass = isLoading || isSpeaking
    ? "bg-yellow-400 animate-pulse"
    : listening
      ? "bg-red-400 animate-pulse"
      : "bg-emerald-400"

  return (
    <div className={`relative z-10 min-h-screen p-6 ${tx}`}>
      <div className="max-w-6xl mx-auto">
        <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-black text-lg uppercase tracking-widest">{role}</h2>
            <p className={`text-xs uppercase tracking-widest mt-0.5 ${mu}`}>{interview_type} interview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
              <span className={`text-xs ${mu}`}>{statusLabel}</span>
            </div>
            <span className={`text-sm font-semibold ${su}`}>Q {count} / {MAX}</span>
            <button onClick={() => navigate("/home")} className={`text-sm transition-colors ${mu} ${dark ? "hover:text-white" : "hover:text-gray-900"}`}>
              Exit
            </button>
          </div>
        </MotionDiv>

        <Progress value={progress} className="mb-6" />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Card className={shell}>
              <CardContent className="p-6 min-h-[170px] flex flex-col justify-center">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className={`text-xs uppercase tracking-widest ${mu}`}>Question {count}</p>
                  <span
                    className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${
                      questionSource === "llm"
                        ? "text-emerald-400 border-emerald-400/30 bg-emerald-500/10"
                        : "text-amber-300 border-amber-300/30 bg-amber-500/10"
                    }`}
                  >
                    {questionSource === "llm" ? "LLM" : "Fallback"}
                  </span>
                </div>
                {isLoading ? (
                  <div className={`flex items-center gap-3 ${mu}`}>
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-sm">Generating your next question...</span>
                  </div>
                ) : (
                  <MotionP key={question} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`text-base leading-relaxed ${tx}`}>
                    {question}
                  </MotionP>
                )}
              </CardContent>
            </Card>

            <Card className={shell}>
              <CardContent className="p-5 min-h-[110px] flex flex-col justify-center">
                <p className={`text-xs uppercase tracking-widest mb-2 ${mu}`}>Your Answer</p>
                <p className={`text-sm leading-relaxed ${liveAnswer ? su : mu}`}>
                  {liveAnswer || (listening ? "Listening - speak your full answer. Pause for a few seconds or tap Finish Answer when done." : isSpeaking ? "Listen to the question first..." : isLoading ? "Waiting for the next question..." : "Tap the mic when you are ready.")}
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                if (listening) {
                  stop({ submit: true })
                } else if (!isBusy) {
                  setPhase("listening")
                  start()
                }
              }}
              disabled={isBusy}
              className={`w-full h-14 flex gap-3 items-center justify-center text-base font-bold rounded-xl transition-all ${
                listening
                  ? "bg-red-500 hover:bg-red-400 shadow-red-500/30 shadow-lg"
                  : isBusy
                    ? "bg-white/8 cursor-not-allowed opacity-50"
                    : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/30 shadow-lg"
              }`}
            >
              <FaMicrophone className={listening ? "animate-pulse" : ""} />
              {listening ? "Finish Answer" : isSpeaking ? "Asking question..." : isLoading ? "Generating question..." : "Click to answer"}
            </Button>

            {saveStatus.error && <p className="text-sm text-red-400">{saveStatus.error}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <Card className={`${shell} overflow-hidden`} style={{ minHeight: 320 }}>
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ minHeight: 320 }} />
            </Card>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Progress", value: `${count}/${MAX}` },
                { label: "Role", value: role.split(" ")[0].toUpperCase() },
                { label: "Type", value: interview_type.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className={`${shell} rounded-xl p-3 text-center`}>
                  <p className={`font-bold text-sm ${tx}`}>{value}</p>
                  <p className={`text-xs mt-0.5 ${mu}`}>{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: MAX }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1.5 rounded-full transition-all ${index < count - 1 ? "bg-indigo-500" : dark ? "bg-white/10" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
