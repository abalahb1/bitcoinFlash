import { NextResponse } from 'next/server'
import { getJson } from 'serpapi'

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
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

const API_KEY = process.env.SERPAPI_KEY

// Promisified version of getJson
function fetchNewsFromSerpApi(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!API_KEY) {
            reject(new Error('SERPAPI_KEY not configured'))
            return
        }

        getJson({
            engine: "google_news",
            q: "crypto",
            api_key: API_KEY
        }, (json: any) => {
            if (json.error) {
                reject(new Error(json.error))
            } else {
                resolve(json)
            }
        })
    })
}

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

        // Fetch fresh news from SerpApi
        const data = await fetchNewsFromSerpApi()

        if (!data.news_results) {
            throw new Error('No news results found from SerpApi')
        }

        // Transform the data to our format
        const news: NewsItem[] = data.news_results.map((item: any, index: number) => {
            // Parse date string to timestamp
            const publishedAt = item.date ? new Date(item.date).getTime() / 1000 : Math.floor(Date.now() / 1000)

            return {
                id: index + 1,
                title: item.title,
                description: item.snippet || null,
                url: item.link,
                source: item.source?.name || 'Unknown',
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
