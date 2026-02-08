'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Wallet, Copy, CheckCircle2, Bitcoin, Zap, Shield, Clock, User, LayoutDashboard, LogOut, Activity, BarChart2, History, ChevronRight, QrCode, AlertTriangle, Search, Settings, Briefcase, ShieldCheck, Percent, Star, TrendingUp, Award, Users, Gem, ArrowUpRight, Lock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { User as UserType, Package as PackageType } from '@prisma/client'
import { WalletEnhancements } from '@/components/WalletEnhancements'
import { LiveTerminal } from '@/components/LiveTerminal'
import { NetworkMap } from '@/components/NetworkMap'
import { KYCBlockingModal } from '@/components/KYCBlockingModal'
import { WalletHistory } from '@/components/WalletHistory'
import { TierBadge } from '@/components/TierBadge'
import { PaymentAnimation } from '@/components/PaymentAnimation'
import { PaymentSuccessPage } from '@/components/PaymentSuccessPage'
import { AppShell, type View } from '@/components/layout'
import { UserSettingsView } from '@/components/UserSettingsView'
import { extractApiError } from '@/lib/error-utils'
import { GasFeeWidget } from '@/components/GasFeeWidget'
import { CryptoNews } from '@/components/CryptoNews'
import { getTierConfig } from '@/lib/tiers'
import { UserAvatar, AvatarSelector, useAvatarSelection, getAvatarConfig } from '@/components/AvatarSelector'

// Extend UserType to include account_tier
type ExtendedUserType = UserType & { account_tier?: string }

