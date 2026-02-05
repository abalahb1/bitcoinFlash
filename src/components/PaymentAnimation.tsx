"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Zap,
  Shield,
  Activity,
  Cpu,
  Server,
  Radio,
  Hash,
  Lock,
  Terminal,
} from 'lucide-react'

interface PaymentAnimationProps {
  isOpen: boolean
  onComplete: () => void
  packageName: string
  amount: number
}

type Step = {
  label: string
  detail: string
  icon: typeof Zap
  duration: number
}

const steps: Step[] = [
  { label: 'Booting Flash Core', detail: 'Shader pipelines online, entropy seeded', icon: Zap, duration: 2200 },
  { label: 'Key Exchange & TLS 1.3', detail: 'Forward secrecy negotiated with relay cluster', icon: Lock, duration: 2200 },
  { label: 'Network Sync', detail: 'Peers: Binance · OKX · Coinbase · Kraken', icon: Radio, duration: 2200 },
  { label: 'Chain Simulation', detail: 'Merkle root seeded, flash UTXOs staged', icon: Hash, duration: 2200 },
  { label: 'Node Consensus', detail: 'Quorum > 92%, validators green', icon: Server, duration: 2200 },
  { label: 'Visual Injection', detail: 'CEX surfaces synchronized for display', icon: Activity, duration: 2200 },
  { label: 'Holo Render', detail: 'GPU pass for holographic overlays', icon: Cpu, duration: 2200 },
  { label: 'Finalize & Seal', detail: 'Immutable snapshot sealed, audit trail recorded', icon: Shield, duration: 2200 },
]

const consoleSnippets = [
  '>> initializing flash kernel... ok',
  '>> entropy source: /dev/urandom [synced]',
  '>> tls handshake complete [AES-256-GCM]',
  '>> peers online: 12 (binance, okx, coinbase, kraken)',
  '>> merkle root generated: 7f2c...b91d',
  '>> validator quorum: 92.4% (green)',
  '>> gpu render pass: glow layer stable',
  '>> packet loss: 0.00%, jitter: 3ms',
  '>> audit hash: 4d3a...9cc0',
  '>> visual sync: 3 exchanges locked',
  '>> forging holographic asset... ok',
  '>> sealing snapshot... ok',
]

export function PaymentAnimation({ isOpen, onComplete, packageName, amount }: PaymentAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [showConsole] = useState(true)

  // reset when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      setLogs([])
      return
    }

    setLogs([`>> flash session start: ${packageName} (${amount} BTC)`])
  }, [isOpen, packageName, amount])

  // timeline progression (~20s total)
  useEffect(() => {
    if (!isOpen) return

    let progressInterval: NodeJS.Timeout | null = null
    let stepTimeout: NodeJS.Timeout | null = null

    const step = steps[currentStep]
    const startTime = Date.now()

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / step.duration) * 100, 100)
      setProgress(pct)
    }, 80)

    stepTimeout = setTimeout(() => {
      // add a console line on each step completion
      setLogs(prev => {
        const nextLine = consoleSnippets[Math.floor(Math.random() * consoleSnippets.length)]
        return [...prev.slice(-9), nextLine]
      })

      if (currentStep < steps.length - 1) {
        setCurrentStep((s) => s + 1)
        setProgress(0)
      } else {
        setProgress(100)
        setTimeout(() => {
          onComplete()
        }, 1200)
      }
    }, step.duration)

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (stepTimeout) clearTimeout(stepTimeout)
    }
  }, [isOpen, currentStep, onComplete])

  if (!isOpen) return null

  const StepIcon = steps[currentStep]?.icon || Loader2

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Background grid + glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:90px_90px] opacity-40" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 py-6 sm:py-10 min-h-screen flex flex-col gap-3 mx-auto items-center lg:items-start">
          <div className="w-full flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:items-start lg:justify-center">
            {/* Left: Console & Steps */}
            <div className="flex-1 bg-[#050505]/80 border border-white/10 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-[0_0_35px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-300">FLASH PROTOCOL</p>
                  <h3 className="text-2xl font-bold text-white">Visual Flash Injection</h3>
                  <p className="text-gray-400 text-sm">Package: {packageName} · {amount} BTC</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Shield className="w-3 h-3" />
                  SECURE
                </div>
              </div>

              <div className="space-y-4">
                {/* Current step */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                    <StepIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">{steps[currentStep]?.label}</div>
                    <div className="text-sm text-gray-400">{steps[currentStep]?.detail}</div>
                    <div className="mt-2 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">Step {currentStep + 1}/{steps.length}</div>
                  </div>
                </div>

                {/* Steps overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {steps.map((step, idx) => {
                    const isActive = idx === currentStep
                    const isDone = idx < currentStep
                    return (
                      <div
                        key={step.label}
                        className={`rounded-lg border px-3 py-3 flex items-center gap-3 transition-colors ${
                          isActive ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/10 bg-white/5'
                        } ${isDone ? 'opacity-80' : ''}`}
                      >
                        <step.icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-sm text-white font-medium">{step.label}</div>
                          <div className="text-xs text-gray-500">{step.detail}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Console feed */}
            {showConsole && (
              <div className="w-full lg:w-72 xl:w-80 bg-black/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 shadow-[0_0_30px_rgba(34,211,238,0.12)] min-h-[220px]">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 uppercase tracking-[0.2em]">
                  <Terminal className="w-4 h-4" />
                  CONSOLE FEED
                </div>
                <div className="relative flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#020202]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40" />
                  <div
                    className="p-3 space-y-1 font-mono text-xs text-emerald-200 overflow-y-auto max-h-[50vh] md:max-h-[360px] min-h-[140px]"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {logs.map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Visual flash injection · Hacker/console themed</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
