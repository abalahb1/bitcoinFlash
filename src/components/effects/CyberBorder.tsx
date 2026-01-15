'use client'

import { ReactNode } from 'react'

interface CyberBorderProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function CyberBorder({ children, className = '', glowColor = '#00f3ff' }: CyberBorderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Top border */}
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          animation: 'scan 2s linear infinite'
        }}
      />

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 w-full h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          animation: 'scan 2s linear infinite reverse'
        }}
      />

      {/* Left border */}
      <div
        className="absolute top-0 left-0 w-[2px] h-full"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          animation: 'scan 2s linear infinite'
        }}
      />

      {/* Right border */}
      <div
        className="absolute top-0 right-0 w-[2px] h-full"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
          animation: 'scan 2s linear infinite reverse'
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400" />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes scan {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
