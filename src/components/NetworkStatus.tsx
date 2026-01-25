'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, Activity, Clock, Server } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NetworkStatusProps {
  collapsed?: boolean
  compact?: boolean
}

type ConnectionState = 'connected' | 'syncing' | 'disconnected'

export function NetworkStatus({ collapsed = false, compact = false }: NetworkStatusProps) {
  const [state, setState] = useState<ConnectionState>('connected')
  const [latency, setLatency] = useState(42)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncCount, setSyncCount] = useState(0)

  // Simulate network status changes
  useEffect(() => {
    // Simulate latency fluctuations
    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(30 + Math.random() * 50))
    }, 3000)

    // Simulate periodic syncs
    const syncInterval = setInterval(() => {
      setState('syncing')
      setTimeout(() => {
        setState('connected')
        setLastSync(new Date())
        setSyncCount(prev => prev + 1)
      }, 1000 + Math.random() * 500)
    }, 15000)

    return () => {
      clearInterval(latencyInterval)
      clearInterval(syncInterval)
    }
  }, [])

  const statusConfig = {
    connected: {
      label: 'Connected',
      color: 'text-green-500',
      dotClass: 'status-online',
      icon: Wifi,
    },
    syncing: {
      label: 'Syncing',
      color: 'text-yellow-500',
      dotClass: 'status-syncing',
      icon: RefreshCw,
    },
    disconnected: {
      label: 'Offline',
      color: 'text-red-500',
      dotClass: 'status-offline',
      icon: WifiOff,
    },
  }

  const config = statusConfig[state]
  const Icon = config.icon

  // Compact version for top bar
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border cursor-default">
              <div className={`status-dot ${config.dotClass}`} />
              <span className={`text-xs font-medium ${config.color}`}>{latency}ms</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-card border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color} ${state === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="font-medium">{config.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Region: Frankfurt (EU)
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Collapsed sidebar version
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center p-2 rounded-lg bg-secondary/50">
              <div className={`status-dot ${config.dotClass}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-card border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${config.color}`}>{config.label}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{latency}ms</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full version for expanded sidebar / mobile menu
  return (
    <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2">
      {/* Status Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`status-dot ${config.dotClass}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
        <motion.div
          animate={{ rotate: state === 'syncing' ? 360 : 0 }}
          transition={{ duration: 1, repeat: state === 'syncing' ? Infinity : 0, ease: 'linear' }}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
        </motion.div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>{latency}ms</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Server className="w-3 h-3" />
          <span>EU-West</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
          <Clock className="w-3 h-3" />
          <span>Synced {lastSync.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Activity indicator */}
      <div className="flex items-center gap-1 pt-1 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          {syncCount} syncs this session
        </span>
      </div>
    </div>
  )
}
