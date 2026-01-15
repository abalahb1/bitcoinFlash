'use client'

import React, { useEffect, useState } from 'react'
import { Bitcoin } from 'lucide-react'

// ===== FLOATING CRYPTO COINS =====
interface Coin {
  id: number
  symbol: string
  x: number
  y: number
  size: number
  speed: number
  angle: number
  color: string
  rotation: number
  rotationSpeed: number
}

export function FloatingCryptoCoins({ count = 20 }: { count?: number }) {
  const [coins, setCoins] = useState<Coin[]>([])

  useEffect(() => {
    const cryptoSymbols = [
      { symbol: '₿', color: '#f7931a' }, // Bitcoin
      { symbol: '₮', color: '#26a17b' }, // USDT
      { symbol: 'Ξ', color: '#627eea' }, // Ethereum
      { symbol: 'B', color: '#f3ba2f' },  // BNB
      { symbol: '◎', color: '#00d4aa' }, // Solana-like
      { symbol: '●', color: '#5c6bc0' }, // Generic coin
    ]

    const initialCoins: Coin[] = Array.from({ length: count }, (_, i) => {
      const crypto = cryptoSymbols[i % cryptoSymbols.length]
      return {
        id: i,
        symbol: crypto.symbol,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 15, // 15-35px
        speed: Math.random() * 0.3 + 0.1, // 0.1-0.4
        angle: Math.random() * Math.PI * 2,
        color: crypto.color,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2, // -1 to 1
      }
    })

    setCoins(initialCoins)

    const interval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          let newX = coin.x + Math.cos(coin.angle) * coin.speed
          let newY = coin.y + Math.sin(coin.angle) * coin.speed
          let newAngle = coin.angle
          let newRotation = coin.rotation + coin.rotationSpeed

          // Bounce off edges
          if (newX < 0 || newX > 100) {
            newAngle = Math.PI - newAngle
            newX = Math.max(0, Math.min(100, newX))
          }
          if (newY < 0 || newY > 100) {
            newAngle = -newAngle
            newY = Math.max(0, Math.min(100, newY))
          }

          return {
            ...coin,
            x: newX,
            y: newY,
            angle: newAngle,
            rotation: newRotation % 360,
          }
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute transition-all duration-50 ease-linear"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            fontSize: `${coin.size}px`,
            color: coin.color,
            opacity: 0.15,
            transform: `rotate(${coin.rotation}deg)`,
            textShadow: `0 0 10px ${coin.color}40`,
            fontWeight: 'bold',
          }}
        >
          {coin.symbol}
        </div>
      ))}
    </div>
  )
}

// ===== TRADING PAIRS ANIMATION =====
interface TradingPair {
  id: number
  pair: string
  x: number
  y: number
  speedX: number
  speedY: number
  opacity: number
  size: number
}

