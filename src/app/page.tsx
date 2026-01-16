'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, Copy, CheckCircle2, Bitcoin, Zap, Shield, Clock, ArrowRight, User, LayoutDashboard, Package, LogOut, ChevronRight, Terminal, Activity, BarChart2, History, Trash2 } from 'lucide-react'
import type { User as UserType, Package as PackageType, Payment } from '@prisma/client'
import { TopTicker, HeroMarketSlides } from '@/components/MarketTicker'
import { WalletEnhancements } from '@/components/WalletEnhancements'
import { AccountSettings } from '@/components/AccountSettings'
import { KYCBlockingModal } from '@/components/KYCBlockingModal'

type View = 'auth' | 'landing' | 'packages' | 'wallet' | 'payment' | 'account' | 'history'

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
      <div className="min-h-screen flex flex-col bg-[#050510] relative overflow-hidden">
        {/* Professional Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] to-[#0a0a1f] z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Market Ticker */}
        <div className="h-10">
           <TopTicker />
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col pt-10">
          <HeroMarketSlides />
          
          <div className="flex-1 flex items-center justify-center p-4">
            <AuthView
                onLogin={handleLogin}
                loading={loading}
                message={message}
            />
          </div>
        </div>
      </div>
    )
  }

  // ===== MAIN APP WITH NAVBAR =====
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] to-[#0a0a1f] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light pointer-events-none" />
      
      <div className="relative z-10">
        <TopTicker />
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogout={handleLogout}
        />

        {/* KYC Lock */}
        {user && user.kyc_status !== 'approved' && (
           <div className="relative z-50">
             <KYCBlockingModal status={user.kyc_status as any} userId={user.id} />
           </div>
        )}

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
          {currentView === 'account' && <AccountView user={user} />}
          {currentView === 'history' && <HistoryView user={user} />}
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
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a1f]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 text-2xl font-bold text-white hover:text-cyan-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-wider uppercase">BitcoinFlash</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <NavButton
              active={currentView === 'landing'}
              onClick={() => setCurrentView('landing')}
              icon={<LayoutDashboard className="w-4 h-4" />}
            >
              Dashboard
            </NavButton>
            <NavButton
              active={currentView === 'packages'}
              onClick={() => setCurrentView('packages')}
              icon={<Zap className="w-4 h-4" />}
            >
              Flash Limits
            </NavButton>
            <NavButton
              active={currentView === 'wallet'}
              onClick={() => setCurrentView('wallet')}
              icon={<Wallet className="w-4 h-4" />}
            >
              Wallet
            </NavButton>
            <NavButton
              active={currentView === 'account'}
              onClick={() => setCurrentView('account')}
              icon={<User className="w-4 h-4" />}
            >
              Agent
            </NavButton>
            <NavButton
              active={currentView === 'history'}
              onClick={() => setCurrentView('history')}
              icon={<History className="w-4 h-4" />}
            >
              Log
            </NavButton>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
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
          ? 'bg-emerald-600 text-white shadow hover:bg-emerald-500'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
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
    <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl shadow-lg shadow-orange-500/20">
            <Bitcoin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            BitcoinFlash
          </h1>
          <p className="text-gray-400">
            Advanced Transaction Simulation Protocol
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

          <Card className="bg-[#0e0e24]/80 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                Auth Gateway
              </CardTitle>
              <CardDescription className="text-gray-400">
                authorized_agents_only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-300">Agent ID / Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="agent@flash-core.io"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white focus:border-emerald-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">Access Key</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white focus:border-emerald-500 h-12"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-lg shadow-lg shadow-emerald-500/20 transition-all font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Initialize Session
                </Button>
              </form>
            </CardContent>
          </Card>
    </div>
  )
}

