'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CryptoPrice {
    id: number
    name: string
    symbol: string
    price: number
    percent_change_1h: number
    percent_change_24h: number
    percent_change_7d: number
    market_cap: number
    volume_24h: number
}

interface UseCryptoPricesResult {
    prices: CryptoPrice[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useCryptoPrices(autoRefreshInterval?: number): UseCryptoPricesResult {
    const [prices, setPrices] = useState<CryptoPrice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPrices = useCallback(async () => {
        try {
            setError(null)
            const response = await fetch('/api/crypto/prices')

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to fetch prices')
            }

            const data = await response.json()
            setPrices(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPrices()

        // Auto-refresh if interval is provided
        if (autoRefreshInterval && autoRefreshInterval > 0) {
            const interval = setInterval(fetchPrices, autoRefreshInterval)
            return () => clearInterval(interval)
        }
    }, [fetchPrices, autoRefreshInterval])

    return { prices, loading, error, refetch: fetchPrices }
}

// Helper function to get a specific coin's price
export function getCoinPrice(prices: CryptoPrice[], symbol: string): CryptoPrice | undefined {
    return prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase())
}