export default function DashboardPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('landing')
  const [user, setUser] = useState<ExtendedUserType | null>(null)
  const [packages, setPackages] = useState<PackageType[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false)
  const [showSuccessPage, setShowSuccessPage] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
          await fetchPackages()
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }
    checkAuth()
  }, [])



  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  // Mobile text size utility
  const mobileTextBase = "text-base md:text-sm lg:text-base font-mono"

  const fetchPackages = async () => {
    setPackagesLoading(true)
    try {
      const res = await fetch('/api/packages')
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setPackagesLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePayment = async (bitcoinAddress: string) => {
    if (!selectedPackage) return

    // Guard: insufficient balance
    const price = Number(selectedPackage.price_usd || 0)
    const walletBalance = Number(user?.wallet_balance_usdt || 0)
    if (walletBalance < price) {
      showMessage(
        `Insufficient wallet balance. You need ${(price - walletBalance).toFixed(2)} USDT more. Please top up your wallet first.`,
        'error'
      )
      return
    }

    setLoading(true)

    // Show payment animation immediately
    setShowPaymentAnimation(true)

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          bitcoin_wallet: bitcoinAddress,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Animation will handle the success message timing
        // Just refresh user data in background
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
      } else {
        // Hide animation on error
        setShowPaymentAnimation(false)

        const errorMsg = extractApiError(data, 'Failed to purchase package')
        if (errorMsg.includes('Insufficient') || errorMsg.includes('balance')) {
          const shortage = data.details?.shortage || data.error?.details?.shortage || 0
          showMessage(
            `Insufficient wallet balance. You need ${typeof shortage === 'number' ? shortage.toFixed(2) : shortage} USDT more. Please top up your wallet first.`,
            'error'
          )
        } else if (errorMsg.includes('authenticated')) {
          showMessage('Please login first', 'error')
          router.push('/login')
        } else {
          showMessage(errorMsg, 'error')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      setShowPaymentAnimation(false)
      showMessage('Connection error. Please try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAnimationComplete = () => {
    setShowPaymentAnimation(false)
    setShowSuccessPage(true)
  }

  const handleSuccessContinue = () => {
    setShowSuccessPage(false)
    showMessage('Package purchased successfully! Commission added to your balance.', 'success')
    setCurrentView('landing')
  }

  if (!user) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center">
              <Bitcoin className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppShell
      user={user}
      currentView={currentView}
      setCurrentView={setCurrentView}
      onLogout={handleLogout}
    >
      {/* Verification Banner */}
      {!user.is_verified && (
        <div className="relative z-50 mb-6">
          <KYCBlockingModal status={user.kyc_status || 'none'} userId={user.id} isVerified={user.is_verified} />
        </div>
      )}

      {/* Alert Messages */}
      {message && (
        <Alert className={`mb-6 border ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
          message.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
            'border-blue-500/50 bg-blue-500/10 text-blue-400'
          }`}>
          <AlertDescription className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {message.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Page Content - Ultra Modern Tech Mode */}
      <div className="min-h-full pb-20 relative overflow-hidden selection:bg-emerald-500/20">
        {/* Hero Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/5 rounded-[100%] blur-[100px] pointer-events-none" />

        {/* Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] pointer-events-none" />

        {currentView === 'landing' && (
          <LandingView
            setCurrentView={setCurrentView}
            packages={packages}
            packagesLoading={packagesLoading}
            onSelectPackage={(pkg) => {
              setSelectedPackage(pkg)
              setCurrentView('payment')
            }}
          />
        )}
        {currentView === 'wallet' && <WalletView user={user} />}
        {currentView === 'account' && (
          <AccountView
            user={user}
            onLogout={handleLogout}
            onOpenSettings={() => setCurrentView('settings')}
          />
        )}
        {currentView === 'settings' && (
          <UserSettingsView user={user} onLogout={handleLogout} />
        )}
        {currentView === 'history' && <HistoryView user={user} />}
        {currentView === 'commissions' && <CommissionHistoryView user={user} />}
        {currentView === 'payment' && selectedPackage && (
          <PaymentView
            pkg={selectedPackage}
            user={user}
            onSubmit={handlePayment}
            loading={loading}
            onBack={() => setCurrentView('landing')}
          />
        )}
      </div>

      {/* Payment Animation */}
      <PaymentAnimation
        isOpen={showPaymentAnimation}
        onComplete={handleAnimationComplete}
        packageName={selectedPackage?.name || ''}
        amount={Number(selectedPackage?.btc_amount) || 0}
      />

      {/* Payment Success Page */}
      <PaymentSuccessPage
        isOpen={showSuccessPage}
        package={selectedPackage}
        user={user}
        onContinue={handleSuccessContinue}
      />
    </AppShell>
  )
}

// ===== SUB-COMPONENTS =====

function PaymentView({
  pkg,
  user,
  onSubmit,
  loading,
  onBack,
}: {
  pkg: PackageType
  user: ExtendedUserType
  onSubmit: (bitcoinAddress: string) => Promise<void> | void
  loading: boolean
  onBack: () => void
}) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [addressType, setAddressType] = useState<string>('')
  const [payWarning, setPayWarning] = useState<string | null>(null)

  const walletBalance = Number(user?.wallet_balance_usdt || 0)
  const price = Number(pkg.price_usd || 0)
  const commission = price * 0.1
  const net = price - commission
  const hasBalance = walletBalance >= price

  const detectAddressType = (addr: string) => {
    const trimmed = addr.trim()
    if (/^bc1[a-z0-9]{39,59}$/i.test(trimmed)) return 'Bitcoin (bech32)'
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)) return 'Bitcoin (legacy/segwit)'
    return trimmed.length ? 'Unsupported address (only Bitcoin allowed)' : ''
  }

  useEffect(() => {
    setAddress('')
    setAddressType('')
  }, [user?.wallet_ref])

  const handlePay = async () => {
    const trimmed = address.trim()
    const isBtc = /^bc1[a-z0-9]{39,59}$/i.test(trimmed) || /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed)

    if (walletBalance < price) {
      setPayWarning(`Insufficient wallet balance. You need ${(price - walletBalance).toFixed(2)} USDT more. Please top up your wallet first.`)
      return
    } else {
      setPayWarning(null)
    }

    if (!trimmed || !isBtc) {
      setError('Only Bitcoin addresses are accepted')
      return
    }
    setError(null)
    await onSubmit(trimmed)
  }

  const recommendedWallets = [
    'Binance',
    'Coinbase',
    'OKX',
    'Kraken',
    'KuCoin',
    'Bybit',
    'Bitfinex',
    'Gate.io',
    'HTX (Huobi)',
    'Bitstamp',
  ]

  return (
    <div className="relative pb-20">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-emerald-500/5 via-[#050510] to-black/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40" />
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase tracking-[0.2em]">
            SECURE_PAYMENT_CHANNEL
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Complete Your Flash BTC Purchase</h2>
          <p className="text-gray-400">Unified visual identity across packages, payment, and receipts.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="border-white/10 text-gray-300 hover:text-white hover:border-emerald-400/60">
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Package summary */}
        <div className="group relative bg-[#0c0c0e] border border-white/5 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/10 group-hover:border-emerald-400 transition-colors" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/10 group-hover:border-emerald-400 transition-colors" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/10 group-hover:border-emerald-400 transition-colors" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/10 group-hover:border-emerald-400 transition-colors" />
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] bg-[length:100%_200%] animate-scanline opacity-0 group-hover:opacity-100 pointer-events-none" />

          <div className="p-6 space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.25em] bg-emerald-500/10 px-2 py-1 inline-flex items-center gap-2 rounded-sm">
                  <Zap className="w-3 h-3" /> STARTER PACKAGE
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white flex items-baseline gap-2">
                  {pkg.btc_amount} <span className="text-sm text-gray-500 font-normal">BTC</span>
                </div>
                <div className="text-gray-400 text-sm font-mono uppercase tracking-[0.2em]">Flash Bitcoin License</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-md overflow-hidden">
              {[{ label: 'Price', value: `$${price.toLocaleString()}` }, { label: 'USDT', value: `${pkg.usdt_amount} USDT` }, { label: 'Duration', value: `${pkg.duration} Days` }, { label: 'Transfers', value: `${pkg.transfers} / Day` }].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#050505] flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
              ))}
              <div className="col-span-2 p-3 bg-[#050505] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">Divisible</span>
                <span className="text-emerald-400 font-semibold">Yes</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase tracking-[0.2em]">
                Recommended Wallets to Use
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recommendedWallets.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-200 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent opacity-70" />
            <div className="relative p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-emerald-400 text-xs font-mono tracking-[0.25em]">PAYMENT SUMMARY</p>
                  <h3 className="text-2xl font-bold text-white mt-2">RECIPIENT WALLET ADDRESS</h3>
                  <p className="text-gray-400 text-sm mt-1">Secure transaction • Instant activation • 24/7 support</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Shield className="w-3 h-3" />
                  VERIFIED
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3">
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-[0.2em]">PAYMENT SUMMARY</p>
                  <div className="text-sm text-gray-300">Flash BTC license purchase. Funds will be debited from your balance and activated instantly.</div>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>Daily Capacity</span>
                    <span className="text-white">{pkg.btc_amount} BTC</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>Duration</span>
                    <span className="text-white">{pkg.duration} Days</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-gray-400">
                    <span>Your Wallet Balance</span>
                    <span className="text-white">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span className="flex items-center gap-2">Status</span>
                    <Badge variant="outline" className={hasBalance ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}>
                      {hasBalance ? '✓ Sufficient' : 'Insufficient'}
                    </Badge>
                  </div>
                  <div className="border-t border-white/10 pt-3 space-y-1 text-sm font-mono">
                    <div className="flex justify-between text-gray-300">
                      <span>Package Price</span>
                      <span className="text-red-400">-${price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Commission (10%) Instant Reward</span>
                      <span className="text-emerald-400">+${commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {payWarning && (
                <div className="text-sm bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg px-3 py-2 font-mono">
                  {payWarning}
                  <div className="text-xs text-red-200/80 mt-1">Top up your wallet to complete this purchase.</div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050505] space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    RECIPIENT BTC ADDRESS
                  </div>
                  <Input
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      setAddressType(detectAddressType(e.target.value))
                    }}
                    placeholder="bc1..."
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-600"
                  />
                  <div className="text-xs text-gray-400 font-mono">
                    {addressType || 'Only Bitcoin addresses are accepted'}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={handlePay}
                      disabled={loading}
                      className="w-full md:w-auto px-10 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold border-none shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Pay'}
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-[#050505] space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    LIVE PROTOCOL FEED
                  </div>
                  <div className="space-y-2 text-sm text-gray-300 font-mono">
                    <div className="flex items-center justify-between"><span>Consensus</span><span className="text-emerald-400">BIP-340</span></div>
                    <div className="flex items-center justify-between"><span>Propagation</span><span className="text-cyan-300">Ultra-fast</span></div>
                    <div className="flex items-center justify-between"><span>Visual Sync</span><span className="text-white">Binance · OKX · Coinbase</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function LandingView({ setCurrentView, packages, packagesLoading, onSelectPackage }: {
  setCurrentView: (view: View) => void
  packages: PackageType[]
  packagesLoading: boolean
  onSelectPackage: (pkg: PackageType) => void
}) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 relative w-full">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10 pointer-events-none" />

      <div className="text-center space-y-8 max-w-4xl mx-auto py-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-mono tracking-widest text-xs uppercase">SYSTEM STATUS: ONLINE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
          Generate <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse-glow">Flash Bitcoin (BTC)</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
          Advanced blockchain software generating non-traceable Flash Bitcoin tokens.
          <span className="block mt-4 text-white font-medium flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Network Status: Operational
          </span>
        </p>



        {/* Crypto News Section */}
        <div className="py-8">
          <div className="max-w-5xl mx-auto">
            <CryptoNews />
          </div>
        </div>




      </div>

      {/* Packages Section */}
      <div className="space-y-12 pt-12 border-t border-white/5">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Select License Tier</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Choose your daily generation limit. Instant activation upon purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {packagesLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-full rounded-2xl border border-white/10 bg-white/5 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-10 w-32 bg-white/10 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
                <div className="h-20 bg-white/10 rounded" />
                <div className="h-10 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onSelect={() => onSelectPackage(pkg)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RateCard({ tier, price, sub }: { tier: string; price: string; sub: string }) {
  return (
    <div className="p-6 bg-[#0e0e24]/50 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
          <Zap className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
        </div>
        <Badge variant="outline" className="border-white/10 text-gray-500 text-xs">{tier}</Badge>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{price}</div>
      <div className="text-gray-500 text-sm font-medium">{sub} Limit</div>
    </div>
  )
}

function PackagesView({ packages, onSelectPackage }: {
  packages: PackageType[]
  onSelectPackage: (pkg: PackageType) => void
}) {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Select Flash BTC Limit</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Purchase a license to generate specific amounts of Flash BTC daily.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onSelect={() => onSelectPackage(pkg)}
          />
        ))}
      </div>
    </div>
  )
}

