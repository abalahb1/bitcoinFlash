'use client'

import { useEffect, useState } from 'react'
import { Shield, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'

interface TraceabilityMeterProps {
    onComplete?: () => void
}

export function TraceabilityMeter({ onComplete }: TraceabilityMeterProps) {
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<'analyzing' | 'complete'>('analyzing')

    useEffect(() => {
        // Simulate analysis progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setStatus('complete')
                    onComplete?.()
                    clearInterval(interval)
                    return 100
                }
                return prev + 2
            })
        }, 50)

        return () => clearInterval(interval)
    }, [onComplete])

    const getColor = () => {
        if (progress < 30) return 'from-red-500 to-orange-500'
        if (progress < 70) return 'from-yellow-500 to-emerald-500'
        return 'from-emerald-500 to-cyan-500'
    }

    const getStatusText = () => {
        if (status === 'analyzing') {
            if (progress < 30) return 'Analyzing...'
            if (progress < 70) return 'Checking digital fingerprint...'
            return 'Verifying privacy...'
        }
        return 'Complete'
    }

    return (
        <div className="space-y-4">
            {/* Meter Visual */}
            <div className="relative">
                {/* Semi-circle gauge */}
                <div className="relative w-48 h-24 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                        {/* Background arc */}
                        <path
                            d="M 20 90 A 80 80 0 0 1 180 90"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        {/* Progress arc */}
                        <path
                            d="M 20 90 A 80 80 0 0 1 180 90"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${(progress / 100) * 251.2} 251.2`}
                            className="transition-all duration-300"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className="stop-emerald-500" />
                                <stop offset="100%" className="stop-cyan-500" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center value */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-white">
                            {Math.round(100 - progress)}%
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-1">Traceability</div>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    {status === 'analyzing' ? (
                        <>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-400">{getStatusText()}</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-400">Verified - Complete Privacy</span>
                        </>
                    )}
                </div>
            </div>

            {/* Security Indicators */}
            {status === 'complete' && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-mono">Encryption</span>
                        </div>
                        <div className="text-xl font-bold text-white">256-bit</div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs text-cyan-400 font-mono">Security</span>
                        </div>
                        <div className="text-xl font-bold text-white">High</div>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 text-center">
                    ✓ Your transaction is fully protected and untraceable
                </p>
            </div>
        </div>
    )
}
