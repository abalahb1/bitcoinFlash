'use client'

import { useEffect, useState } from 'react'

interface TypingTextProps {
  text: string
  className?: string
  speed?: number
  cursor?: boolean
  onComplete?: () => void
}

export function TypingText({
  text,
  className = '',
  speed = 50,
  cursor = true,
  onComplete
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    let timeoutId: NodeJS.Timeout

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
        timeoutId = setTimeout(typeNextChar, speed)
      } else {
        setIsComplete(true)
        onComplete?.()
      }
    }

    typeNextChar()

    return () => clearTimeout(timeoutId)
  }, [text, speed, onComplete])

  // Blink cursor effect
  useEffect(() => {
    if (!cursor) return

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [cursor])

  return (
    <span className={`font-mono ${className}`}>
      {displayText}
      {cursor && (
        <span
          className={`inline-block w-2 h-5 bg-cyan-400 ml-1 align-middle ${
            showCursor ? 'opacity-100' : 'opacity-0'
          } transition-opacity`}
        >
          |
        </span>
      )}
    </span>
  )
}
