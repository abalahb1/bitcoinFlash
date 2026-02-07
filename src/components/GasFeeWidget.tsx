'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './ui/card'

interface GasFeeData {
    current: number
    status: 'low' | 'medium' | 'high'
    trend: 'up' | 'down' | 'stable'
    history: number[]
}

export function GasFeeWidget() {
    const [gasData, setGasData] = useState<GasFeeData>({
        current: 24,
        status: 'low',
        trend: 'stable',
        history: [22, 23, 24, 23, 24]
    })

    useEffect(() => {
        // Simulate gas fee fluctuations
        const interval = setInterval(() => {
            setGasData(prev => {
                const change = Math.random() > 0.5 ? 1 : -1
                const newValue = Math.max(12, Math.min(80, prev.current + change * Math.floor(Math.random() * 3)))

                let status: 'low' | 'medium' | 'high' = 'low'
                if (newValue > 50) status = 'high'
                else if (newValue > 25) status = 'medium'

                const trend = newValue > prev.current ? 'up' : newValue < prev.current ? 'down' : 'stable'

                return {
                    current: newValue,
                    status,
                    trend,
                    history: [...prev.history.slice(-9), newValue]
                }
            })
        }, 4000) // Update every 4 seconds

        return () => clearInterval(interval)
    }, [])

    const statusColors = {
        low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        high: 'text-red-400 bg-red-500/10 border-red-500/30'
    }

    const statusLabels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
    }

    const TrendIcon = gasData.trend === 'up' ? TrendingUp : gasData.trend === 'down' ? TrendingDown : Minus

    return (
        <Card className="p-4 bg-black/40 border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Network Fee</span>
                </div>
                <div className={`px-2 py-1 rounded-full border text-xs font-mono ${statusColors[gasData.status]}`}>
                    {statusLabels[gasData.status]}
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{gasData.current}</span>
                        <span className="text-xs text-gray-500 font-mono">sat/vB</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendIcon className={`w-3 h-3 ${gasData.trend === 'up' ? 'text-red-400' :
                                gasData.trend === 'down' ? 'text-emerald-400' :
                                    'text-gray-400'
                            }`} />
                        <span className="text-xs text-gray-500">
                            {gasData.trend === 'up' && 'Rising'}
                            {gasData.trend === 'down' && 'Falling'}
                            {gasData.trend === 'stable' && 'Stable'}
                        </span>
                    </div>
                </div>

                {/* Mini sparkline */}
                <div className="flex items-end gap-[2px] h-8">
                    {gasData.history.slice(-10).map((value, i) => {
                        const height = (value / 80) * 100
                        return (
                            <div
                                key={i}
                                className={`w-1 rounded-t transition-all ${gasData.status === 'low' ? 'bg-emerald-500/40' :
                                        gasData.status === 'medium' ? 'bg-yellow-500/40' :
                                            'bg-red-500/40'
                                    }`}
                                style={{ height: `${height}%` }}
                            />
                        )
                    })}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                💡 Fees are {gasData.status === 'low' ? 'low - ideal time for transactions' : gasData.status === 'medium' ? 'medium - you can wait' : 'high - wait to save on fees'}
            </div>
        </Card>
    )
}
