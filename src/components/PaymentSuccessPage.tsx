'use client'

import { CheckCircle, Copy, ArrowLeft, Award, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Package as PackageType, User as UserType } from '@prisma/client'
import { useState, useRef } from 'react'
import { getTierConfig } from '@/lib/tiers'
import { TierBadge } from '@/components/TierBadge'

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
            // Dynamically import dom-to-image-more
            const domtoimage = await import('dom-to-image-more')

            // Wait a bit for any pending renders
            await new Promise(resolve => setTimeout(resolve, 200))

            // Capture as PNG blob
            const blob = await domtoimage.toBlob(element, {
                bgcolor: '#000000',
                quality: 1,
                scale: 2,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            })

            if (!blob) {
                throw new Error('Failed to create image')
            }

            setShareStatus('Creating image...')

            // Create file for sharing
            const file = new File([blob], `flash-btc-receipt-${Date.now()}.png`, { type: 'image/png' })

            // Check if Web Share API is available with file sharing
            if (typeof navigator !== 'undefined' && navigator.share) {
                try {
                    // Check if can share files
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        setShareStatus('Opening share menu...')
                        await navigator.share({
                            title: 'Flash BTC Payment Receipt',
                            text: `Payment successful! ${pkg.btc_amount} BTC`,
                            files: [file]
                        })
                        setShareStatus('Shared successfully!')
                    } else {
                        // Download fallback
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
                // No Web Share API - download instead
                downloadImage(blob)
            }
        } catch (error: any) {
            console.error('Share error:', error)
            setShareStatus(`Error: ${error.message || 'Failed to capture'}`)
        } finally {
            setSharing(false)
            // Clear status after 3 seconds
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

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
                {/* Capturable Content */}
                <div
                    ref={contentRef}
                    className="w-full max-w-md"
                    style={{
                        padding: '16px',
                        backgroundColor: '#000000'
                    }}
                >

                    {/* Success Icon */}
                    <div className="text-center mb-8">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
                            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                        >
                            <CheckCircle className="w-12 h-12" style={{ color: '#10b981' }} />
                        </div>
                        <h1 className="text-2xl font-semibold text-white mb-2">Payment Successful</h1>
                        <p className="text-sm" style={{ color: '#71717a' }}>Your Flash BTC license has been activated</p>
                    </div>

                    {/* Amount Display */}
                    <div
                        className="text-center py-6 mb-6 rounded-xl"
                        style={{ backgroundColor: '#09090b', border: '1px solid #27272a' }}
                    >
                        <div className="text-4xl font-bold text-white mb-2">
                            {pkg.btc_amount} <span style={{ color: '#f7931a' }}>BTC</span>
                        </div>
                        <div className="text-sm" style={{ color: '#71717a' }}>
                            ${pkg.price_usd.toLocaleString()} USDT
                        </div>
                    </div>

                    {/* Commission Earned Card */}
                    <div
                        className="rounded-xl p-4 mb-6"
                        style={{
                            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                                >
                                    <Award className="w-5 h-5" style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: '#71717a' }}>Commission Earned</p>
                                    <p className="text-lg font-bold" style={{ color: '#34d399' }}>+${commissionAmount.toLocaleString()} USDT</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    <TierBadge tier={user.account_tier || 'bronze'} size="sm" />
                                </div>
                                <p className="text-xs" style={{ color: '#71717a' }}>{commissionRate}% Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Card */}
                    <div
                        className="rounded-xl overflow-hidden mb-6"
                        style={{ backgroundColor: '#09090b', border: '1px solid #27272a' }}
                    >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                            <h3 className="text-sm font-medium text-white">Order Details</h3>
                        </div>

                        <div>
                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Package</span>
                                <span className="text-sm text-white font-medium">{pkg.name}</span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>BTC Amount</span>
                                <span className="text-sm text-white font-medium">{pkg.btc_amount} BTC</span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Duration</span>
                                <span className="text-sm text-white font-medium">{pkg.duration} Days</span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Daily Transfers</span>
                                <span className="text-sm text-white font-medium">{pkg.transfers}</span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Status</span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: '#10b981' }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
                                    Completed
                                </span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Date & Time</span>
                                <span className="text-sm text-white font-medium">{timestamp}</span>
                            </div>

                            <div className="flex justify-between items-start px-4 py-3">
                                <span className="text-sm" style={{ color: '#71717a' }}>Transaction ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-white font-mono max-w-[160px] truncate">{txId}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-md transition-colors"
                                        style={{ color: '#f7931a' }}
                                        title="Copy"
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary Card */}
                    <div
                        className="rounded-xl overflow-hidden mb-6"
                        style={{ backgroundColor: '#09090b', border: '1px solid #27272a' }}
                    >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                            <h3 className="text-sm font-medium text-white">Payment Summary</h3>
                        </div>

                        <div>
                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Package Price</span>
                                <span className="text-sm text-white">${pkg.price_usd.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #27272a' }}>
                                <span className="text-sm" style={{ color: '#71717a' }}>Your Commission ({commissionRate}%)</span>
                                <span className="text-sm font-medium" style={{ color: '#34d399' }}>+${commissionAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3" style={{ backgroundColor: 'rgba(24, 24, 27, 0.3)' }}>
                                <span className="text-sm font-medium text-white">Total Paid</span>
                                <span className="text-sm font-bold" style={{ color: '#f7931a' }}>${pkg.price_usd.toLocaleString()} USDT</span>
                            </div>
                        </div>
                    </div>

                    {/* Branding Footer (visible in screenshot) */}
                    <div className="text-center py-3" style={{ borderTop: '1px solid #27272a' }}>
                        <p className="text-xs" style={{ color: '#71717a' }}>Flash BTC Protocol • Secure Transaction</p>
                    </div>

                </div>

                {/* Action Buttons (outside screenshot area) */}
                <div className="w-full max-w-md space-y-3 px-4 mt-4">
                    {/* Status Message */}
                    {shareStatus && (
                        <div className="text-center text-sm py-2" style={{ color: '#71717a' }}>
                            {shareStatus}
                        </div>
                    )}

                    {/* Share Button */}
                    <Button
                        onClick={handleShare}
                        disabled={sharing}
                        variant="outline"
                        className="w-full h-12 text-white rounded-xl"
                        style={{ borderColor: '#27272a' }}
                    >
                        {sharing ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Receipt
                            </>
                        )}
                    </Button>

                    {/* Back to Dashboard Button */}
                    <Button
                        onClick={onContinue}
                        className="w-full h-12 font-semibold rounded-xl"
                        style={{ backgroundColor: '#f7931a', color: '#000000' }}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    {/* Footer Note */}
                    <p className="text-center text-xs" style={{ color: '#71717a' }}>
                        Commission has been added to your wallet balance.
                    </p>
                </div>
            </div>
        </div>
    )
}
