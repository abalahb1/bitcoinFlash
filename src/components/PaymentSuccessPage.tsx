'use client'

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
                backgroundColor: '#000000',
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
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
                {/* Capturable Content */}
                <div
                    ref={contentRef}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '32px 24px',
                        backgroundColor: '#000000',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}
                >

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        {/* Success Circle with Checkmark */}
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '2px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            {/* CSS Checkmark */}
                            <div style={{
                                width: '24px',
                                height: '14px',
                                borderLeft: '4px solid #10b981',
                                borderBottom: '4px solid #10b981',
                                transform: 'rotate(-45deg)',
                                marginTop: '-4px'
                            }} />
                        </div>
                        <h1 style={{
                            fontSize: '22px',
                            fontWeight: 600,
                            color: '#ffffff',
                            margin: '0 0 8px 0',
                            letterSpacing: '-0.02em'
                        }}>
                            Payment Successful
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: '#71717a',
                            margin: 0
                        }}>
                            Your Flash BTC license has been activated
                        </p>
                    </div>

                    {/* Amount Display */}
                    <div style={{
                        textAlign: 'center',
                        padding: '28px 20px',
                        marginBottom: '20px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        border: '1px solid #1f1f1f'
                    }}>
                        <div style={{
                            fontSize: '38px',
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: '6px',
                            letterSpacing: '-0.02em'
                        }}>
                            {pkg.btc_amount} <span style={{ color: '#f7931a' }}>BTC</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#71717a' }}>
                            ${pkg.price_usd.toLocaleString()} USDT
                        </div>
                    </div>

                    {/* Commission Card */}
                    <div style={{
                        padding: '16px 20px',
                        marginBottom: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0' }}>Commission Earned</p>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', margin: 0 }}>
                                +${commissionAmount.toLocaleString()}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(247, 147, 26, 0.15)',
                                border: '1px solid rgba(247, 147, 26, 0.3)',
                                marginBottom: '4px'
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f7931a' }}>{tierName}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>{commissionRate}% Rate</p>
                        </div>
                    </div>

                    {/* Details Table */}
                    <div style={{
                        marginBottom: '20px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        border: '1px solid #1f1f1f',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1f1f1f' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Details</span>
                        </div>

                        {[
                            { label: 'Package', value: pkg.name },
                            { label: 'BTC Amount', value: `${pkg.btc_amount} BTC` },
                            { label: 'Duration', value: `${pkg.duration} Days` },
                            { label: 'Daily Transfers', value: `${pkg.transfers}` },
                            { label: 'Status', value: 'Completed', isStatus: true },
                            { label: 'Date', value: timestamp },
                            { label: 'Transaction ID', value: txId.slice(0, 18) + '...' },
                        ].map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 20px',
                                borderBottom: index < 6 ? '1px solid #1f1f1f' : 'none'
                            }}>
                                <span style={{ fontSize: '14px', color: '#71717a' }}>{item.label}</span>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: item.isStatus ? '#10b981' : '#ffffff'
                                }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary Table */}
                    <div style={{
                        marginBottom: '24px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '12px',
                        border: '1px solid #1f1f1f',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1f1f1f' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            borderBottom: '1px solid #1f1f1f'
                        }}>
                            <span style={{ fontSize: '14px', color: '#71717a' }}>Package Price</span>
                            <span style={{ fontSize: '14px', color: '#ffffff' }}>${pkg.price_usd.toLocaleString()}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            borderBottom: '1px solid #1f1f1f'
                        }}>
                            <span style={{ fontSize: '14px', color: '#71717a' }}>Commission ({commissionRate}%)</span>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#10b981' }}>+${commissionAmount.toLocaleString()}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            backgroundColor: '#111111'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Total Paid</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f7931a' }}>${pkg.price_usd.toLocaleString()} USDT</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid #1f1f1f'
                    }}>
                        <p style={{ fontSize: '11px', color: '#525252', margin: 0, letterSpacing: '0.03em' }}>
                            Flash BTC Protocol | Secure Transaction
                        </p>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-md space-y-3 px-4 mt-6">
                    {shareStatus && (
                        <div className="text-center text-sm py-2 text-zinc-500">
                            {shareStatus}
                        </div>
                    )}

                    <Button
                        onClick={handleShare}
                        disabled={sharing}
                        variant="outline"
                        className="w-full h-12 text-white rounded-xl border-zinc-700 hover:bg-zinc-800"
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

                    <Button
                        onClick={onContinue}
                        className="w-full h-12 font-semibold rounded-xl bg-[#f7931a] hover:bg-[#f7931a]/90 text-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white py-2 transition-colors"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Transaction ID Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Full Transaction ID</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
