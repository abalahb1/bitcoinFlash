'use client'

import { useEffect, useState } from 'react'

interface BinaryParticlesProps {
  count?: number
  size?: number
  color?: string
}

export function BinaryParticles({
  count = 30,
  size = 14,
  color = '#00ff41'
}: BinaryParticlesProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    char: string
    speed: number
    opacity: number
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: Math.random() > 0.5 ? '1' : '0',
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2
    }))
    setParticles(newParticles)
  }, [count])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: (p.y + p.speed) % 100,
          char: Math.random() > 0.99 ? (p.char === '1' ? '0' : '1') : p.char
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(particle => (
        <span
          key={particle.id}
          className="absolute font-mono select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${size}px`,
            color,
            opacity: particle.opacity,
            transition: 'top 0.05s linear'
          }}
        >
          {particle.char}
        </span>
      ))}
    </div>
  )
}
