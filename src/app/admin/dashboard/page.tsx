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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your Bitcoin Flash platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/5 group-hover:border-blue-500/50',
    yellow: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5 group-hover:border-yellow-500/50',
    orange: 'border-orange-500/20 text-orange-400 bg-orange-500/5 group-hover:border-orange-500/50',
    green: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 group-hover:border-emerald-500/50'
  }

  return (
    <Card className={`border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden ${colorClasses[color]}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-50 transition-opacity" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1 tracking-wide uppercase">{title}</p>
            <p className="text-3xl font-black tracking-tight text-white mb-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}
