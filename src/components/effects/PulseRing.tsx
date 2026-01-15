'use client'

import { useEffect, useRef, useState } from 'react'

interface PulseRingProps {
  className?: string
  color?: string
  maxRings?: number
}

export function PulseRing({ className = '', color = '#00f3ff', maxRings = 3 }: PulseRingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rings, setRings] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setRings(prev => {
        const newRings = [...prev, Date.now()]
        if (newRings.length > maxRings) {
          return newRings.slice(1)
        }
        return newRings
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [maxRings])

  const age = (timestamp: number) => Date.now() - timestamp

  return (
    <div ref={containerRef} className={`relative inline-flex items-center justify-center ${className}`}>
      {rings.map((ring) => {
        const ringAge = age(ring)
        const progress = Math.min(ringAge / 3000, 1)
        const scale = 1 + progress * 2
        const opacity = 1 - progress

        if (progress >= 1) return null

        return (
          <div
            key={ring}
            className="absolute rounded-full border-2 pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              borderColor: color,
              transform: `scale(${scale})`,
              opacity,
              transition: 'none'
            }}
          />
        )
      })}
    </div>
  )
}
