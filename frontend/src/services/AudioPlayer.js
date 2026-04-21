const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

let currentAudio = null

export function stopAudio() {
  if (!currentAudio) return

  currentAudio.pause()
  currentAudio.currentTime = 0
  currentAudio = null
}

export function playAudio(path, onEnd) {
  try {
    if (!path) {
      if (onEnd) onEnd()
      return
    }

    const url = `${BASE}${path}`
    stopAudio()

    currentAudio = new Audio(url)

    currentAudio.onended = () => {
      currentAudio = null
      if (onEnd) onEnd()
    }

    currentAudio.onerror = (error) => {
      console.error("Audio failed:", url, error)
      currentAudio = null
      if (onEnd) onEnd()
    }

    currentAudio.play().catch((error) => {
      console.error("Audio play error:", error)
      currentAudio = null
      if (onEnd) onEnd()
    })
  } catch (error) {
    console.error("Audio crash prevented:", error)
    currentAudio = null
    if (onEnd) onEnd()
  }
}