function PackageCard({ pkg, onSelect }: {
  pkg: PackageType
  onSelect: () => void
}) {
  const isLocked = pkg.locked

  return (
    <div className={`group relative bg-[#0c0c0e] border border-white/5 transition-all duration-300 overflow-hidden flex flex-col h-full rounded-lg ${isLocked
      ? 'opacity-80'
      : 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
      }`}>
      {/* Locked Overlay - Soft & Subtle */}
      {isLocked && (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-500/10 border border-gray-500/30 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-400 font-medium text-sm">Temporarily Unavailable</p>
        </div>
      )}

      {/* Cyber Corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-colors ${isLocked ? 'border-gray-500/30' : 'border-white/10 group-hover:border-emerald-500'}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 transition-colors ${isLocked ? 'border-gray-500/30' : 'border-white/10 group-hover:border-emerald-500'}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 transition-colors ${isLocked ? 'border-gray-500/30' : 'border-white/10 group-hover:border-emerald-500'}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-colors ${isLocked ? 'border-gray-500/30' : 'border-white/10 group-hover:border-emerald-500'}`} />

      {/* Scanline Overlay */}
      {!isLocked && (
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] bg-[length:100%_200%] animate-scanline pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="p-6 flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 inline-block rounded-sm ${isLocked
              ? 'text-gray-400 bg-gray-500/10'
              : 'text-emerald-500 bg-emerald-500/10'
              }`}>
              MODULE: {pkg.name}
            </div>
            <div className="text-4xl font-mono font-bold text-white flex items-baseline gap-2 mt-2">
              {pkg.btc_amount} <span className="text-sm text-gray-500 font-sans font-normal">BTC</span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border transition-colors ${isLocked
            ? 'border-gray-500/30'
            : 'border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10'
            }`}>
            <Bitcoin className={`w-4 h-4 transition-colors ${isLocked ? 'text-gray-500' : 'text-gray-400 group-hover:text-emerald-400'}`} />
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden mb-6">
          <div className={`bg-[#0c0c0e] p-3 text-center transition-colors ${!isLocked && 'group-hover:bg-[#0f1512]'}`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Duration</div>
            <div className="text-sm font-mono text-white">{pkg.duration} Days</div>
          </div>
          <div className={`bg-[#0c0c0e] p-3 text-center transition-colors ${!isLocked && 'group-hover:bg-[#0f1512]'}`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Rate</div>
            <div className="text-sm font-mono text-white">{pkg.transfers}/Day</div>
          </div>
          <div className={`bg-[#0c0c0e] p-3 text-center col-span-2 border-t border-white/5 transition-colors ${!isLocked && 'group-hover:bg-[#0f1512]'}`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Unit Cost</div>
            <div className={`text-sm font-mono ${isLocked ? 'text-gray-400' : 'text-emerald-400'}`}>${(pkg.price_usd / Number(pkg.btc_amount)).toFixed(2)} / BTC</div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto space-y-4">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div className="text-xs text-gray-500 font-mono">TOTAL_COST_USDT</div>
            <div className="text-xl font-mono font-bold text-white">${pkg.price_usd.toLocaleString()}</div>
          </div>

          <Button
            className={`w-full font-mono uppercase tracking-widest text-xs h-12 rounded-none transition-all duration-300 relative overflow-hidden group/btn ${isLocked
              ? 'bg-gray-800 text-gray-500'
              : 'bg-white text-black hover:bg-emerald-500 hover:text-white'
              }`}
            onClick={isLocked ? undefined : onSelect}
            disabled={isLocked}
          >
            <span className="relative z-10">{isLocked ? 'Temporarily Unavailable' : 'Initialize Protocol'}</span>
            {!isLocked && (
              <div className="absolute inset-0 bg-emerald-600 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function WalletView({ user }: { user: UserType | null }) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawNetwork, setWithdrawNetwork] = useState<'TRC20' | 'ERC20'>('ERC20')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    network: string
    error: string
  } | null>(null)

  // Validate withdrawal address
  const validateWithdrawAddress = (address: string) => {
    if (!address || address.trim() === '') {
      setAddressValidation(null)
      return
    }

    const trimmedAddress = address.trim()
    let isValid = false
    let network = 'Unknown'
    let error = ''

    // Ethereum (ERC20) validation: starts with 0x, 42 characters total
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      network = 'Ethereum (ERC20)'
      if (withdrawNetwork === 'ERC20') {
        isValid = true
      } else {
        error = 'This is an ERC20 address. Please select ERC20 network or use a TRC20 address.'
      }
    }
    // Tron (TRC20) validation: starts with T, 34 characters
    else if (/^T[A-Za-z1-9]{33}$/.test(trimmedAddress)) {
      network = 'Tron (TRC20)'
      if (withdrawNetwork === 'TRC20') {
        isValid = true
      } else {
        error = 'This is a TRC20 address. Please select TRC20 network or use an ERC20 address.'
      }
    }
    // Bitcoin addresses
    else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Legacy/SegWit)'
      error = `Only ${withdrawNetwork} addresses are accepted for USDT withdrawals.`
    } else if (/^bc1[a-z0-9]{39,59}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Native SegWit)'
      error = `Only ${withdrawNetwork} addresses are accepted for USDT withdrawals.`
    }
    // Solana
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress) && !trimmedAddress.startsWith('T') && !trimmedAddress.startsWith('0x')) {
      network = 'Solana'
      error = `Only ${withdrawNetwork} addresses are accepted for USDT withdrawals.`
    }
    else {
      error = `Invalid address format. Please enter a valid ${withdrawNetwork} address.`
    }

    setAddressValidation({ isValid, network, error })
  }

  const handleWithdrawAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWithdrawAddress(value)
    validateWithdrawAddress(value)
  }

  // Re-validate address when network changes
  useEffect(() => {
    if (withdrawAddress) {
      validateWithdrawAddress(withdrawAddress)
    }
  }, [withdrawNetwork])

  if (!user) {
    return null
  }

  // Calculate total value
  const totalValueUSD = user.wallet_balance_usdt

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || !withdrawAddress || !addressValidation?.isValid) return

    setWithdrawing(true)
    setWithdrawMessage(null)

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          address: withdrawAddress,
          network: withdrawNetwork
        })
      })

      const data = await res.json()

      if (res.ok) {
        setWithdrawMessage({ text: data.message || 'Withdrawal request submitted successfully!', type: 'success' })
        setWithdrawAmount('')
        setWithdrawAddress('')
        setAddressValidation(null)
        // Refresh user data
        window.location.reload()
      } else {
        setWithdrawMessage({ text: extractApiError(data, 'Failed to submit withdrawal request'), type: 'error' })
      }
    } catch (error) {
      setWithdrawMessage({ text: 'Connection error. Please try again.', type: 'error' })
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            WALLET_CONNECT_ACTIVE
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Wallet Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your digital assets and flash liquidity.</p>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="relative group bg-[#0c0c0e] border border-white/10 hover:border-emerald-500/30 transition-all duration-300 p-8 overflow-hidden rounded-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-emerald-500 text-xs font-mono uppercase tracking-widest mb-3">Total Asset Value</p>
            <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter mb-2">
              ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-2 font-mono">
              <span className="text-emerald-400">● USDT</span>
              <span>TRC20 / ERC20</span>
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/5 shadow-lg">
            <Wallet className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Deposit / Withdraw Tabs */}
      <div className="bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 px-6 py-4 text-sm font-mono tracking-wider transition-all relative overflow-hidden ${activeTab === 'deposit'
              ? 'text-emerald-400 bg-emerald-500/5'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
          >
            {activeTab === 'deposit' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              DEPOSIT_ASSETS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 px-6 py-4 text-sm font-mono tracking-wider transition-all relative overflow-hidden ${activeTab === 'withdraw'
              ? 'text-cyan-400 bg-cyan-500/5'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
          >
            {activeTab === 'withdraw' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              WITHDRAW_FUNDS
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === 'deposit' ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Deposit Assets</h3>
                <p className="text-gray-400 text-sm">Securely transfer USDT to your dedicated wallet address.</p>
              </div>

              {/* USDT ERC20 Wallet Section */}
              <div className="bg-[#050505] border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full" />

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">USDT Deposit Address</h4>
                    <span className="text-xs text-emerald-500 font-mono">NETWORK: ETHEREUM (ERC20)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* USDT QR Code */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-xl shadow-black/50">
                    <img
                      src="/wallet.png"
                      alt="USDT Wallet QR Code"
                      className="w-40 h-40 object-contain mix-blend-multiply"
                    />
                    <p className="text-black/60 text-[10px] mt-4 font-mono tracking-widest text-center uppercase">Scan for ERC20 Deposit</p>
                  </div>

                  {/* USDT Address */}
                  <div className="space-y-6 flex flex-col justify-center">
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-xs uppercase tracking-wider">Wallet Address</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-lg font-mono text-xs md:text-sm text-gray-300 break-all">
                          0xffE27BE1db0c29Be881f570b3d9961712b22C287
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText('0xffE27BE1db0c29Be881f570b3d9961712b22C287')
                          }}
                          className="h-auto bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Network Status</span>
                        <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Min. Deposit</span>
                        <span className="text-white font-mono">10.00 USDT</span>
                      </div>
                    </div>

                    <Alert className="border-amber-500/20 bg-amber-500/5 p-3">
                      <AlertDescription className="text-xs text-amber-400/80 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Send only USDT (ERC20). Other assets may be permanently lost.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Withdraw Funds</h3>
                <p className="text-gray-400 text-sm">Transfer your earnings to an external wallet.</p>
              </div>

              {withdrawMessage && (
                <Alert className={`border ${withdrawMessage.type === 'success'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                  }`}>
                  <AlertDescription className={withdrawMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                    {withdrawMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Network Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setWithdrawNetwork('TRC20')}
                    className={`p-4 rounded-xl border transition-all text-left ${withdrawNetwork === 'TRC20'
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-white/10 bg-[#050505] hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${withdrawNetwork === 'TRC20' ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      <span className={`font-mono text-sm font-bold ${withdrawNetwork === 'TRC20' ? 'text-emerald-400' : 'text-gray-400'}`}>TRC20</span>
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tron Network</div>
                  </button>

                  <button
                    onClick={() => setWithdrawNetwork('ERC20')}
                    className={`p-4 rounded-xl border transition-all text-left ${withdrawNetwork === 'ERC20'
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-white/10 bg-[#050505] hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${withdrawNetwork === 'ERC20' ? 'bg-blue-500' : 'bg-gray-600'}`} />
                      <span className={`font-mono text-sm font-bold ${withdrawNetwork === 'ERC20' ? 'text-blue-400' : 'text-gray-400'}`}>ERC20</span>
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Ethereum Network</div>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Withdrawal Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-[#050505] border-white/10 text-white h-14 pl-4 text-lg font-mono focus:border-cyan-500/50"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <span className="text-gray-500 text-sm font-mono">USDT</span>
                        <button
                          onClick={() => setWithdrawAmount(user.wallet_balance_usdt.toString())}
                          className="text-cyan-500 text-xs font-bold hover:text-cyan-400 uppercase border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-500/10 transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Destination Address</Label>
                    <Input
                      value={withdrawAddress}
                      onChange={handleWithdrawAddressChange}
                      placeholder={withdrawNetwork === 'TRC20' ? 'T...' : '0x...'}
                      className={`bg-[#050505] border-white/10 text-white h-12 font-mono text-sm ${addressValidation?.isValid ? 'border-emerald-500/50 text-emerald-400' :
                        addressValidation?.error ? 'border-red-500/50' : ''
                        }`}
                    />
                    {addressValidation && (
                      <div className={`text-xs flex items-center gap-1.5 ${addressValidation.isValid ? 'text-emerald-500' : 'text-red-500'}`}>
                        {addressValidation.isValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {addressValidation.isValid ? 'Valid wallet address' : addressValidation.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Network Fee</span>
                    <span className="text-white font-mono">1.00 USDT</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                    <span className="text-gray-400">Total Receive</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {withdrawAmount ? (parseFloat(withdrawAmount) - 1).toFixed(2) : '0.00'} USDT
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleWithdrawSubmit}
                  disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) < 10 || !addressValidation?.isValid || withdrawing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-12 font-mono uppercase tracking-widest text-sm"
                >
                  {withdrawing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  {withdrawing ? 'PROCESSING_REQUEST...' : 'INITIATE_WITHDRAWAL'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccountView({
  user,
  onLogout,
  onOpenSettings,
}: {
  user: ExtendedUserType | null
  onLogout: () => void
  onOpenSettings: () => void
}) {
  const localUser = user

  if (!localUser) return null

  const isVerified = localUser.kyc_status === 'approved'
  const tierConfig = getTierConfig((localUser as any).account_tier)
  const ratingMap: Record<string, number> = {
    bronze: 4.0,
    silver: 4.4,
    gold: 4.8,
  }
  const ratingValue = ratingMap[tierConfig.tier] ?? 4.2
  const filledStars = Math.round(ratingValue)
  const [showBenefits, setShowBenefits] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const { avatarId, updateAvatar } = useAvatarSelection(localUser.id)

  // Mock achievements data with Lucide icons
  const achievements = [
    { id: 1, name: 'First Transaction', icon: Zap, unlocked: true, description: 'Completed your first flash' },
    { id: 2, name: 'Verified Agent', icon: CheckCircle2, unlocked: isVerified, description: 'KYC verification approved' },
    { id: 3, name: '10 Transactions', icon: TrendingUp, unlocked: false, description: 'Complete 10 transactions' },
    { id: 4, name: 'Gold Status', icon: Award, unlocked: tierConfig.tier === 'gold', description: 'Reach gold tier' },
    { id: 5, name: 'Referral Master', icon: Users, unlocked: false, description: 'Refer 5 active users' },
    { id: 6, name: 'Loyal Member', icon: Gem, unlocked: true, description: '30 days active member' },
  ]

  // Mock activity data with Lucide icons
  const recentActivity = [
    { id: 1, type: 'login', message: 'Logged in from new device', time: '2 hours ago', icon: Lock },
    { id: 2, type: 'transaction', message: 'Flash completed successfully', time: '5 hours ago', icon: Zap },
    { id: 3, type: 'withdrawal', message: 'Withdrawal request submitted', time: '1 day ago', icon: ArrowUpRight },
    { id: 4, type: 'kyc', message: 'KYC verification approved', time: '3 days ago', icon: ShieldCheck },
  ]

  // Calculate tier progress
  const tierProgressMap: Record<string, { current: number; next: string; required: number }> = {
    bronze: { current: 25, next: 'Silver', required: 50 },
    silver: { current: 65, next: 'Gold', required: 100 },
    gold: { current: 100, next: 'Max', required: 100 },
  }
  const tierProgress = tierProgressMap[tierConfig.tier] || tierProgressMap.bronze

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header with Banner */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Banner Background */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-emerald-600/30 via-cyan-600/20 to-purple-600/30 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent" />
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        {/* Profile Card Overlay */}
        <div className="relative -mt-16 mx-4 md:mx-6 bg-[#0c0c0e] border border-white/10 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative group -mt-16 md:-mt-12">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="relative focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0c0c0e] rounded-full"
              >
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] p-4 bg-gradient-to-br ${getAvatarConfig(avatarId).gradient}`}>
                  <img
                    src={getAvatarConfig(avatarId).image}
                    alt="Avatar"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                {isVerified && (
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#0c0c0e] shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Change Avatar hint on hover */}
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white/80">Change Avatar</span>
                </div>
              </button>
            </div>

            {/* Avatar Selection Modal */}
            <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
              <DialogContent className="bg-[#0c0c0e] border border-white/10 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Choose Your Avatar</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Select an avatar style that represents you
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <AvatarSelector
                    currentAvatarId={avatarId}
                    onSelect={(id) => {
                      updateAvatar(id)
                      setShowAvatarModal(false)
                    }}
                    userName={localUser.name}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{localUser.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <TierBadge tier={tierConfig.tier} size="sm" showIcon={false} />
                  <Badge className={`text-xs font-mono ${isVerified
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                    {isVerified ? 'VERIFIED' : 'PENDING'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                  <User className="w-3 h-3 text-emerald-500" />
                  {localUser.email}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-xs">
                  <Shield className="w-3 h-3 text-cyan-500" />
                  REF: <span className="text-emerald-400">{localUser.wallet_ref}</span>
                </span>
              </div>
              {/* Member since */}
              <p className="text-xs text-gray-500 mt-3 font-mono">
                <Clock className="w-3 h-3 inline mr-1" />
                Member since {new Date(localUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>


          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-[#0c0c0e] border border-white/10 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'achievements', label: 'Achievements', icon: Star },
          { id: 'activity', label: 'Activity', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Status</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white capitalize">{localUser.kyc_status || 'pending'}</div>
              <Badge
                className={`mt-1 text-xs ${localUser.kyc_status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  }`}
              >
                {localUser.kyc_status === 'approved' ? 'Active' : 'Pending'}
              </Badge>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Commission</span>
                <Percent className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {(tierConfig.commissionRate * 100).toFixed(0)}%
              </div>
              <span className="text-xs text-gray-500">per sale</span>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Rating</span>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{ratingValue.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0</span>
              </div>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">Tier Level</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <TierBadge tier={tierConfig.tier} size="md" showIcon={false} />
            </div>
          </div>

          {/* Tier Progress */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Agent Program</h3>
                    <p className="text-xs text-gray-400">Progress to {tierProgress.next} tier</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                  {tierProgress.current}% Complete
                </Badge>
              </div>
              {/* Progress Bar */}
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${tierProgress.current}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-pulse" />
              </div>
              {/* Tier Features */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBenefits(!showBenefits)}
                className="text-gray-400 hover:text-white"
              >
                {showBenefits ? 'Hide Features' : 'View Tier Features'}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showBenefits ? 'rotate-90' : ''}`} />
              </Button>
              {showBenefits && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {tierConfig.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border transition-all ${achievement.unlocked
                    ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                    <IconComponent className={`w-5 h-5 ${achievement.unlocked ? 'text-emerald-400' : 'text-gray-500'}`} />
                  </div>
                  <h4 className={`font-semibold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Achievement Progress */}
          <Card className="bg-[#0c0c0e] border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Achievements Unlocked</span>
                <span className="text-emerald-400 font-bold">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {recentActivity.map((activity, index) => {
            const ActivityIcon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-[#0c0c0e] border border-white/10 rounded-xl hover:border-white/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <ActivityIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                {index === 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                    New
                  </Badge>
                )}
              </div>
            )
          })}
          <Button variant="outline" className="w-full border-white/10 text-gray-400 hover:text-white">
            View All Activity
          </Button>
        </div>
      )}


    </div>
  )
}


function HistoryView({ user }: { user: UserType | null }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = () => {
    setLoading(true)
    fetch(`/api/transactions?_t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log('[HistoryView] Data received:', data)
        setTransactions(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (!user) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <History className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Transactions Log</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE_LEDGER_SYNC
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
            disabled={loading}
            className="border-white/10 bg-[#0c0c0e] hover:bg-white/5 text-gray-300 hover:text-white font-mono text-xs uppercase tracking-wider"
          >
            <span className={loading ? "animate-spin mr-2" : "mr-2"}>⟳</span> REFRESH_DATA
          </Button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-12 font-mono text-xs animate-pulse">
            <Loader2 className="w-6 h-6 mx-auto mb-3 text-emerald-500 animate-spin" />
            INITIALIZING_DATA_STREAM...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-12 font-mono text-xs border border-white/5 rounded-xl bg-[#0c0c0e]">
            NO_TRANSACTIONS_FOUND_ON_CHAIN
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl -mr-10 -mt-10 pointer-events-none opacity-50" />

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm tracking-tight">{String(tx.package || 'Unknown Package')}</div>
                  <div className="text-[10px] text-gray-500 font-mono w-32 truncate bg-white/5 px-2 py-1 rounded border border-white/5">{tx.buyer_wallet}</div>
                </div>
                <Badge variant="outline" className={`
                       ${tx.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : ''}
                       ${tx.status === 'pending' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : ''}
                       ${tx.status === 'failed' ? 'border-red-500/30 text-red-400 bg-red-500/5' : ''}
                       uppercase text-[10px] tracking-widest font-mono
                     `}>
                  {tx.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5 relative z-10">
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Amount</div>
                  <div className="text-white font-mono break-words text-sm">{Number(tx.amount).toLocaleString()} USDT</div>
                </div>
                <div className="text-right min-w-0">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Commission</div>
                  <div className="text-emerald-400 font-mono break-words text-sm">+{Number(tx.commission).toLocaleString()} USDT</div>
                </div>
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">BTC Value</div>
                  <div className="text-white font-mono truncate text-sm flex items-center gap-1">
                    <Bitcoin className="w-3 h-3 text-[#F7931A]" />
                    {tx.btc_amount || 'N/A'}
                  </div>
                </div>
                <div className="text-right min-w-0">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Timestamp</div>
                  <div className="text-gray-400 font-mono text-sm">{new Date(tx.date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 font-medium">Package</th>
                <th className="p-5 font-medium">Bitcoin Wallet</th>
                <th className="p-5 font-medium">Amount</th>
                <th className="p-5 font-medium">BTC Amount</th>
                <th className="p-5 font-medium">Commission</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-mono text-xs animate-pulse">INITIALIZING_DATA_STREAM...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-mono text-xs">NO_TRANSACTIONS_FOUND_ON_CHAIN</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5 text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                      {String(tx.package || 'Unknown Package')}
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-xs">
                      <span className="bg-[#050505] px-3 py-1.5 rounded border border-white/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all cursor-default select-all" title={tx.buyer_wallet}>
                        {tx.buyer_wallet && tx.buyer_wallet.length > 16 ? `${tx.buyer_wallet.substring(0, 8)}...${tx.buyer_wallet.substring(tx.buyer_wallet.length - 8)}` : tx.buyer_wallet}
                      </span>
                    </td>
                    <td className="p-5 text-white font-mono">{Number(tx.amount).toLocaleString()} USDT</td>
                    <td className="p-5 text-white font-mono flex items-center gap-1.5">
                      <Bitcoin className="w-3 h-3 text-[#F7931A]" />
                      {tx.btc_amount || 'N/A'}
                    </td>
                    <td className="p-5 text-emerald-400 font-mono font-bold">+{Number(tx.commission).toLocaleString()} USDT</td>
                    <td className="p-5">
                      <Badge variant="outline" className={`
                           ${tx.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : ''}
                           ${tx.status === 'pending' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : ''}
                           ${tx.status === 'failed' ? 'border-red-500/30 text-red-400 bg-red-500/5' : ''}
                           uppercase text-[10px] tracking-widest font-mono rounded-sm px-2 py-0.5
                         `}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-xs">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CommissionHistoryView({ user }: { user: UserType }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions?userId=${user.id}&_t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      if (res.ok) {
        const data = await res.json()
        console.log('[Dashboard] Raw transactions fetched:', data)

        if (Array.isArray(data)) {
          // Filter for transactions that have commission > 0
          const commissions = data.filter((t: any) => {
            const comm = Number(t.commission)
            return comm > 0
          })
          console.log('[Dashboard] Filtered commissions:', commissions)
          setTransactions(commissions)
        } else {
          setTransactions([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            REVENUE_STREAM_ACTIVE
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Commission Log</h2>
          <p className="text-gray-400 text-sm mt-1">Track your affiliate earnings and performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[#050505] border border-white/10">
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Total Earnings</span>
            </div>
            <div className="text-4xl font-mono font-bold text-white tracking-tight mb-1">
              ${transactions.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0).toLocaleString()} <span className="text-sm text-gray-500 font-normal">USDT</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[#050505] border border-white/10">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">Total Sales</span>
            </div>
            <div className="text-4xl font-mono font-bold text-white tracking-tight mb-1">
              {transactions.length}
            </div>
            <span className="text-sm text-gray-500 font-mono">CONVERSIONS</span>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-12 font-mono text-xs animate-pulse">LOADING_REVENUE_DATA...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-12 font-mono text-xs border border-white/5 rounded-xl bg-[#0c0c0e]">NO_COMMISSIONS_FOUND</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-[#0c0c0e] border border-white/10 rounded-xl p-5 space-y-4 relative overflow-hidden">
              {/* Gradient */}
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm tracking-tight">{String(tx.package || 'Unknown Package')}</div>
                  <div className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded border border-white/5 w-32 truncate">{tx.buyer_wallet}</div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 uppercase text-[10px] tracking-widest font-mono">
                  EARNED
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
                <div>
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Sale Amount</div>
                  <div className="text-white font-mono text-sm">{Number(tx.amount).toLocaleString()} USDT</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Your Cut</div>
                  <div className="text-emerald-400 font-mono font-bold text-sm">+{Number(tx.commission).toLocaleString()} USDT</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-mono">Date</div>
                  <div className="text-gray-400 font-mono text-sm">{new Date(tx.date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5 font-medium">Package</th>
                <th className="p-5 font-medium">USDT Wallet (TRC20)</th>
                <th className="p-5 font-medium">Sale Amount</th>
                <th className="p-5 font-medium">Commission Earned</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-mono text-xs animate-pulse">LOADING_REVENUE_DATA...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-mono text-xs">NO_COMMISSIONS_FOUND</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5 text-white font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                      {String(tx.package || 'Unknown Package')}
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-xs">
                      <span className="bg-[#050505] px-3 py-1.5 rounded border border-white/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all cursor-default select-all" title={tx.buyer_wallet}>
                        {tx.buyer_wallet && tx.buyer_wallet.length > 16 ? `${tx.buyer_wallet.substring(0, 8)}...${tx.buyer_wallet.substring(tx.buyer_wallet.length - 8)}` : tx.buyer_wallet}
                      </span>
                    </td>
                    <td className="p-5 text-white font-mono">{Number(tx.amount).toLocaleString()} USDT</td>
                    <td className="p-5 text-emerald-400 font-mono font-bold">+{Number(tx.commission).toLocaleString()} USDT</td>
                    <td className="p-5">
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 uppercase text-[10px] tracking-widest font-mono rounded-sm px-2 py-0.5">
                        Paid
                      </Badge>
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-xs">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bitcoin className="w-5 h-5 text-[#F7931A]" />
            <span className="font-semibold text-foreground">BitcoinFlash</span>
            <span className="text-xs">© 2018</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Flash Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
