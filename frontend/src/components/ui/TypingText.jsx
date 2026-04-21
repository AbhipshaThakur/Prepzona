import { useEffect, useRef, useState } from "react"

export default function TypingText({ phrases = [], speed = 22, deleteSpeed = 10, pause = 280, className = "" }) {
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!phrases.length) return
    const current = phrases[indexRef.current % phrases.length]
    const isDone = text === current

    const delay = isDone ? pause : deleting ? deleteSpeed : speed

    const t = setTimeout(() => {
      if (!deleting && !isDone) {
        setText(current.slice(0, text.length + 1))
      } else if (isDone) {
        setDeleting(true)
      } else if (deleting && text.length > 0) {
        setText(current.slice(0, text.length - 1))
      } else {
        setDeleting(false)
        indexRef.current = (indexRef.current + 1) % phrases.length
      }
    }, delay)

    return () => clearTimeout(t)
  }, [text, deleting, phrases, speed, deleteSpeed, pause])

  return (
    <span className={`inline-flex items-center gap-2 text-lg font-semibold ${className}`}>
      <span className="relative">
        {text}
        <span className="absolute -right-1 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-current animate-pulse" />
      </span>
    </span>
  )
}