'use client'

import { useState, useEffect } from 'react'
import { Server, Wifi, Users, Zap } from 'lucide-react'

interface NetworkStats {
    activeNodes: number
    connectedUsers: number
    transactionsPerSec: number
    networkHealth: number
}

export function NetworkStatusBar() {
    const [stats, setStats] = useState<NetworkStats>({
        activeNodes: 847,
        connectedUsers: 1243,
        transactionsPerSec: 12,
        networkHealth: 98
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                activeNodes: prev.activeNodes + Math.floor(Math.random() * 10 - 5),
                connectedUsers: Math.max(1000, prev.connectedUsers + Math.floor(Math.random() * 20 - 10)),
                transactionsPerSec: Math.max(5, Math.min(25, prev.transactionsPerSec + Math.floor(Math.random() * 6 - 3))),
                networkHealth: Math.max(95, Math.min(100, prev.networkHealth + (Math.random() > 0.5 ? 1 : -1)))
            }))
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="bg-black/30 border-y border-white/5 backdrop-blur-sm py-3 px-4">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
                {/* Network Health */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${stats.networkHealth > 97 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' :
                                stats.networkHealth > 95 ? 'bg-yellow-500' :
                                    'bg-red-500'
                            }`} />
                        <span className="text-gray-400 font-mono">Network Health:</span>
                    </div>
                    <span className="text-white font-semibold">{stats.networkHealth}%</span>
                </div>

                {/* Active Nodes */}
                <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-gray-400 font-mono">Active Nodes:</span>
                    <span className="text-white font-semibold">{stats.activeNodes.toLocaleString()}</span>
                </div>

                {/* Connected Users */}
                <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-gray-400 font-mono">Users Online:</span>
                    <span className="text-white font-semibold">{stats.connectedUsers.toLocaleString()}</span>
                </div>

                {/* TPS */}
                <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-gray-400 font-mono">TX/sec:</span>
                    <span className="text-white font-semibold">{stats.transactionsPerSec}</span>
                </div>

                {/* Status Badge */}
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                    ● Operational
                </div>
            </div>
        </div>
    )
}
