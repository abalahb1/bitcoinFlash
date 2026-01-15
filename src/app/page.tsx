'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, Copy, CheckCircle2, Bitcoin, Zap, Shield, Clock, ArrowRight, User, LayoutDashboard, Package, LogOut, ChevronRight, Terminal, Activity } from 'lucide-react'
import type { User as UserType, Package as PackageType, Payment } from '@prisma/client'
import { GlitchText } from '@/components/effects/GlitchText'
import { TypingText } from '@/components/effects/TypingText'
import { Scanlines } from '@/components/effects/Scanlines'
import { BinaryParticles } from '@/components/effects/BinaryParticles'
import { HexagonGrid } from '@/components/effects/HexagonGrid'
import { CyberBorder } from '@/components/effects/CyberBorder'
import { PulseRing } from '@/components/effects/PulseRing'
import { DigitalOperations } from '@/components/effects/DigitalOperations'
import { FloatingCryptoCoins, TradingPairsAnimation } from '@/components/CryptoAnimations'

type View = 'auth' | 'landing' | 'packages' | 'wallet' | 'payment'

const SELLER_WALLET = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"

// Utility function for formatting time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('auth')
  const [user, setUser] = useState<UserType | null>(null)
  const [packages, setPackages] = useState<PackageType[]>([])
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [paymentTimer, setPaymentTimer] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
          setCurrentView('landing')
          await fetchPackages()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  // Payment countdown timer
  useEffect(() => {
    if (paymentTimer > 0) {
      const timer = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCurrentView('wallet')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [paymentTimer])

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        setCurrentView('landing')
        await fetchPackages()
        showMessage('Welcome back!', 'success')
      } else {
        showMessage(data.error || 'Login failed', 'error')
      }
    } catch (error) {
      showMessage('Connection error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
    setCurrentView('auth')
    setPackages([])
    setSelectedPackage(null)
  }

  const handlePayment = async (buyerWallet: string) => {
    if (!selectedPackage) return

    setLoading(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          buyer_wallet: buyerWallet,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setPaymentTimer(3600) // 60 minutes
        showMessage('تم إرسال الدفع بنجاح! سيتم مراجعته خلال 60 دقيقة', 'success')
      } else {
        // Handle specific error cases
        if (data.error?.includes('pending transaction')) {
          showMessage('لديك دفعية معلقة بالفعل. يرجى الانتظار حتى تتم المراجعة', 'error')
        } else if (data.error?.includes('Not authenticated')) {
          showMessage('يجب تسجيل الدخول أولاً', 'error')
          setCurrentView('auth')
        } else {
          showMessage(data.error || 'فشل إرسال الدفع', 'error')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      showMessage('خطأ في الاتصال. يرجى المحاولة مرة أخرى', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ===== AUTH VIEW =====
  if (currentView === 'auth') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510] relative overflow-hidden">
        {/* Hacker Effects */}
        <DigitalOperations maxOperations={12} color="#00f3ff" />
        <BinaryParticles count={15} size={10} color="#00f3ff" />
        <HexagonGrid opacity={0.015} />
        <Scanlines opacity={0.02} />
        {/* Crypto Animations */}
        <FloatingCryptoCoins count={15} />
        <TradingPairsAnimation count={6} />
        <div className="relative z-10">
          <AuthView
            onLogin={handleLogin}
            loading={loading}
            message={message}
          />
        </div>
      </div>
    )
  }

  // ===== MAIN APP WITH NAVBAR =====
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510] relative overflow-hidden">
      {/* Hacker Effects */}
      <DigitalOperations maxOperations={15} color="#00f3ff" />
      <BinaryParticles count={18} size={10} color="#00f3ff" />
      <HexagonGrid opacity={0.015} />
      <Scanlines opacity={0.02} />
      {/* Crypto Animations */}
      <FloatingCryptoCoins count={20} />
      <TradingPairsAnimation count={8} />

      <div className="relative z-10">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogout={handleLogout}
        />

        <main className="flex-1 container mx-auto px-4 py-8">
          {message && (
            <Alert className={`mb-6 border ${
              message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
              message.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
              'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
            }`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {currentView === 'landing' && <LandingView setCurrentView={setCurrentView} />}
          {currentView === 'packages' && (
            <PackagesView
              packages={packages}
              onSelectPackage={(pkg) => {
                setSelectedPackage(pkg)
                setCurrentView('payment')
              }}
            />
          )}
          {currentView === 'wallet' && <WalletView user={user} />}
          {currentView === 'payment' && selectedPackage && (
            <PaymentView
              pkg={selectedPackage}
              user={user}
              sellerWallet={SELLER_WALLET}
              onSubmit={handlePayment}
              loading={loading}
              paymentTimer={paymentTimer}
              onCopy={copyToClipboard}
              copied={copied}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

// ===== SUB-COMPONENTS =====

function Navbar({ currentView, setCurrentView, onLogout }: {
  currentView: View
  setCurrentView: (view: View) => void
  onLogout: () => void
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#0a0a1f]/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <div className="relative">
              <PulseRing maxRings={2} color="#00f3ff" />
              <Bitcoin className="w-8 h-8" />
            </div>
            <span className="tracking-wider uppercase"><GlitchText text="Bitcoin Flash" /></span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <NavButton
              active={currentView === 'landing'}
              onClick={() => setCurrentView('landing')}
              icon={<LayoutDashboard className="w-4 h-4" />}
            >
              Home
            </NavButton>
            <NavButton
              active={currentView === 'packages'}
              onClick={() => setCurrentView('packages')}
              icon={<Package className="w-4 h-4" />}
            >
              Packages
            </NavButton>
            <NavButton
              active={currentView === 'wallet'}
              onClick={() => setCurrentView('wallet')}
              icon={<Wallet className="w-4 h-4" />}
            >
              Wallet
            </NavButton>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ active, onClick, children, icon }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      onClick={onClick}
      className={`${
        active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
          : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
      }`}
    >
      {icon}
      {children}
    </Button>
  )
}

function AuthView({ onLogin, loading, message }: {
  onLogin: (email: string, password: string) => void
  loading: boolean
  message: { text: string; type: 'success' | 'error' | 'info' } | null
}) {
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(loginEmail, loginPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-cyan-500/20 rounded-full border border-cyan-500/50 relative">
            <PulseRing maxRings={3} color="#00f3ff" />
            <Bitcoin className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-cyan-400 tracking-wider uppercase mb-2">
            <GlitchText text="Bitcoin Flash" />
          </h1>
          <p className="text-gray-400 font-mono">
            <TypingText text="Secure. Fast. Advanced." speed={80} />
          </p>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 border ${
            message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
            message.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
            'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
          }`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <CyberBorder>
          <Card className="bg-[#0a0a1f] border border-cyan-500/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                Secure Login
              </CardTitle>
              <CardDescription className="text-gray-400 font-mono">
                Access your account securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="mohmmaed211@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-[#050510] border-gray-700 text-white focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-[#050510] border-gray-700 text-white focus:border-cyan-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Access System
                </Button>
              </form>
            </CardContent>
          </Card>
        </CyberBorder>
      </div>
    </div>
  )
}

function LandingView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Section */}
      <div className="text-center py-16 space-y-6">
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 mb-4 font-mono animate-pulse">
          <Activity className="w-4 h-4 mr-2" />
          Next Gen Technology
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Advanced <GlitchText text="Flash" /> Technology
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-mono">
          <TypingText text="Secure. Fast. Untraceable. The world's most advanced crypto-fragmentation engine." speed={30} />
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button
            onClick={() => setCurrentView('packages')}
            size="lg"
            className="bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:scale-105 transition-all text-lg px-8"
          >
            View Packages
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={() => setCurrentView('wallet')}
            size="lg"
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:scale-105 transition-all text-lg px-8"
          >
            My Wallet
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Zap className="w-8 h-8" />}
          title="Lightning Fast"
          description="Process transactions in minutes, not hours"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Secure & Encrypted"
          description="Military-grade encryption protects your data"
        />
        <FeatureCard
          icon={<Clock className="w-8 h-8" />}
          title="24/7 Processing"
          description="Our team works around the clock for you"
        />
      </div>

      {/* Market Rates Preview */}
      <Card className="bg-[#0a0a1f] border border-cyan-500/20 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Current Market Rates</CardTitle>
          <CardDescription className="text-gray-400">
            Choose the plan that fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RateCard tier="Package 1" price="300,000 USDT" />
            <RateCard tier="Package 2" price="150,000 USDT" />
            <RateCard tier="Package 3" price="500,000 USDT" />
            <RateCard tier="Package 4" price="250,000 USDT" />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setCurrentView('packages')}
            className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:scale-105 transition-all"
          >
            View All Packages
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="bg-[#0a0a1f] border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,243,255,0.2)] transition-all hover:-translate-y-1 cursor-pointer">
      <CardContent className="pt-6">
        <div className="text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function RateCard({ tier, price }: { tier: string; price: string }) {
  return (
    <div className="text-center p-6 bg-[#050510] rounded-lg border border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer hover:-translate-y-1">
      <h3 className="text-lg text-gray-300 mb-2">{tier} Tier</h3>
      <div className="text-3xl font-bold text-cyan-400">{price}</div>
    </div>
  )
}

function PackagesView({ packages, onSelectPackage }: {
  packages: PackageType[]
  onSelectPackage: (pkg: PackageType) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Select Your Package</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Supported Wallets: Binance, Blockchain, FaucetPay, Trust Wallet, OKX, Coinbase
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  return (
    <Card className="bg-[#0a0a1f] border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden group">
      {/* Top right Bitcoin icon */}
      <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
        <Bitcoin className="w-24 h-24 text-cyan-400" />
      </div>
      
      {/* Bottom left BTC badge */}
      <div className="absolute bottom-0 left-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-2 border-orange-500/50 text-lg font-bold">
          <Bitcoin className="w-4 h-4 mr-1" />
          BTC
        </Badge>
      </div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-white text-xl">{pkg.name}</CardTitle>
        <CardDescription className="text-cyan-400 text-3xl font-bold flex items-center gap-2">
          {pkg.usdt_amount} USDT
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex-1 space-y-3">
        <div className="flex items-center justify-between text-gray-300">
          <span>BTC Amount</span>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
            {pkg.btc_amount} BTC
          </Badge>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span>Duration</span>
          <span className="text-white">{pkg.duration} Days</span>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span>Transfers</span>
          <span className="text-white">{pkg.transfers} times</span>
        </div>
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Supports Fragmentation
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Full Wallet Support
          </div>
        </div>
      </CardContent>
      <CardFooter className="relative z-10">
        <Button
          onClick={onSelect}
          className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 hover:scale-105 transition-all duration-300"
        >
          Select Package
          <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function WalletView({ user }: { user: UserType | null }) {
  if (!user) return null

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-bold text-white mb-6">Wallet Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="bg-[#0a0a1f] border border-cyan-500/20 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-cyan-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1">Full Name</div>
              <div className="text-white font-semibold">{user.name}</div>
            </div>
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-cyan-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1">Email Address</div>
              <div className="text-white font-semibold">{user.email}</div>
            </div>
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-cyan-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1">Phone Number</div>
              <div className="text-white font-semibold">{user.phone || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="bg-[#0a0a1f] border border-cyan-500/20 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Flash Balance (USDT)</div>
              <div className="text-2xl font-bold text-white font-mono">
                {user.wallet_balance_usdt.toFixed(2)} USDT
              </div>
            </div>
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-orange-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Flash Balance (BTC)</div>
              <div className="text-2xl font-bold text-white font-mono">
                {user.wallet_balance_btc.toFixed(6)} BTC
              </div>
            </div>
            <div className="p-4 bg-[#050510] rounded-lg border border-gray-800 hover:border-purple-500/30 transition-colors">
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Wallet Reference ID</div>
              <div className="text-xl font-bold text-purple-400 font-mono">
                {user.wallet_ref || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PaymentView({ pkg, user, sellerWallet, onSubmit, loading, paymentTimer, onCopy, copied }: {
  pkg: PackageType
  user: UserType | null
  sellerWallet: string
  onSubmit: (wallet: string) => void
  loading: boolean
  paymentTimer: number
  onCopy: (text: string) => void
  copied: boolean
}) {
  const [buyerWallet, setBuyerWallet] = useState('')
  const [hasError, setHasError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (buyerWallet.trim()) {
      onSubmit(buyerWallet)
    }
  }

  if (paymentTimer > 0) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="bg-[#0a0a1f] border border-emerald-500/20 shadow-[0_0_30px_rgba(0,255,157,0.15)]">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl">Payment Processing</CardTitle>
            <CardDescription className="text-gray-400">
              Please wait, our team is processing your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl font-mono font-bold text-purple-400 animate-pulse">
              {formatTime(paymentTimer)}
            </div>
            <Alert className="border-cyan-500/50 bg-cyan-500/10 text-cyan-400">
              <AlertDescription>
                <strong>Do not refresh or close this page.</strong>
                <br />
                Your transaction is being verified on the blockchain.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <Card className="bg-[#0a0a1f] border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Bitcoin className="w-32 h-32 text-cyan-400" />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-white">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          <div>
            <div className="text-cyan-400 text-xl font-semibold mb-2">{pkg.name}</div>
            <div className="text-4xl font-bold text-white flex items-center gap-2">
              <span>{pkg.usdt_amount} USDT</span>
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-2 border-orange-500/50">
                <Bitcoin className="w-3 h-3 mr-1" />
                {pkg.btc_amount} BTC
              </Badge>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-gray-300">
              <span>USDT Amount</span>
              <span className="text-emerald-400 font-semibold">{pkg.usdt_amount} USDT</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>BTC Amount</span>
              <span className="text-orange-400 font-semibold">{pkg.btc_amount} BTC</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Duration</span>
              <span className="text-white font-semibold">{pkg.duration} Days</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Transfers</span>
              <span className="text-white font-semibold">{pkg.transfers} times</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card className="bg-[#0a0a1f] border border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white">Confirm Payment</CardTitle>
          <CardDescription className="text-gray-400">
            Send Bitcoin to the address below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Send Bitcoin To:</Label>
              <div className="flex gap-2">
                <Input
                  value={sellerWallet}
                  readOnly
                  className="bg-[#050510] border-emerald-500/50 text-emerald-400 font-mono flex-1 text-xs sm:text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onCopy(sellerWallet)}
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Address copied to clipboard!
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Your Name</Label>
              <Input
                value={user?.name || ''}
                readOnly
                className="bg-[#050510] border-gray-700 text-white/70"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Your Wallet Address (Sender)</Label>
              <Input
                value={buyerWallet}
                onChange={(e) => setBuyerWallet(e.target.value)}
                placeholder="Enter your BTC wallet address"
                required
                className="bg-[#050510] border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {hasError && (
              <Alert className="border-red-500/50 bg-red-500/10 text-red-400">
                <AlertDescription>
                  Please enter a valid wallet address
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bitcoin className="w-5 h-5 mr-2" />
                  I Have Made The Payment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-cyan-500/10 py-6 text-center text-gray-500 text-sm mt-auto">
      <p>© {new Date().getFullYear()} Bitcoin Flash Systems. Encrypted & Secure.</p>
    </footer>
  )
}
