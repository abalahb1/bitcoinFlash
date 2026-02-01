import { NextResponse } from 'next/server'

const SANDBOX_KEY = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c'

export async function GET() {
    const apiKey = process.env.CMC_API_KEY || process.env.key

    if (!apiKey) {
        return NextResponse.json(
            { error: 'CoinMarketCap API key not configured' },
            { status: 500 }
        )
    }

    // Use sandbox API if sandbox key is detected, otherwise use production
    const baseUrl = apiKey === SANDBOX_KEY
        ? 'https://sandbox-api.coinmarketcap.com'
        : 'https://pro-api.coinmarketcap.com'

    try {
        const response = await fetch(
            `${baseUrl}/v1/cryptocurrency/listings/latest?limit=20&convert=USD`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                    'Accept': 'application/json',
                },
                next: { revalidate: 60 }, // Cache for 60 seconds
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            console.error('CoinMarketCap API error:', errorData)
            return NextResponse.json(
                { error: 'Failed to fetch crypto prices', details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()

        // Transform the data to a simpler format
        const prices = data.data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price,
            percent_change_1h: coin.quote.USD.percent_change_1h,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h,
        }))

        return NextResponse.json({
            status: 'success',
            data: prices,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error fetching crypto prices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch crypto prices' },
            { status: 500 }
        )
    }
}
