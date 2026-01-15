'use client'

import { useEffect, useRef, useState } from 'react'

interface DigitalOperationProps {
  maxOperations?: number
  color?: string
}

interface Operation {
  id: number
  x: number
  y: number
  text: string
  opacity: number
}

export function DigitalOperations({ maxOperations = 15, color = '#00f3ff' }: DigitalOperationProps) {
  const [operations, setOperations] = useState<Operation[]>([])

  const operationTypes = [
    'ENCRYPTING...',
    'HASH: 0x7f3a...',
    'VERIFYING...',
    'CONNECTED',
    'SYNCING...',
    'PACKET: {data}',
    'BLOCKCHAIN: ✓',
    'SIGNING...',
    'VALIDATED',
    'NODE: ONLINE',
    'ROUTING...',
    'CRYPTO: AES-256',
    'TRANSACTION: OK',
    'MIXING...',
    'FRAGMENTED',
    'ROUTED: 100%'
  ]

  const createOperation = (): Operation => {
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 90 + 5, // 5% to 95%
      y: Math.random() * 90 + 5,
      text: operationTypes[Math.floor(Math.random() * operationTypes.length)],
      opacity: 0
    }
  }

  useEffect(() => {
    // Add operations periodically
    const addInterval = setInterval(() => {
      setOperations(prev => {
        const newOps = [...prev, createOperation()]
        if (newOps.length > maxOperations) {
          return newOps.slice(-maxOperations)
        }
        return newOps
      })
    }, 800)

    // Fade in/out operations
    const fadeInterval = setInterval(() => {
      setOperations(prev =>
        prev.map(op => ({
          ...op,
          opacity: Math.max(0, op.opacity + 0.02)
        })).filter(op => op.opacity > 0)
      )
    }, 50)

    return () => {
      clearInterval(addInterval)
      clearInterval(fadeInterval)
    }
  }, [maxOperations])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden font-mono text-xs">
      {operations.map(op => (
        <div
          key={op.id}
          className="absolute transition-opacity"
          style={{
            left: `${op.x}%`,
            top: `${op.y}%`,
            opacity: Math.min(op.opacity, 1) * 0.6,
            color,
            textShadow: `0 0 10px ${color}`,
            letterSpacing: '0.5px'
          }}
        >
          {op.text}
        </div>
      ))}
    </div>
  )
}
