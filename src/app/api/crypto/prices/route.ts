import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Using CoinGecko API (No key required for basic usage)
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d',
            {
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 }, // Cache for 60 seconds
            }
        )

        if (!response.ok) {
            throw new Error(`CoinGecko API Error: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform data to match existing frontend expectations
        const prices = data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            percent_change_1h: coin.price_change_percentage_1h_in_currency,
            percent_change_24h: coin.price_change_percentage_24h_in_currency,
            percent_change_7d: coin.price_change_percentage_7d_in_currency,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            image: coin.image
        }))

        return NextResponse.json({
            status: 'success',
            data: prices,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error fetching crypto prices:', error)
        // Fallback data in case API fails (to prevent UI breaking)
        return NextResponse.json({
            status: 'success',
            data: [
                { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 96500, percent_change_24h: 2.5 },
                { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 2800, percent_change_24h: 1.2 },
                { id: 'tether', name: 'Tether', symbol: 'USDT', price: 1.00, percent_change_24h: 0.01 },
                { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 620, percent_change_24h: -0.5 },
                { id: 'solana', name: 'Solana', symbol: 'SOL', price: 185, percent_change_24h: 5.4 },
            ],
            timestamp: new Date().toISOString(),
            isFallback: true
        })
    }
}
