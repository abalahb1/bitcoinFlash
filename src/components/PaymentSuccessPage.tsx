"use client"

import { CheckCircle, Copy, ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Package as PackageType, User as UserType } from '@prisma/client'
import { useState, useRef } from 'react'
import { getTierConfig } from '@/lib/tiers'
import html2canvas from 'html2canvas-pro'

// Extended user type with account_tier
type ExtendedUserType = UserType & { account_tier?: string }

interface PaymentSuccessPageProps {
    isOpen: boolean
    package: PackageType | null
    user: ExtendedUserType | null
    transactionId?: string
    onContinue: () => void
}

export function PaymentSuccessPage({ isOpen, package: pkg, user, transactionId, onContinue }: PaymentSuccessPageProps) {
    const [copied, setCopied] = useState(false)
    const [sharing, setSharing] = useState(false)
    const [shareStatus, setShareStatus] = useState<string>('')
    const contentRef = useRef<HTMLDivElement>(null)

    if (!isOpen || !pkg || !user) return null

    const txId = transactionId || `${Date.now()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })

    // Get tier configuration and calculate commission
    const tierConfig = getTierConfig(user.account_tier)
    const commissionRate = tierConfig.commissionRate * 100
    const commissionAmount = pkg.price_usd * tierConfig.commissionRate

    const handleCopy = () => {
        navigator.clipboard.writeText(txId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        const element = contentRef.current
        if (!element) {
            setShareStatus('Error: Content not found')
            return
        }

        setSharing(true)
        setShareStatus('Capturing screenshot...')

        try {
            await new Promise(resolve => setTimeout(resolve, 100))

            const canvas = await html2canvas(element, {
                backgroundColor: '#050510',
                scale: 2,
                useCORS: true,
                logging: false,
            })

            setShareStatus('Creating image...')

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
            })

            if (!blob) {
                throw new Error('Failed to create image')
            }

            const file = new File([blob], `flash-btc-receipt-${Date.now()}.png`, { type: 'image/png' })

            if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        setShareStatus('Opening share menu...')
                        await navigator.share({
                            title: 'Flash BTC Payment Receipt',
                            text: `Payment successful! ${pkg.btc_amount} BTC`,
                            files: [file]
                        })
                        setShareStatus('Shared successfully!')
                    } else {
                        downloadImage(blob)
                    }
                } catch (shareError: any) {
                    if (shareError.name === 'AbortError') {
                        setShareStatus('Share cancelled')
                    } else {
                        downloadImage(blob)
                    }
                }
            } else {
                downloadImage(blob)
            }
        } catch (error: any) {
            console.error('Share error:', error)
            setShareStatus(`Error: ${error.message || 'Failed to capture'}`)
        } finally {
            setSharing(false)
            setTimeout(() => setShareStatus(''), 3000)
        }
    }

    const downloadImage = (blob: Blob) => {
        setShareStatus('Downloading image...')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flash-btc-receipt-${Date.now()}.png`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }, 100)
        setShareStatus('Image downloaded!')
    }

    const tierName = user.account_tier === 'gold' ? 'Gold' : user.account_tier === 'silver' ? 'Silver' : 'Bronze'

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-3 text-emerald-300 font-mono text-xs uppercase tracking-[0.2em]">
                    <CheckCircle className="w-5 h-5" /> Flash BTC Receipt
                </div>

                <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    {/* Main receipt */}
                    <div ref={contentRef} className="bg-gradient-to-br from-[#050510] via-[#08141a] to-[#050510] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs font-mono text-emerald-300 tracking-[0.25em]">PAYMENT SUCCESS</p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Flash Bitcoin License Activated</h1>
                                <p className="text-gray-400 text-sm">{timestamp}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-400 text-xs uppercase font-mono">Amount</p>
                                <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                                    {pkg.btc_amount} <span className="text-sm text-gray-500">BTC</span>
                                </div>
                                <p className="text-gray-400 text-sm">${pkg.price_usd.toLocaleString()} USDT</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-400 text-xs uppercase font-mono">Commission Earned</p>
                                <div className="text-2xl font-bold text-emerald-400">+${commissionAmount.toLocaleString()}</div>
                                <p className="text-gray-400 text-sm">Tier: {tierName} · {commissionRate}%</p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 bg-black/40 border border-white/10 rounded-xl p-4">
                            <div className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">Order Details</div>
                            {[{ label: 'Package', value: pkg.name }, { label: 'BTC Amount', value: `${pkg.btc_amount} BTC` }, { label: 'Duration', value: `${pkg.duration} Days` }, { label: 'Daily Transfers', value: `${pkg.transfers}` }, { label: 'Status', value: 'Completed' }, { label: 'Transaction ID', value: txId }, { label: 'Date', value: timestamp }].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm text-gray-200">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className={item.label === 'Status' ? 'text-emerald-400 font-semibold' : ''}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                            <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em] mb-3">Actions</p>
                            <div className="space-y-2">
                                <Button onClick={handleCopy} variant="secondary" className="w-full bg-white/5 border border-white/10 text-gray-100 hover:border-emerald-400/60">
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copied ? 'Copied' : 'Copy Transaction ID'}
                                </Button>
                                <Button onClick={handleShare} disabled={sharing} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold border-none shadow-[0_0_30px_rgba(16,185,129,0.45)]">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    {sharing ? (shareStatus || 'Sharing...') : 'Share / Download'}
                                </Button>
                                <Button onClick={onContinue} variant="outline" className="w-full border-white/20 text-white hover:border-emerald-400/60">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>
                            {shareStatus && <p className="text-xs text-gray-400 mt-2">{shareStatus}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
