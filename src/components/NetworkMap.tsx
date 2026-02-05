'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Simple coordinates for major tech hubs (approximate % on map)
const HUBS = [
  { x: 25, y: 35, name: 'San Francisco' }, // US West
  { x: 32, y: 38, name: 'New York' },      // US East
  { x: 48, y: 28, name: 'London' },        // UK
  { x: 52, y: 30, name: 'Frankfurt' },     // EU
  { x: 75, y: 35, name: 'Singapore' },     // Asia
  { x: 82, y: 45, name: 'Tokyo' },         // Japan
  { x: 80, y: 75, name: 'Sydney' }         // AUS
]

export function NetworkMap() {
  const [activeConnections, setActiveConnections] = useState<{ start: number, end: number, id: number }[]>([])

  useEffect(() => {
    // Simulate random connections
    const interval = setInterval(() => {
      const start = Math.floor(Math.random() * HUBS.length)
      let end = Math.floor(Math.random() * HUBS.length)
      while (end === start) end = Math.floor(Math.random() * HUBS.length)
      
      const id = Date.now()
      setActiveConnections(prev => [...prev.slice(-8), { start, end, id }]) // Keep last 8
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-xl bg-[#050510]/50 border border-white/5 backdrop-blur-sm">
      {/* Map Background (Dot Matrix World) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain filter invert hue-rotate-180 brightness-50" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Nodes */}
      {HUBS.map((hub, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"
          style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400 opacity-60 whitespace-nowrap bg-black/80 px-1 rounded">
            {hub.name}
          </div>
        </div>
      ))}

      {/* Connections (SVG Lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.8)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>
        </defs>
        {activeConnections.map((conn) => {
          const start = HUBS[conn.start]
          const end = HUBS[conn.end]
          const midX = (start.x + end.x) / 2
          const midY = (start.y + end.y) / 2 - 15 // Curve factor

          return (
            <motion.path
              key={conn.id}
              d={`M ${start.x}% ${start.y}% Q ${midX}% ${midY}% ${end.x}% ${end.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 2, ease: "easeInOut" }}
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
