'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Wifi, ShieldCheck, Activity, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LOG_MESSAGES = [
  { text: "Scanning blockchain for UTXO set...", type: "info" },
  { text: "Validating block header #834,102...", type: "info" },
  { text: "Network difficulty updated: 81.7T", type: "warning" },
  { text: "Flash protocol driver loaded successfully.", type: "success" },
  { text: "Monitoring target wallet addresses...", type: "info" },
  { text: "Gas estimator ready. Current fees: 14 sat/vB.", type: "info" },
  { text: "Anti-traceability module active.", type: "success" },
  { text: "Initializing secure connection to Bitcoin Core Node [v24.0.1]...", type: "info" },
  { text: "Resolving peer addresses from DNS seed...", type: "info" },
  { text: "Handshake successful with 12 active peers.", type: "success" },
  { text: "Syncing mempool... [14,203 transactions]", type: "warning" },
  { text: "Establishing encrypted tunnel via Tor network...", type: "info" },
  { text: "Tunnel established. Latency: 42ms.", type: "success" },
]

export function LiveTerminal() {
  const [logs, setLogs] = useState<{ text: string, type: string, time: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial logs
    let currentIndex = 0
    
    const addLog = () => {
      const now = new Date()
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      
      const msg = LOG_MESSAGES[currentIndex % LOG_MESSAGES.length]
      // Add slight randomness to messages
      const randomHash = Math.random().toString(36).substring(7).toUpperCase()
      const text = msg.text.replace('...', ` [${randomHash}]...`)

      setLogs(prev => [...prev.slice(-15), { text, type: msg.type, time: timeString }])
      
      currentIndex++
      
      // Random delay for next log
      const delay = Math.random() * 2000 + 1000
      setTimeout(addLog, delay)
    }

    addLog()

    return () => {} // Cleanup not strictly needed for this self-rescheduling timeout pattern inside effect
  }, [])

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400'
      case 'warning': return 'text-amber-400'
      case 'error': return 'text-rose-500'
      default: return 'text-cyan-400'
    }
  }

  return (
    <Card className="bg-[#0c0c0e]/90 border-emerald-500/20 backdrop-blur-md shadow-2xl overflow-hidden font-mono text-xs md:text-sm rounded-lg">
      <CardHeader className="border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-500 font-bold tracking-widest uppercase">Flash_Net Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400 text-[10px] uppercase">Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 text-[10px]">CPU: 12%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-64 overflow-y-auto p-4 space-y-1.5 scroll-smooth custom-scrollbar"
        >
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 fade-in duration-300">
              <span className="text-gray-600 shrink-0 select-none">[{log.time}]</span>
              <span className={`${getColor(log.type)} break-all`}>
                <span className="mr-2 opacity-50">{'>'}</span>
                {log.text}
              </span>
            </div>
          ))}
          <div className="animate-pulse text-emerald-500 font-bold mt-2">_</div>
        </div>
      </CardContent>
    </Card>
  )
}
