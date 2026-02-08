import { NextResponse } from 'next/server'

export interface NewsItem {
    id: number
    title: string
    description: string | null
    url: string
    source: string
    publishedAt: number
    imageUrl: string | null
}

// Cache for news data
let cachedNews: NewsItem[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds for SerpApi (limited request quota)

const API_KEY = "462b75f3792a2469320e3899760bf3152f469ea7b66c386a54120398721f8cd6"

export async function GET() {
    try {
        // Check if we have valid cached data
        const now = Date.now()
        if (cachedNews && (now - cacheTimestamp) < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                data: cachedNews,
                cached: true
            })
        }

        // Fetch fresh news from SerpApi (Google News)
        const response = await fetch(`https://serpapi.com/search.json?engine=google_news&q=crypto&api_key=${API_KEY}`, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 900 } // Next.js cache for 15 minutes
        })

        if (!response.ok) {
            throw new Error(`SerpApi error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.news_results) {
            throw new Error('No news results found from SerpApi')
        }

        // Transform the data to our format
        const news: NewsItem[] = data.news_results.map((item: any, index: number) => {
            // Parse date string to timestamp
            const publishedAt = item.date ? new Date(item.date).getTime() / 1000 : Math.floor(Date.now() / 1000)

            return {
                id: index + 1, // Use index as ID since SerpApi doesn't give unique IDs per item
                title: item.title,
                description: item.snippet || null, // Snippet might be available
                url: item.link,
                source: item.source.name,
                publishedAt: publishedAt,
                imageUrl: item.thumbnail || null
            }
        }).filter((item: NewsItem) => item.imageUrl) // Filter out items without images

        // Update cache
        cachedNews = news
        cacheTimestamp = now

        return NextResponse.json({
            success: true,
            data: news,
            cached: false
        })
    } catch (error) {
        console.error('Error fetching crypto news:', error)

        // Return cached data if available, even if expired
        if (cachedNews) {
            return NextResponse.json({
                success: true,
                data: cachedNews,
                cached: true,
                stale: true
            })
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch crypto news'
            },
            { status: 500 }
        )
    }
}
