'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Globe, Zap, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCryptoPrices, type CryptoPrice } from '@/hooks/useCryptoPrices'

interface CryptoData {
  symbol: string
  price: string
  change: number
  volume: string
  chart: string
}

const INITIAL_MARKET_DATA: CryptoData[] = [
  { symbol: 'BTC/USDT', price: '89,413.00', change: 1.16, volume: '42.5B', chart: '↗' },
  { symbol: 'ETH/USDT', price: '2,981.78', change: 1.35, volume: '18.2B', chart: '↗' },
  { symbol: 'BNB/USDT', price: '882.87', change: 0.16, volume: '2.1B', chart: '↗' },
  { symbol: 'XRP/USDT', price: '1.94', change: 3.74, volume: '1.5B', chart: '↗' },
  { symbol: 'ADA/USDT', price: '0.37', change: 5.30, volume: '600M', chart: '↗' },
  { symbol: 'DOGE/USDT', price: '0.13', change: 2.51, volume: '450M', chart: '↗' },
  { symbol: 'SOL/USDT', price: '129.46', change: 3.42, volume: '5.8B', chart: '↗' },
  { symbol: 'DOT/USDT', price: '1.95', change: 3.17, volume: '380M', chart: '↗' },
  { symbol: 'AVAX/USDT', price: '12.41', change: 2.65, volume: '520M', chart: '↗' },
]

// Helper to format volume
function formatVolume(volume: number): string {
  if (volume >= 1e12) return `${(volume / 1e12).toFixed(1)}T`
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(0)}M`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(0)}K`
  return volume.toFixed(0)
}

// Transform API data to CryptoData format
function transformApiData(prices: CryptoPrice[]): CryptoData[] {
  return prices.map(coin => ({
    symbol: `${coin.symbol}/USDT`,
    price: coin.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: coin.price < 1 ? 4 : 2,
    }),
    change: coin.percent_change_24h,
    volume: formatVolume(coin.volume_24h),
    chart: coin.percent_change_24h >= 0 ? '↗' : '↘',
  }))
}

export function TopTicker() {
  const { prices, loading, error } = useCryptoPrices(60000) // Refresh every 60 seconds
  const [marketData, setMarketData] = useState<CryptoData[]>(INITIAL_MARKET_DATA)

  // Update market data when prices load
  useEffect(() => {
    if (prices.length > 0) {
      setMarketData(transformApiData(prices))
    }
  }, [prices])

  return (
    <div className="w-full bg-background border-b border-white/5 h-10 flex items-center overflow-hidden relative z-10">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...marketData, ...marketData, ...marketData].map((coin, i) => (
          <div key={i} className="flex items-center gap-4 px-6 border-r border-border text-xs font-mono">
            <span className="text-muted-foreground font-bold">{coin.symbol}</span>
            <span className="text-foreground font-medium">{coin.price}</span>
            <span className={`flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {coin.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(coin.change).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
    </div>
  )
}


export function HeroMarketSlides() {
  const { prices, loading, error } = useCryptoPrices(60000) // Refresh every 60 seconds
  const [marketData, setMarketData] = useState<CryptoData[]>(INITIAL_MARKET_DATA)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update market data when prices load
  useEffect(() => {
    if (prices.length > 0) {
      setMarketData(transformApiData(prices))
    }
  }, [prices])

  // Slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % marketData.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [marketData.length])

  // Calculate total volume from API data
  const totalVolume = prices.length > 0
    ? prices.reduce((sum, coin) => sum + coin.volume_24h, 0)
    : 1.4e12 // Default fallback

  return (
    <div className="w-full py-4 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Market Status Summary */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span>Global Volume: <span className="text-white font-mono">${formatVolume(totalVolume)}</span></span>
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
                <div className={`p-2 rounded-lg ${marketData[currentIndex]?.change >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <BarChart2 className={`w-5 h-5 ${marketData[currentIndex]?.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">{marketData[currentIndex]?.symbol}</h3>
                  <p className="text-xs text-gray-500">Vol: {marketData[currentIndex]?.volume}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-foreground font-mono font-bold text-lg">{marketData[currentIndex]?.price}</div>
                <div className={`text-xs font-medium ${marketData[currentIndex]?.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {marketData[currentIndex]?.change > 0 ? '+' : ''}{marketData[currentIndex]?.change?.toFixed(1)}%
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
