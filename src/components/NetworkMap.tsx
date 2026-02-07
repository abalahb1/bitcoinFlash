'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Simple coordinates for major tech hubs (approximate % on map)
const HUBS = [
  { x: 25, y: 35, name: 'San Francisco' },
  { x: 32, y: 38, name: 'New York' },
  { x: 48, y: 28, name: 'London' },
  { x: 52, y: 30, name: 'Frankfurt' },
  { x: 75, y: 35, name: 'Singapore' },
  { x: 82, y: 45, name: 'Tokyo' },
  { x: 80, y: 75, name: 'Sydney' },
]

export function NetworkMap() {
  const [activeConnections, setActiveConnections] = useState<{ start: number, end: number, id: number }[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const start = Math.floor(Math.random() * HUBS.length)
      let end = Math.floor(Math.random() * HUBS.length)
      while (end === start) end = Math.floor(Math.random() * HUBS.length)
      const id = Date.now()
      setActiveConnections(prev => [...prev.slice(-8), { start, end, id }])
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[320px] md:h-[440px] overflow-hidden rounded-2xl bg-[#050510]/80 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_35%)] opacity-60" />
      {/* Map silhouette */}
      <div className="absolute inset-0 opacity-35 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain filter invert hue-rotate-180 brightness-90" />

      {/* Nodes */}
      {HUBS.map((hub, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse"
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
        >
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-emerald-300 opacity-80 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {hub.name}
          </div>
        </div>
      ))}

      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.9)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>
        </defs>
        {activeConnections.map((conn) => {
          const start = HUBS[conn.start]
          const end = HUBS[conn.end]
          const midX = (start.x + end.x) / 2
          const midY = (start.y + end.y) / 2 - 18

          return (
            <motion.path
              key={conn.id}
              d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1.8"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, ease: "easeInOut" }}
            />
          )
        })}
      </svg>

      {/* Status Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full border border-emerald-500/20 backdrop-blur-md">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="text-xs font-mono text-emerald-400">LIVE NETWORK: 128 NODES ACTIVE</span>
      </div>
    </div>
  )
}
