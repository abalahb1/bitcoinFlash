'use client'

import { useEffect, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  speed?: number
  glitchChars?: string
}

export function GlitchText({
  text,
  className = '',
  speed = 100,
  glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true)
        let glitchCount = 0
        const maxGlitches = Math.floor(Math.random() * 5) + 3

        const glitchEffect = setInterval(() => {
          if (glitchCount >= maxGlitches) {
            setDisplayText(text)
            setIsGlitching(false)
            clearInterval(glitchEffect)
            return
          }

          const glitchedText = text
            .split('')
            .map(char => {
              if (Math.random() > 0.7) {
                return glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
              return char
            })
            .join('')

          setDisplayText(glitchedText)
          glitchCount++
        }, speed)
      }
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [text, speed, glitchChars])

  return (
    <span
      className={`inline-block ${isGlitching ? 'animate-glitch' : ''} ${className}`}
      style={{
        textShadow: isGlitching
          ? `
            2px 0 rgba(255, 0, 85, 0.7),
            -2px 0 rgba(0, 243, 255, 0.7),
            0 0 10px rgba(0, 243, 255, 0.5)
          `
          : 'none'
      }}
    >
      {displayText}
    </span>
  )
}