function LandingView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <HeroMarketSlides />

      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto py-8">
        <Badge variant="outline" className="border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full uppercase tracking-widest text-xs bg-orange-500/5 backdrop-blur-sm">
           <Bitcoin className="w-3 h-3 mr-2 fill-orange-400" />
           BitcoinFlash Protocol V3
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
           Generate Non-Spendable <br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">USDT Flash Tokens</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
           Advanced simulation software for institutional testing. 
           Tokens appear on-chain with full confirmation validity for limited duration.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 pt-4">
           <Button onClick={() => setCurrentView('packages')} className="h-14 px-10 text-lg rounded-full bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all hover:scale-105 font-bold">
              <Bitcoin className="mr-2 w-5 h-5 fill-black" /> Get Flash Limit
           </Button>
           <Button variant="outline" onClick={() => setCurrentView('account')} className="h-14 px-10 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm">
              Agent Dashboard
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          {[
             { label: "Flash Nodes", value: "1,240+", icon: Activity },
             { label: "BTC Generated", value: "124K", icon: BarChart2 },
             { label: "Success Rate", value: "100%", icon: Zap },
             { label: "Traceability", value: "0%", icon: Shield }
          ].map((stat, i) => (
             <div key={i} className="text-center p-8 bg-[#0a0a1f]/50 hover:bg-white/5 transition-colors group">
                <stat.icon className="w-6 h-6 text-gray-500 mx-auto mb-4 group-hover:text-orange-400 transition-colors" />
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">{stat.label}</div>
             </div>
          ))}
      </div>

      {/* Packages Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RateCard tier="Basic Flash" price="230" sub="BTC" />
        <RateCard tier="Standard Flash" price="100" sub="BTC" />
        <RateCard tier="Pro Flash" price="570" sub="BTC" />
        <RateCard tier="Whale Flash" price="200" sub="BTC" />
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
        <h2 className="text-4xl font-bold text-white">Select Flash Limit</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Purchase a license to generate specific amounts of Flash USDT daily.
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
  return (
    <Card className="bg-[#0e0e24] border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader>
        <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
           <Bitcoin className="w-4 h-4 text-orange-500" /> {pkg.name} License
        </div>
        <div className="text-4xl font-bold text-white flex items-baseline gap-1">
           {pkg.btc_amount} <span className="text-lg text-gray-500 font-normal">BTC</span>
        </div>
        <div className="text-emerald-400 font-semibold mt-1">
            Price: ${pkg.price_usd.toLocaleString()} USDT
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1">
        <div className="space-y-3 pt-4 border-t border-white/5">
           <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Flash Capacity</span>
              <span className="text-white font-medium">{pkg.btc_amount} BTC/day</span>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">License Duration</span>
              <span className="text-white font-medium">{pkg.duration} Days</span>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Daily Injections</span>
              <span className="text-white font-medium">{pkg.transfers}</span>
           </div>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <CheckCircle2 className="w-4 h-4 text-orange-500" />
               <span>Bitcoin Core Support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <CheckCircle2 className="w-4 h-4 text-orange-500" />
               <span>Full Blockchain Confirmation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
               <CheckCircle2 className="w-4 h-4 text-orange-500" />
               <span>Instant Wallet Credit</span>
            </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full bg-white/5 hover:bg-emerald-600 text-white border border-white/10 hover:border-emerald-500/50 transition-all h-12"
          onClick={onSelect}
        >
          Purchase License
        </Button>
      </CardFooter>
    </Card>
  )
}

function WalletView({ user }: { user: UserType | null }) {
  if (!user) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-bold text-white">Wallet Overview</h2>
         <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
            Network Status: Active
         </Badge>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0e0e24] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4" /> USDT Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {user.wallet_balance_usdt.toFixed(2)} <span className="text-gray-500 text-2xl font-normal">USDT</span>
            </div>
            <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
               <Activity className="w-3 h-3" /> TRC20 Network
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e0e24] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <Bitcoin className="w-4 h-4" /> BTC Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {user.wallet_balance_btc.toFixed(6)} <span className="text-gray-500 text-2xl font-normal">BTC</span>
            </div>
             <p className="text-orange-400 text-xs mt-2 flex items-center gap-1">
               <Activity className="w-3 h-3" /> Bitcoin Network
            </p>
          </CardContent>
        </Card>
      </div>

      <WalletEnhancements 
        user={user} 
        onUpdate={() => {}} 
      />
    </div>
  )
}

function AccountView({ user }: { user: UserType | null }) {
  const [localUser, setLocalUser] = useState<UserType | null>(user)

  const refreshUser = () => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setLocalUser(data.user)
        }
      })
  }

  if (!localUser) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Agent Profile</h2>
          <p className="text-gray-400 mt-1">Manage verification and settings</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-[#0e0e24] to-[#1a1a2e] border-white/10">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-emerald-900/20">
            {localUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h3 className="text-3xl font-bold text-white">{localUser.name}</h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-300">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"><User className="w-4 h-4 text-emerald-400" /> {localUser.email}</span>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"><Shield className="w-4 h-4 text-emerald-400" /> Ref: {localUser.wallet_ref}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AccountSettings 
        user={localUser as any} 
        onUpdate={refreshUser} 
      />
    </div>
  )
}

function HistoryView({ user }: { user: UserType | null }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (!user) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-bold text-white">Transactions Log</h2>
         <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
            Verified Ledger
         </Badge>
      </div>

      <Card className="bg-[#0e0e24] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-medium text-sm">
                <tr>
                  <th className="p-4">Package</th>
                  <th className="p-4">Buyer Address</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Commission (10%)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading records...</td></tr>
                ) : transactions.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-gray-500">No transactions found</td></tr>
                ) : (
                   transactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                       <td className="p-4 text-white font-medium">{tx.package}</td>
                       <td className="p-4 text-gray-400 font-mono text-xs">{tx.buyer_wallet}</td>
                       <td className="p-4 text-white">{tx.amount.toLocaleString()} USDT</td>
                       <td className="p-4 text-emerald-400 font-bold">+{tx.commission.toLocaleString()} USDT</td>
                       <td className="p-4">
                         <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-xs">
                           {tx.status}
                         </Badge>
                       </td>
                       <td className="p-4 text-gray-500 text-sm">
                         {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                       </td>
                     </tr>
                   ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
  const [buyerWallet, setBuyerWallet] = useState(user?.usdt_trc20_address || '')

  const handleSubmit = () => {
    onSubmit(buyerWallet)
  }

  if (paymentTimer > 0) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4 animate-pulse">
             <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Pending</h2>
          <p className="text-gray-400">Please wait while we verify your transaction</p>
        </div>

        <Card className="bg-[#0e0e24] border-yellow-500/20">
          <CardContent className="p-8 text-center">
             <div className="text-5xl font-mono text-yellow-500 font-bold mb-2">
                {formatTime(paymentTimer)}
             </div>
             <p className="text-sm text-gray-500">Estimated time verification</p>
          </CardContent>
        </Card>
        
        <div className="text-center">
           <Button variant="outline" onClick={() => window.location.reload()} className="border-white/10 hover:bg-white/5">
             Refresh Status
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Button 
        variant="ghost" 
        onClick={() => window.location.reload()}
        className="text-gray-400 hover:text-white pl-0"
      >
        <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Packages
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div>
               <h2 className="text-3xl font-bold text-white mb-2">Payment Details</h2>
               <p className="text-gray-400">Complete your transaction securely.</p>
            </div>
            
            <Card className="bg-[#0e0e24] border-white/10">
               <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Package Tier</span>
                     <span className="text-white font-medium">{pkg.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Total Amount</span>
                     <span className="text-xl font-bold text-white">{pkg.usdt_amount} USDT</span>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="bg-[#0e0e24] border-white/10">
               <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-widest">Send Payment To</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5 break-all font-mono text-xs text-center text-gray-300">
                     {sellerWallet}
                  </div>
                  <Button 
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10"
                    onClick={() => onCopy(sellerWallet)}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy Address'}
                  </Button>
               </CardContent>
            </Card>

            <div className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="buyer-wallet" className="text-gray-300">Your Wallet Address (TRC20)</Label>
                  <Input
                    id="buyer-wallet"
                    value={buyerWallet}
                    onChange={(e) => setBuyerWallet(e.target.value)}
                    placeholder="T..."
                    className="bg-[#0e0e24] border-white/10 text-white focus:border-cyan-500"
                  />
               </div>
               
               <Button 
                 onClick={() => onSubmit(buyerWallet)} 
                 disabled={loading || !buyerWallet}
                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-lg shadow-lg shadow-emerald-900/20"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm License Purchase'}
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a1f]/80 backdrop-blur-md mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-white">BitcoinFlash</span>
            <span className="text-xs">© 2024</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
             <a href="#" className="hover:text-orange-400 transition-colors">Terms of Use</a>
             <a href="#" className="hover:text-orange-400 transition-colors">Privacy</a>
             <a href="#" className="hover:text-orange-400 transition-colors">Flash Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
