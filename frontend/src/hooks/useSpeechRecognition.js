import { useCallback, useEffect, useRef, useState } from "react"

export default function useSpeechRecognition(onResult, options = {}) {
  const silenceDelay = options.silenceDelay ?? 4500
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  const finalTranscriptRef = useRef("")
  const visibleTranscriptRef = useRef("")
  const finalEmittedRef = useRef(false)
  const manualStopRef = useRef(false)
  const silenceTimerRef = useRef(null)
  const restartTimerRef = useRef(null)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const finalizeAnswer = useCallback(() => {
    clearSilenceTimer()
    clearRestartTimer()

    if (finalEmittedRef.current) return

    const transcript = (visibleTranscriptRef.current || finalTranscriptRef.current).trim()
    if (!transcript) return

    finalEmittedRef.current = true
    onResultRef.current?.(transcript, { isFinal: true })

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // The browser may already be ending the recognition session.
      }
    }
  }, [clearRestartTimer, clearSilenceTimer])

  const stop = useCallback((config = {}) => {
    const { submit = false } = config
    manualStopRef.current = true
    clearSilenceTimer()
    clearRestartTimer()

    if (submit) {
      finalizeAnswer()
      if (!finalEmittedRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // The browser may already be ending the recognition session.
        }
      }
      return
    }

    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (error) {
      console.error("Speech recognition stop error:", error)
    }
  }, [clearRestartTimer, clearSilenceTimer, finalizeAnswer])

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser.")
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore stale recognition sessions.
      }
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ""
    finalTranscriptRef.current = ""
    visibleTranscriptRef.current = ""
    finalEmittedRef.current = false
    manualStopRef.current = false
    clearSilenceTimer()
    clearRestartTimer()

    recognition.onresult = (event) => {
      let interimTranscript = ""

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result[0]?.transcript || ""

        if (result.isFinal) {
          finalTranscript = `${finalTranscript} ${transcript}`.trim()
          finalTranscriptRef.current = finalTranscript
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim()
        }
      }

      const visibleTranscript = `${finalTranscript} ${interimTranscript}`.trim()
      visibleTranscriptRef.current = visibleTranscript

      if (visibleTranscript) {
        onResultRef.current?.(visibleTranscript, { isFinal: false })
      }

      clearSilenceTimer()
      silenceTimerRef.current = window.setTimeout(finalizeAnswer, silenceDelay)
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null

      if (
        visibleTranscriptRef.current.trim() &&
        !finalEmittedRef.current &&
        !manualStopRef.current
      ) {
        restartTimerRef.current = window.setTimeout(() => {
          if (finalEmittedRef.current || manualStopRef.current) return

          try {
            recognition.start()
            recognitionRef.current = recognition
            setListening(true)
          } catch (error) {
            console.error("Speech recognition restart error:", error)
            setListening(false)
          }
        }, 150)
        return
      }

      setListening(false)
    }

    recognition.onerror = (error) => {
      console.error("Speech recognition error:", error)
      if (recognitionRef.current === recognition) recognitionRef.current = null
      setListening(false)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setListening(true)
    } catch (error) {
      console.error("Speech recognition start error:", error)
      recognitionRef.current = null
      setListening(false)
    }
  }, [clearRestartTimer, clearSilenceTimer, finalizeAnswer, silenceDelay])

  useEffect(() => {
    return () => {
      clearSilenceTimer()
      clearRestartTimer()
    }
  }, [clearRestartTimer, clearSilenceTimer])

  return { start, stop, listening }
}
