'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Globe, Zap, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CryptoData {
  symbol: string
  price: string
  change: number
  volume: string
  chart: string // Dummy path for mini chart svg
}

const MARKET_DATA: CryptoData[] = [
  { symbol: 'BTC/USDT', price: '95,607.00', change: 1.2, volume: '42.5B', chart: '↗' },
  { symbol: 'ETH/USDT', price: '3,317.80', change: -0.8, volume: '18.2B', chart: '↘' },
  { symbol: 'BNB/USDT', price: '932.84', change: 2.5, volume: '2.1B', chart: '↗' },
  { symbol: 'SOL/USDT', price: '142.56', change: 4.1, volume: '5.8B', chart: '↗' },
  { symbol: 'XRP/USDT', price: '2.08', change: -0.5, volume: '1.5B', chart: '↘' },
  { symbol: 'ADA/USDT', price: '0.39', change: 0.2, volume: '600M', chart: '↗' },
]

export function TopTicker() {
  return (
    <div className="w-full bg-[#050510] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-50">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA].map((coin, i) => (
          <div key={i} className="flex items-center gap-4 px-6 border-r border-white/5 text-xs font-mono">
            <span className="text-gray-400 font-bold">{coin.symbol}</span>
            <span className="text-white font-medium">{coin.price}</span>
            <span className={`flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {coin.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(coin.change)}%
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#050510] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#050510] to-transparent pointer-events-none" />
    </div>
  )
}

export function HeroMarketSlides() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MARKET_DATA.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full py-4 bg-gradient-to-r from-[#050510]/80 via-[#0a0a1f]/80 to-[#050510]/80 backdrop-blur-sm border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Market Status Summary */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
           <div className="flex items-center gap-2">
             <Globe className="w-4 h-4 text-cyan-500" />
             <span>Global Volume: <span className="text-white font-mono">$1.4T</span></span>
           </div>
           <div className="flex items-center gap-2">
             <Activity className="w-4 h-4 text-emerald-500" />
             <span>Active Agents: <span className="text-white font-mono">12,405</span></span>
           </div>
           <div className="flex items-center gap-2">
             <Zap className="w-4 h-4 text-yellow-500" />
             <span>Flash Speed: <span className="text-white font-mono">24ms</span></span>
           </div>
        </div>

        {/* Hero Slider */}
        <div className="relative h-16 w-full md:w-96 overflow-hidden">
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentIndex}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -20, opacity: 0 }}
               transition={{ duration: 0.4 }}
               className="absolute inset-0 flex items-center justify-between px-6 bg-white/5 rounded-xl border border-white/10"
             >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${MARKET_DATA[currentIndex].change >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <BarChart2 className={`w-5 h-5 ${MARKET_DATA[currentIndex].change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                   </div>
                   <div>
                      <h3 className="text-white font-bold text-sm tracking-wide">{MARKET_DATA[currentIndex].symbol}</h3>
                      <p className="text-xs text-gray-500">Vol: {MARKET_DATA[currentIndex].volume}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-white font-mono font-bold text-lg">{MARKET_DATA[currentIndex].price}</div>
                   <div className={`text-xs font-medium ${MARKET_DATA[currentIndex].change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {MARKET_DATA[currentIndex].change > 0 ? '+' : ''}{MARKET_DATA[currentIndex].change}%
                   </div>
                </div>
             </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