export function TradingPairsAnimation({ count = 8 }: { count?: number }) {
  const [pairs, setPairs] = useState<TradingPair[]>([])

  useEffect(() => {
    const tradingPairs = [
      'BTC/USDT',
      'ETH/BTC',
      'BNB/USDT',
      'SOL/USDT',
      'XRP/USDT',
      'ADA/BTC',
      'DOT/USDT',
      'MATIC/USDT',
    ]

    const initialPairs: TradingPair[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      pair: tradingPairs[i % tradingPairs.length],
      x: Math.random() * 90 + 5,
      y: -10 - Math.random() * 50,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: Math.random() * 0.4 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
      size: Math.random() * 4 + 10, // 10-14px
    }))

    setPairs(initialPairs)

    const interval = setInterval(() => {
      setPairs((prevPairs) =>
        prevPairs.map((pair) => {
          let newY = pair.y + pair.speedY
          let newX = pair.x + pair.speedX

          // Reset to top when out of view
          if (newY > 110) {
            newY = -10
            newX = Math.random() * 90 + 5
          }

          // Bounce horizontally
          if (newX < 5 || newX > 95) {
            return {
              ...pair,
              x: Math.max(5, Math.min(95, newX)),
              y: newY,
              speedX: -pair.speedX,
            }
          }

          return { ...pair, x: newX, y: newY }
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pairs.map((pair) => (
        <div
          key={pair.id}
          className="absolute transition-all duration-50 ease-linear font-mono font-semibold"
          style={{
            left: `${pair.x}%`,
            top: `${pair.y}%`,
            fontSize: `${pair.size}px`,
            color: '#00f3ff',
            opacity: pair.opacity,
            textShadow: '0 0 8px rgba(0, 243, 255, 0.5)',
            letterSpacing: '0.05em',
          }}
        >
          {pair.pair}
        </div>
      ))}
    </div>
  )
}

// ===== CRYPTO PRICE TICKER =====
interface PriceTicker {
  id: number
  pair: string
  price: string
  change: number
  x: number
}

export function CryptoPriceTicker({ count = 5 }: { count?: number }) {
  const [tickers, setTickers] = useState<PriceTicker[]>([])
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const cryptoData = [
      { pair: 'BTC/USDT', basePrice: 45000 },
      { pair: 'ETH/USDT', basePrice: 2500 },
      { pair: 'BNB/USDT', basePrice: 320 },
      { pair: 'SOL/USDT', basePrice: 105 },
      { pair: 'XRP/USDT', basePrice: 0.52 },
    ]

    const initialTickers: PriceTicker[] = cryptoData.slice(0, count).map((crypto, i) => {
      const change = (Math.random() - 0.5) * 10
      const price = (crypto.basePrice * (1 + change / 100)).toFixed(2)
      return {
        id: i,
        pair: crypto.pair,
        price: `$${price}`,
        change: parseFloat(change.toFixed(2)),
        x: i * 25,
      }
    })

    setTickers(initialTickers)

    // Animate scroll
    const scrollInterval = setInterval(() => {
      setOffset((prev) => (prev - 0.1) % 100)
    }, 50)

    // Update prices occasionally
    const priceInterval = setInterval(() => {
      setTickers((prevTickers) =>
        prevTickers.map((ticker) => {
          const change = (Math.random() - 0.5) * 10
          const basePrice = cryptoData.find((c) => c.pair === ticker.pair)?.basePrice || 100
          const price = (basePrice * (1 + change / 100)).toFixed(2)
          return {
            ...ticker,
            price: `$${price}`,
            change: parseFloat(change.toFixed(2)),
          }
        })
      )
    }, 3000)

    return () => {
      clearInterval(scrollInterval)
      clearInterval(priceInterval)
    }
  }, [count])

  return (
    <div className="fixed top-16 left-0 right-0 pointer-events-none overflow-hidden z-0 h-8 opacity-20">
      <div className="flex gap-8 whitespace-nowrap">
        {tickers.map((ticker) => (
          <div
            key={ticker.id}
            className="inline-flex items-center gap-2 font-mono text-xs"
            style={{
              transform: `translateX(${offset}%)`,
            }}
          >
            <span className="text-cyan-400 font-semibold">{ticker.pair}</span>
            <span className="text-white">{ticker.price}</span>
            <span
              className={`${
                ticker.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              } font-semibold`}
            >
              {ticker.change >= 0 ? '+' : ''}
              {ticker.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== ANIMATED CRYPTO ICONS =====
export function AnimatedCryptoIcons() {
  const [icons, setIcons] = useState<Array<{ id: number; x: number; y: number; scale: number; opacity: number }>>([])

  useEffect(() => {
    const initialIcons = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.1 + 0.05,
    }))

    setIcons(initialIcons)

    const interval = setInterval(() => {
      setIcons((prevIcons) =>
        prevIcons.map((icon) => ({
          ...icon,
          scale: icon.scale + (Math.random() - 0.5) * 0.02,
          opacity: Math.max(0.03, Math.min(0.15, icon.opacity + (Math.random() - 0.5) * 0.01)),
        }))
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute transition-all duration-100"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            transform: `scale(${icon.scale})`,
            opacity: icon.opacity,
          }}
        >
          <Bitcoin className="w-24 h-24 text-cyan-400" style={{ filter: 'blur(2px)' }} />
        </div>
      ))}
    </div>
  )
}
