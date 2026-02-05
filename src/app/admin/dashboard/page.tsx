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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
            <Shield className="w-3 h-3" />
            ADMIN_CONSOLE_V1
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-gray-400 mt-1">Monitor platform metrics and user activity.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM_ONLINE
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.verifiedUsers || 0} VERIFIED`}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Pending KYC"
            value={stats?.pendingKYC || 0}
            subtitle="ACTION_REQUIRED"
            icon={FileCheck}
            color="yellow"
          />
          <StatsCard
            title="Pending Withdrawals"
            value={stats?.pendingWithdrawals || 0}
            subtitle="AWAITING_APPROVAL"
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            subtitle={`${stats?.completedTransactions || 0} TRANSACTIONS`}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Live Transactions
              </h3>
              <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
                LATEST_ENTRIES
              </Badge>
            </div>
            <div className="p-4 space-y-2">
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 font-mono text-xs">NO_DATA_AVAILABLE</p>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-[#050505] hover:bg-white/5 transition-colors rounded-lg border border-white/5 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-mono text-xs font-bold">{tx.user.name}</p>
                          <span className="text-[10px] text-gray-500 font-mono">ID:{tx.id.substring(0,6)}</span>
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">{tx.package.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-mono font-bold text-sm">${tx.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-1.5 py-0 rounded-sm mt-1 uppercase">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <UserCog className="w-4 h-4 text-cyan-500" />
                New Registrations
              </h3>
              <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
                USER_LOG
              </Badge>
            </div>
            <div className="p-4 space-y-2">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 font-mono text-xs">NO_USERS_FOUND</p>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-[#050505] hover:bg-white/5 transition-colors rounded-lg border border-white/5 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center text-xs font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-mono text-xs font-bold">{user.name}</p>
                            <p className="text-gray-500 text-[10px]">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_verified ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">VERIFIED</Badge>
                        ) : user.kyc_status === 'pending' ? (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">REVIEW</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 text-[10px]">UNVERIFIED</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
            </div>
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
    blue: 'border-blue-500/20 text-blue-400 bg-blue-500/5 group-hover:border-blue-500/50',
    yellow: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5 group-hover:border-yellow-500/50',
    orange: 'border-orange-500/20 text-orange-400 bg-orange-500/5 group-hover:border-orange-500/50',
    green: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 group-hover:border-emerald-500/50'
  }

  return (
    <Card className={`border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden bg-[#0c0c0e] ${colorClasses[color]}`}>
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-0 transition-opacity" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-500 text-[10px] font-mono font-bold mb-1 tracking-widest uppercase">{title}</p>
            <p className="text-3xl font-mono font-bold tracking-tight text-white mb-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-black/20 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <p className="text-[10px] font-mono uppercase tracking-wider opacity-80">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}