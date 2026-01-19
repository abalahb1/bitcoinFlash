'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, Copy, CheckCircle2, Bitcoin, Zap, Shield, Clock, User, LayoutDashboard, LogOut, Activity, BarChart2, History, ChevronRight, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { User as UserType, Package as PackageType } from '@prisma/client'
import { TopTicker, HeroMarketSlides } from '@/components/MarketTicker'
import { WalletEnhancements } from '@/components/WalletEnhancements'
import { AccountSettings } from '@/components/AccountSettings'
import { KYCBlockingModal } from '@/components/KYCBlockingModal'
import { WalletHistory } from '@/components/WalletHistory'
import { TierBadge } from '@/components/TierBadge'


type View = 'landing' | 'wallet' | 'payment' | 'account' | 'history'

// Extend UserType to include account_tier
type ExtendedUserType = UserType & { account_tier?: string }

export default function DashboardPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<View>('landing')
  const [user, setUser] = useState<ExtendedUserType | null>(null)
  const [packages, setPackages] = useState<PackageType[]>([])
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePayment = async () => {
    if (!selectedPackage) return

    setLoading(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        showMessage(data.message || 'Package purchased successfully! Commission added to your balance.', 'success')
        // Refresh user data to get updated balance
        const userRes = await fetch('/api/auth/me')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        // Go back to landing page
        setTimeout(() => setCurrentView('landing'), 2000)
      } else {
        if (data.error?.includes('Insufficient') || data.error?.includes('رصيد')) {
          const shortage = data.details?.shortage || 0
          showMessage(
            `Insufficient wallet balance. You need ${shortage.toFixed(2)} USDT more. Please top up your wallet first.`,
            'error'
          )
        } else if (data.error?.includes('Not authenticated')) {
          showMessage('Please login first', 'error')
          router.push('/login')
        } else {
          showMessage(data.error || 'Failed to purchase package', 'error')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      showMessage('Connection error. Please try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

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

        {/* Verification Banner */}
        {!user.is_verified && (
           <div className="relative z-50">
             <KYCBlockingModal status={user.kyc_status || 'none'} userId={user.id} isVerified={user.is_verified} />
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

          {currentView === 'landing' && <LandingView setCurrentView={setCurrentView} packages={packages} onSelectPackage={(pkg) => {
            setSelectedPackage(pkg)
            setCurrentView('payment')
          }} />}
          {currentView === 'wallet' && <WalletView user={user} />}
          {currentView === 'account' && <AccountView user={user} />}
          {currentView === 'history' && <HistoryView user={user} />}
          {currentView === 'payment' && selectedPackage && (
            <PaymentView
              pkg={selectedPackage}
              user={user}
              onSubmit={handlePayment}
              loading={loading}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

// ===== SUB-COMPONENTS =====

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

function Navbar({ currentView, setCurrentView, onLogout }: {
  currentView: View
  setCurrentView: (view: View) => void
  onLogout: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleMobileNav = (view: View) => {
    setCurrentView(view)
    setIsOpen(false)
  }

  const NavItems = ({ mobile = false }) => (
    <>
      <NavButton
        active={currentView === 'landing'}
        onClick={mobile ? () => handleMobileNav('landing') : () => setCurrentView('landing')}
        icon={<LayoutDashboard className="w-4 h-4" />}
        fullWidth={mobile}
      >
        Dashboard
      </NavButton>
      <NavButton
        active={currentView === 'wallet'}
        onClick={mobile ? () => handleMobileNav('wallet') : () => setCurrentView('wallet')}
        icon={<Wallet className="w-4 h-4" />}
        fullWidth={mobile}
      >
        Wallet
      </NavButton>
      <NavButton
        active={currentView === 'account'}
        onClick={mobile ? () => handleMobileNav('account') : () => setCurrentView('account')}
        icon={<User className="w-4 h-4" />}
        fullWidth={mobile}
      >
        Agent
      </NavButton>
      <NavButton
        active={currentView === 'history'}
        onClick={mobile ? () => handleMobileNav('history') : () => setCurrentView('history')}
        icon={<History className="w-4 h-4" />}
        fullWidth={mobile}
      >
        Log
      </NavButton>
    </>
  )

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a1f]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 text-2xl font-bold text-white hover:text-cyan-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-wider uppercase hidden md:inline">Bitcoin Flash</span>
            <span className="tracking-wider uppercase md:hidden">Flash</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavItems />
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a1f] border-white/10 w-[80%]">
                 <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-white flex items-center gap-2">
                       <Bitcoin className="w-6 h-6 text-[#F7931A]" />
                       Bitcoin Flash
                    </SheetTitle>
                 </SheetHeader>
                 <div className="flex flex-col gap-2">
                    <NavItems mobile />
                    <div className="h-px bg-white/10 my-2" />
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                 </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavButton({ active, onClick, children, icon, fullWidth = false }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      onClick={onClick}
      className={`${
        active
          ? 'bg-emerald-600 text-white shadow hover:bg-emerald-500'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      } ${fullWidth ? 'w-full justify-start text-lg h-12' : ''}`}
    >
      {icon}
      {children}
    </Button>
  )
}

function LandingView({ setCurrentView, packages, onSelectPackage }: { 
  setCurrentView: (view: View) => void
  packages: PackageType[]
  onSelectPackage: (pkg: PackageType) => void
}) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <HeroMarketSlides />

      <div className="text-center space-y-8 max-w-4xl mx-auto py-8">
        <Badge variant="outline" className="border-[#F7931A]/30 text-[#F7931A] px-4 py-1.5 rounded-full uppercase tracking-widest text-xs bg-[#F7931A]/5 backdrop-blur-sm">
           <Bitcoin className="w-3 h-3 mr-2 fill-[#F7931A]" />
           Bitcoin Flash Protocol V3
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
           Generate Non-Spendable <br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-yellow-500">Flash Bitcoin (BTC)</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
           Advanced simulation software generating Flash Bitcoin tokens supported by major wallets.
           <span className="block mt-2 text-white font-medium">
             Supports: Binance, Coinbase, MetaMask
           </span>
           <span className="text-sm text-gray-500 mt-1 block">(More exchanges coming soon)</span>
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 pt-4">
           <Button onClick={() => setCurrentView('account')} className="h-14 px-10 text-lg rounded-full bg-[#F7931A] text-black hover:bg-[#F7931A]/90 shadow-[0_0_40px_rgba(247,147,26,0.3)] transition-all hover:scale-105 font-bold">
              <Bitcoin className="mr-2 w-5 h-5 fill-black" /> Agent Dashboard
           </Button>
           <Button variant="outline" onClick={() => setCurrentView('wallet')} className="h-14 px-10 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm">
              View Wallet
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          {[
             { label: "Flash Nodes", value: "1,240+", icon: Activity },
             { label: "BTC Generated", value: "124K", icon: BarChart2 },
             { label: "Success Rate", value: "100%", icon: Zap },
             { label: "Traceability", value: "0%", icon: Shield }
          ].map((stat, i) => (
             <div key={i} className="text-center p-8 bg-[#0a0a1f]/50 hover:bg-white/5 transition-colors group">
                <stat.icon className="w-6 h-6 text-gray-500 mx-auto mb-4 group-hover:text-[#F7931A] transition-colors" />
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">{stat.label}</div>
             </div>
          ))}
      </div>

      {/* Packages Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Available Flash Limits</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Purchase a license to generate specific amounts of Flash Bitcoin. Payment is deducted from your wallet balance.
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

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    network: string
    error: string
  } | null>(null)
  
  // Deposit notification states
  const [depositAmount, setDepositAmount] = useState('')
  const [depositTxHash, setDepositTxHash] = useState('')
  const [notifying, setNotifying] = useState(false)
  const [depositMessage, setDepositMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Calculate total value
  const totalValueUSD = user.wallet_balance_usdt

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

    // Tron (TRX) validation: starts with T, 34 characters
    if (/^T[A-Za-z1-9]{33}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Tron (TRC20)'
    }
    // Bitcoin addresses
    else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Legacy/SegWit)'
      error = 'Only Tron (TRC20) addresses are accepted for USDT withdrawals.'
    } else if (/^bc1[a-z0-9]{39,59}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Native SegWit)'
      error = 'Only Tron (TRC20) addresses are accepted for USDT withdrawals.'
    }
    // Ethereum (ETH)
    else if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      network = 'Ethereum (ERC20)'
      error = 'Only Tron (TRC20) addresses are accepted for USDT withdrawals.'
    }
    // Solana
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress) && !trimmedAddress.startsWith('T')) {
      network = 'Solana'
      error = 'Only Tron (TRC20) addresses are accepted for USDT withdrawals.'
    }
    else {
      error = 'Invalid address format. Please enter a valid Tron (TRC20) address.'
    }

    setAddressValidation({ isValid, network, error })
  }

  const handleWithdrawAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWithdrawAddress(value)
    validateWithdrawAddress(value)
  }

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
          address: withdrawAddress
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
        setWithdrawMessage({ text: data.error || 'Failed to submit withdrawal request', type: 'error' })
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
      <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}</h1>
                  {user?.account_tier && <TierBadge tier={user.account_tier} size="md" />}
                </div>
                <p className="text-gray-400 mt-1">Manage your flash transactions and wallet</p>
              </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-4 py-2">
          <Activity className="w-3 h-3 mr-2" />
          Active
        </Badge>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-[#F7931A]/10 via-[#0e0e24] to-[#1a1a2e] border-[#F7931A]/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931A]/5 rounded-full blur-3xl"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Balance</p>
              <div className="text-5xl font-bold text-white mb-2">
                ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-emerald-400 text-sm flex items-center gap-1">
                <Activity className="w-3 h-3" />
                USDT
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#F7931A]/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-[#F7931A]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit / Withdraw Tabs */}
      <Card className="bg-[#0e0e24] border-white/10">
        <CardContent className="p-0">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'deposit'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Deposit
              </div>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'withdraw'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Withdraw
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'deposit' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Deposit USDT</h3>
                  <p className="text-gray-400 text-sm">Send USDT (TRC20) to your wallet address</p>
                </div>

                <Alert className="border-cyan-500/30 bg-cyan-500/5">
                  <AlertDescription className="text-sm text-gray-400">
                    <strong className="text-cyan-400">Important:</strong> Only send USDT on the Tron (TRC20) network to this address. Sending other assets or using different networks may result in permanent loss.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
                    {user.usdt_trc20_address ? (
                      <>
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <QRCodeSVG value={user.usdt_trc20_address} size={180} />
                        </div>
                        <p className="text-gray-400 text-xs mt-4 text-center">Scan QR code to deposit</p>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No deposit address set</p>
                        <p className="text-gray-600 text-xs mt-2">Configure your address below</p>
                      </div>
                    )}
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300 mb-2 block">Your Deposit Address (TRC20)</Label>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white font-mono text-sm break-all">
                          {user.usdt_trc20_address || 'No address set'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (user.usdt_trc20_address) {
                          navigator.clipboard.writeText(user.usdt_trc20_address)
                        }
                      }}
                      disabled={!user.usdt_trc20_address}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </Button>

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Network</span>
                        <span className="text-white font-medium">Tron (TRC20)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Min Deposit</span>
                        <span className="text-white font-medium">10 USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Confirmations</span>
                        <span className="text-white font-medium">19 blocks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit Notification Section */}
                <div className="mt-8 p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">Already Deposited?</h4>
                      <p className="text-gray-400 text-sm">
                        If you've already sent USDT to your address, notify admin to confirm your deposit.
                      </p>
                    </div>
                  </div>

                  {depositMessage && (
                    <Alert className={`mb-4 border ${
                      depositMessage.type === 'success' 
                        ? 'border-emerald-500/50 bg-emerald-500/10' 
                        : 'border-red-500/50 bg-red-500/10'
                    }`}>
                      <AlertDescription className={depositMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                        {depositMessage.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deposit-amount" className="text-gray-300 mb-2 block">
                        Amount Deposited (USDT)
                      </Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-[#1a1a2e] border-white/10 text-white h-12"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum: 10 USDT</p>
                    </div>

                    <div>
                      <Label htmlFor="deposit-tx" className="text-gray-300 mb-2 block">
                        Transaction Hash (Optional)
                      </Label>
                      <Input
                        id="deposit-tx"
                        value={depositTxHash}
                        onChange={(e) => setDepositTxHash(e.target.value)}
                        placeholder="Enter transaction hash if available"
                        className="bg-[#1a1a2e] border-white/10 text-white h-12"
                      />
                    </div>

                    <Button
                      onClick={async () => {
                        if (!depositAmount || parseFloat(depositAmount) < 10) {
                          setDepositMessage({ text: 'Please enter a valid amount (minimum 10 USDT)', type: 'error' })
                          return
                        }

                        setNotifying(true)
                        setDepositMessage(null)

                        try {
                          const res = await fetch('/api/wallet/notify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              amount: parseFloat(depositAmount),
                              tx_hash: depositTxHash || null
                            })
                          })

                          const data = await res.json()

                          if (res.ok) {
                            setDepositMessage({ text: data.message, type: 'success' })
                            setDepositAmount('')
                            setDepositTxHash('')
                          } else {
                            setDepositMessage({ text: data.error, type: 'error' })
                          }
                        } catch (error) {
                          setDepositMessage({ text: 'Connection error. Please try again.', type: 'error' })
                        } finally {
                          setNotifying(false)
                        }
                      }}
                      disabled={!depositAmount || parseFloat(depositAmount) < 10 || notifying}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {notifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                      {notifying ? 'Sending...' : 'Notify Admin'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Admin will review and confirm your deposit within 1-24 hours
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Withdraw USDT</h3>
                  <p className="text-gray-400 text-sm">Send USDT from your wallet to another address</p>
                </div>

                <Alert className="border-yellow-500/30 bg-yellow-500/5">
                  <AlertDescription className="text-sm text-gray-400">
                    <strong className="text-yellow-400">Notice:</strong> Withdrawals are processed manually by admin. Please allow 1-24 hours for processing.
                  </AlertDescription>
                </Alert>

                {withdrawMessage && (
                  <Alert className={`border ${
                    withdrawMessage.type === 'success' 
                      ? 'border-emerald-500/50 bg-emerald-500/10' 
                      : 'border-red-500/50 bg-red-500/10'
                  }`}>
                    <AlertDescription className={withdrawMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                      {withdrawMessage.text}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-gray-300 mb-2 block">
                      Amount (USDT)
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-[#1a1a2e] border-white/10 text-white h-12"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-500">Available: {user.wallet_balance_usdt.toFixed(2)} USDT</span>
                      <button
                        onClick={() => setWithdrawAmount(user.wallet_balance_usdt.toString())}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="withdraw-address" className="text-gray-300 mb-2 block">
                      Recipient Address (TRC20)
                    </Label>
                    <Input
                      id="withdraw-address"
                      value={withdrawAddress}
                      onChange={handleWithdrawAddressChange}
                      placeholder="T..."
                      className={`bg-[#1a1a2e] border-white/10 text-white h-12 ${
                        addressValidation?.isValid ? 'border-emerald-500/50' : 
                        addressValidation?.error ? 'border-red-500/50' : ''
                      }`}
                    />
                    
                    {/* Address Validation Feedback */}
                    {addressValidation && (
                      <div className={`mt-2 p-3 rounded-lg border ${
                        addressValidation.isValid 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        {addressValidation.isValid ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-emerald-400">Valid Address</div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                Network: <span className="text-white font-medium">{addressValidation.network}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-red-400">
                                {addressValidation.network !== 'Unknown' ? `${addressValidation.network} Detected` : 'Invalid Address'}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{addressValidation.error}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Withdrawal Amount</span>
                      <span className="text-white font-medium">{withdrawAmount || '0.00'} USDT</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white font-medium">~1 USDT</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-white font-semibold">You will receive</span>
                      <span className="text-emerald-400 font-bold">
                        {withdrawAmount ? (parseFloat(withdrawAmount) - 1).toFixed(2) : '0.00'} USDT
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdrawSubmit}
                    disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) < 10 || !addressValidation?.isValid || withdrawing}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    {withdrawing ? 'Processing...' : 'Request Withdrawal'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Minimum withdrawal: 10 USDT • Processing time: 1-24 hours
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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

  // Calculate stats
  const totalEarnings = localUser.commission_wallet ? localUser.wallet_balance_usdt * 0.1 : 0
  const isVerified = localUser.kyc_status === 'approved'

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Agent Profile</h2>
          <p className="text-gray-400 mt-1">Manage your account and verification</p>
        </div>
        <Badge 
          variant="outline" 
          className={`px-4 py-2 ${
            isVerified 
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
              : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
          }`}
        >
          <Shield className="w-3 h-3 mr-2" />
          {isVerified ? 'Verified Agent' : 'Pending Verification'}
        </Badge>
      </div>

      {/* Profile Card */}
      <Card className="bg-gradient-to-br from-[#0e0e24] via-[#1a1a2e] to-[#0e0e24] border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-cyan-900/20">
                {localUser.name.charAt(0).toUpperCase()}
              </div>
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#0e0e24]">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">{localUser.name}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm">
                    <User className="w-4 h-4 text-cyan-400" />
                    {localUser.email}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    REF: {localUser.wallet_ref}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
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
                  <th className="p-4">BTC Amount</th>
                  <th className="p-4">Commission (10%)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading records...</td></tr>
                ) : transactions.length === 0 ? (
                   <tr><td colSpan={7} className="p-8 text-center text-gray-500">No transactions found</td></tr>
                ) : (
                   transactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                       <td className="p-4 text-white font-medium">{tx.package}</td>
                       <td className="p-4 text-gray-400 font-mono text-xs">{tx.buyer_wallet}</td>
                       <td className="p-4 text-white">{tx.amount.toLocaleString()} USDT</td>
                       <td className="p-4 text-orange-400 font-bold">{tx.btc_amount || 'N/A'}</td>
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


function PaymentView({ pkg, user, onSubmit, loading }: {
  pkg: PackageType
  user: UserType | null
  onSubmit: () => void
  loading: boolean
}) {
  if (!user) return null

  const [recipientAddress, setRecipientAddress] = useState('')
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    network: string
    error: string
  } | null>(null)

  const hasEnoughBalance = user.wallet_balance_usdt >= pkg.price_usd
  const shortage = pkg.price_usd - user.wallet_balance_usdt
  const commission = pkg.price_usd * 0.1
  const finalBalance = user.wallet_balance_usdt - pkg.price_usd + commission

  // Wallet address validation algorithm
  const validateWalletAddress = (address: string) => {
    if (!address || address.trim() === '') {
      setAddressValidation(null)
      return
    }

    const trimmedAddress = address.trim()
    let isValid = false
    let network = 'Unknown'
    let error = ''
    let isBitcoin = false

    // Bitcoin (BTC) validation
    // Legacy (P2PKH): starts with 1, 26-35 characters
    // SegWit (P2SH): starts with 3, 26-35 characters  
    // Native SegWit (Bech32): starts with bc1, 42-62 characters
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Legacy/SegWit)'
      isBitcoin = true
      isValid = true
    } else if (/^bc1[a-z0-9]{39,59}$/.test(trimmedAddress)) {
      network = 'Bitcoin (Native SegWit)'
      isBitcoin = true
      isValid = true
    }
    // Ethereum (ETH) validation: starts with 0x, 42 characters total
    else if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      network = 'Ethereum (ERC20)'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    // Tron (TRX) validation: starts with T, 34 characters
    else if (/^T[A-Za-z1-9]{33}$/.test(trimmedAddress)) {
      network = 'Tron (TRC20)'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    // Solana (SOL) validation: base58, 32-44 characters
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress) && !trimmedAddress.startsWith('T') && !trimmedAddress.startsWith('1') && !trimmedAddress.startsWith('3')) {
      network = 'Solana'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    // Litecoin (LTC) validation: starts with L or M, 26-35 characters
    else if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(trimmedAddress)) {
      network = 'Litecoin'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    // Dogecoin (DOGE) validation: starts with D, 34 characters
    else if (/^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/.test(trimmedAddress)) {
      network = 'Dogecoin'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    // Ripple (XRP) validation: starts with r, 25-35 characters
    else if (/^r[0-9a-zA-Z]{24,34}$/.test(trimmedAddress)) {
      network = 'Ripple (XRP)'
      error = 'Only Bitcoin (BTC) addresses are accepted. Please use a Bitcoin wallet address.'
    }
    else {
      error = 'Invalid wallet address format. Please enter a valid Bitcoin (BTC) address.'
    }

    setAddressValidation({ isValid, network, error })
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRecipientAddress(value)
    validateWalletAddress(value)
  }

  const canPurchase = hasEnoughBalance && recipientAddress.trim() !== '' && addressValidation?.isValid

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => window.location.reload()}
          className="text-gray-400 hover:text-white -ml-4"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back
        </Button>
        <Badge variant="outline" className="border-white/20 text-gray-400">
          Checkout
        </Badge>
      </div>

      {/* Main Card */}
      <Card className="bg-gradient-to-br from-[#0e0e24] to-[#1a1a2e] border-white/10 overflow-hidden">
        {/* Package Header */}
        <div className="bg-gradient-to-r from-[#F7931A]/10 to-yellow-600/10 border-b border-white/5 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-wider mb-2">
                <Bitcoin className="w-4 h-4 text-[#F7931A]" />
                {pkg.name}
              </div>
              <div className="text-5xl font-bold text-white mb-1">
                {pkg.btc_amount} <span className="text-2xl text-gray-500 font-normal">BTC</span>
              </div>
              <p className="text-gray-400 text-sm">Flash Bitcoin License</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Price</div>
              <div className="text-3xl font-bold text-white">
                ${pkg.price_usd.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">USDT</div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Package Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">License Includes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Daily Capacity</div>
                  <div className="text-white font-semibold">{pkg.btc_amount} BTC</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-white font-semibold">{pkg.duration} Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Possible Transfers</div>
                  <div className="text-white font-semibold">{pkg.transfers}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Divisible</div>
                  <div className="text-white font-semibold text-sm">Yes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5"></div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment Summary</h3>
            
            {/* Current Balance */}
            <div className={`p-4 rounded-lg mb-4 border-2 ${hasEnoughBalance ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className={`w-5 h-5 ${hasEnoughBalance ? 'text-emerald-400' : 'text-red-400'}`} />
                  <div>
                    <div className="text-xs text-gray-500">Your Wallet Balance</div>
                    <div className="text-2xl font-bold text-white">
                      ${user.wallet_balance_usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <Badge className={hasEnoughBalance ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                  {hasEnoughBalance ? '✓ Sufficient' : '✗ Insufficient'}
                </Badge>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Package Price</span>
                <span className="text-white font-semibold">-${pkg.price_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2">
                  Commission (10%)
                  <span className="text-xs text-emerald-400">Instant Reward</span>
                </span>
                <span className="text-emerald-400 font-semibold">+${commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Recipient Wallet Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recipient Wallet Address</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient-address" className="text-gray-300 mb-2 block">
                  Enter wallet address to receive Flash Bitcoin
                </Label>
                <Input
                  id="recipient-address"
                  value={recipientAddress}
                  onChange={handleAddressChange}
                  placeholder="Enter your wallet address..."
                  className={`bg-[#0e0e24] border-white/10 text-white focus:border-cyan-500 h-12 ${
                    addressValidation?.isValid ? 'border-emerald-500/50' : 
                    addressValidation?.error ? 'border-red-500/50' : ''
                  }`}
                />
              </div>
              
              {/* Validation Feedback */}
              {addressValidation && (
                <div className={`p-3 rounded-lg border ${
                  addressValidation.isValid 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  {addressValidation.isValid ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-emerald-400">Valid Address</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Network: <span className="text-white font-medium">{addressValidation.network}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-red-400">Invalid Address</div>
                        <div className="text-xs text-gray-400 mt-0.5">{addressValidation.error}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {!hasEnoughBalance && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertDescription className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-red-400 mb-1">Insufficient Balance</div>
                  <div className="text-sm text-gray-400">
                    You need <strong className="text-white">${shortage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</strong> more to complete this purchase.
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    💡 Contact admin via Telegram to add funds to your wallet.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Purchase Button */}
          <Button 
            onClick={onSubmit}
            disabled={loading || !canPurchase}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : !hasEnoughBalance ? (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Insufficient Balance - Top Up Required
              </>
            ) : !recipientAddress.trim() ? (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Enter Recipient Address
              </>
            ) : !addressValidation?.isValid ? (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Invalid Wallet Address
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Confirm Purchase - ${pkg.price_usd.toLocaleString()} USDT
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secure transaction • Instant activation • 24/7 support</span>
          </div>
        </CardContent>
      </Card>
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
