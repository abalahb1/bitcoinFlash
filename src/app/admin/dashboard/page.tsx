'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, DollarSign, FileCheck, Clock, TrendingUp, 
  Activity, AlertCircle, CheckCircle2, XCircle, Loader2,
  LayoutDashboard, UserCog, Shield, Wallet, Package, LogOut
} from 'lucide-react'
import Link from 'next/link'

type Stats = {
  totalUsers: number
  verifiedUsers: number
  pendingKYC: number
  totalTransactions: number
  completedTransactions: number
  pendingWithdrawals: number
  totalRevenue: number
}

type Transaction = {
  id: string
  amount: number
  status: string
  created_at: string
  user: { name: string; email: string }
  package: { name: string }
}

type User = {
  id: string
  name: string
  email: string
  is_verified: boolean
  kyc_status: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 403) {
        router.push('/login')
        return
      }
      
      if (!res.ok) throw new Error('Failed to fetch data')
      
      const data = await res.json()
      setStats(data.stats)
      setRecentTransactions(data.recentTransactions)
      setRecentUsers(data.recentUsers)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Card className="bg-[#0e0e24] border-red-500/50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a1f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Bitcoin Flash Control Panel</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/10 hover:border-white/30 text-gray-300">
              <Users className="w-5 h-5" />
              <span className="text-xs">Users</span>
            </Button>
          </Link>
          <Link href="/admin/kyc">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/10 hover:border-white/30 text-gray-300">
              <FileCheck className="w-5 h-5" />
              <span className="text-xs">KYC</span>
            </Button>
          </Link>
          <Link href="/admin/withdrawals">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/10 hover:border-white/30 text-gray-300">
              <Wallet className="w-5 h-5" />
              <span className="text-xs">Withdrawals</span>
            </Button>
          </Link>
          <Link href="/admin/deposits">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/10 hover:border-white/30 text-gray-300">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Deposits</span>
            </Button>
          </Link>
          <Link href="/admin/packages">
            <Button variant="outline" className="w-full h-20 flex-col gap-2 border-white/10 hover:border-white/30 text-gray-300">
              <Package className="w-5 h-5" />
              <span className="text-xs">Packages</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.verifiedUsers || 0} verified`}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Pending KYC"
            value={stats?.pendingKYC || 0}
            subtitle="Awaiting review"
            icon={FileCheck}
            color="yellow"
          />
          <StatsCard
            title="Pending Withdrawals"
            value={stats?.pendingWithdrawals || 0}
            subtitle="Requires action"
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`${stats?.completedTransactions || 0} transactions`}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{tx.user.name}</p>
                        <p className="text-gray-400 text-xs">{tx.package.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">${tx.amount.toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCog className="w-5 h-5 text-cyan-500" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users yet</p>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_verified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : user.kyc_status === 'pending' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, subtitle, icon: Icon, color }: {
  title: string
  value: string | number
  subtitle: string
  icon: any
  color: 'blue' | 'yellow' | 'orange' | 'green'
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-400',
    orange: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',
    green: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400'
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/10">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}
