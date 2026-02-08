'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Clock, ChevronLeft, ChevronRight, TrendingUp, ExternalLink } from 'lucide-react'

interface NewsItem {
    id: number
    title: string
    description: string | null
    url: string
    source: string
    publishedAt: number
    imageUrl: string | null
}

function formatTimeAgo(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

export function CryptoNews() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/crypto/news')
                const data = await response.json()
                if (data.success) {
                    setNews(data.data)
                }
            } catch (err) {
                console.error('Error fetching news:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
        const interval = setInterval(fetchNews, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    // Auto-slide every 6 seconds
    useEffect(() => {
        if (news.length === 0) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 6))
        }, 6000)
        return () => clearInterval(timer)
    }, [news.length])

    const goNext = () => setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 6))
    const goPrev = () => setCurrentIndex((prev) => (prev - 1 + Math.min(news.length, 6)) % Math.min(news.length, 6))

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-[400px] rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-gray-800/30 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (news.length === 0) return null

    const slideNews = news.slice(0, 6)
    const currentNews = slideNews[currentIndex]
    const cardNews = news.slice(6, 14)

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Crypto News</h2>
                        <p className="text-xs text-gray-500">Latest market updates</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                </div>
            </div>

            {/* Main Slideshow */}
            <div className="relative rounded-2xl overflow-hidden group bg-[#0c0c0e] border border-white/5">
                <div
                    className="block relative h-[420px] cursor-default"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 group-hover:scale-110"
                        style={{
                            backgroundImage: currentNews.imageUrl
                                ? `url(${currentNews.imageUrl})`
                                : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)'
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-amber-500/90 text-black text-xs font-bold uppercase tracking-wide">
                                {currentNews.source}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                {formatTimeAgo(currentNews.publishedAt)}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 group-hover:text-amber-200 transition-colors duration-300 line-clamp-3">
                            {currentNews.title}
                        </h3>

                        {/* Description */}
                        {currentNews.description && (
                            <p className="text-gray-300 text-base md:text-lg line-clamp-2 max-w-3xl mb-4">
                                {currentNews.description}
                            </p>
                        )}

                        {/* Read More */}
                        <div className="flex items-center gap-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Read full article <ExternalLink className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Slide Number */}
                    <div className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                        <span className="text-white font-mono text-sm">
                            {String(currentIndex + 1).padStart(2, '0')}/{String(slideNews.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <button
                    onClick={(e) => { e.preventDefault(); goPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); goNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all border border-white/10"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${((currentIndex + 1) / slideNews.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* News Cards */}
            {cardNews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cardNews.map((item, idx) => (
                        <div
                            key={item.id}
                            className="group relative bg-[#0f0f12] rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-default"
                        >
                            {/* Image */}
                            <div className="relative h-36 overflow-hidden">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                        <Newspaper className="w-8 h-8 text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] to-transparent" />

                                {/* Source Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white uppercase tracking-wide">
                                        {item.source}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors min-h-[2.5rem]">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(item.publishedAt)}
                                </div>
                            </div>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
