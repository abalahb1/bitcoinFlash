'use client'

interface ScanlinesProps {
  opacity?: number
  color?: string
}

export function Scanlines({ opacity = 0.05, color = '#000' }: ScanlinesProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10"
      style={{
        opacity,
        background: `repeating-linear-gradient(
          0deg,
          ${color},
          ${color} 1px,
          transparent 1px,
          transparent 2px
        )`,
        pointerEvents: 'none'
      }}
    />
  )
}
