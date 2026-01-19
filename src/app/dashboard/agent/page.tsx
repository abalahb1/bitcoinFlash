'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Award, TrendingUp, DollarSign, Users, ArrowLeft,
  Briefcase, CheckCircle2, Gift, Zap, Shield
} from 'lucide-react'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { getTierConfig } from '@/lib/tiers'

type UserType = {
  id: string
  name: string
  email: string
  account_tier: string
  commission_wallet: string | null
  wallet_balance_usdt: number
}

export default function AgentPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [commissionStats, setCommissionStats] = useState({
    totalEarned: 0,
    thisMonth: 0,
    totalTransactions: 0
  })

  useEffect(() => {
    fetchUserData()
    fetchCommissionStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchCommissionStats = async () => {
    try {
      const res = await fetch('/api/transactions')
      if (res.ok) {
        const transactions = await res.json()
        const completed = transactions.filter((t: any) => t.status === 'completed')
        
        const totalEarned = completed.reduce((sum: number, t: any) => sum + (t.commission || 0), 0)
        
        const now = new Date()
        const thisMonthTransactions = completed.filter((t: any) => {
          const tDate = new Date(t.created_at)
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
        })
        const thisMonth = thisMonthTransactions.reduce((sum: number, t: any) => sum + (t.commission || 0), 0)

        setCommissionStats({
          totalEarned,
          thisMonth,
          totalTransactions: completed.length
        })
      }
    } catch (error) {
      console.error('Failed to fetch commission stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const tierConfig = getTierConfig(user.account_tier)
  const allTiers = ['bronze', 'silver', 'gold'].map(t => getTierConfig(t))
  const currentTierIndex = allTiers.findIndex(t => t.tier === user.account_tier)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a1f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Agent Program</h1>
              <p className="text-xs text-gray-400">Earn commissions on every sale</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Current Tier Card */}
        <Card className="bg-gradient-to-br from-[#0e0e24] to-[#1a1a2e] border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl mb-2">Your Agent Status</CardTitle>
                <div className="flex items-center gap-3">
                  <TierBadge tier={user.account_tier} size="lg" />
                  <div>
                    <p className="text-2xl font-bold text-white">{tierConfig.name} Member</p>
                    <p className="text-yellow-400 font-semibold">{(tierConfig.commissionRate * 100).toFixed(0)}% Commission Rate</p>
                  </div>
                </div>
              </div>
              <Award className="w-16 h-16 text-yellow-400 opacity-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  Total Earned
                </div>
                <p className="text-2xl font-bold text-emerald-400">${commissionStats.totalEarned.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  This Month
                </div>
                <p className="text-2xl font-bold text-blue-400">${commissionStats.thisMonth.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Total Sales
                </div>
                <p className="text-2xl font-bold text-purple-400">{commissionStats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-[#0e0e24] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              Your {tierConfig.name} Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tierConfig.features.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Comparison */}
        <Card className="bg-[#0e0e24] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Membership Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allTiers.map((tier, index) => (
                <div
                  key={tier.tier}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    tier.tier === user.account_tier
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-center mb-4">
                    <TierBadge tier={tier.tier} size="lg" />
                    <h3 className="text-xl font-bold text-white mt-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-yellow-400 mt-2">
                      {(tier.commissionRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-gray-400 text-sm">Commission Rate</p>
                  </div>
                  
                  {tier.tier === user.account_tier && (
                    <Badge className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-3">
                      <Shield className="w-3 h-3 mr-1" />
                      Current Tier
                    </Badge>
                  )}

                  <div className="space-y-2 text-sm">
                    {tier.features.slice(0, 3).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commission Wallet */}
        {!user.commission_wallet && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertDescription className="text-yellow-400">
              <strong>Action Required:</strong> Set up your commission wallet in Account Settings to receive your earnings.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
