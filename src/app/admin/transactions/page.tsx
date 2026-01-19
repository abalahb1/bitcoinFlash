'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, Loader2, DollarSign, TrendingUp, Package as PackageIcon,
  Calendar, User, Filter, Download
} from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
  amount: number
  commission: number
  status: string
  buyer_wallet: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
  }
  package: {
    id: string
    name: string
    price_usd: number
  }
}

type Stats = {
  total: number
  totalAmount: number
  totalCommission: number
}

export default function AdminTransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, totalAmount: 0, totalCommission: 0 })
  const [filters, setFilters] = useState({
    status: 'all',
    userId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await fetch(`/api/admin/transactions-list?${params}`)
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch transactions')
      
      const data = await res.json()
      setTransactions(data.transactions)
      setStats(data.stats)
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    fetchTransactions()
  }

  const handleExport = () => {
    const csv = [
      ['Date', 'User', 'Email', 'Package', 'Amount', 'Commission', 'Status', 'Wallet'].join(','),
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleString(),
        t.user.name,
        t.user.email,
        t.package.name,
        t.amount,
        t.commission,
        t.status,
        t.buyer_wallet
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510]">
      <header className="border-b border-white/10 bg-[#0a0a1f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">All Transactions</h1>
              <p className="text-sm text-gray-300">View and manage all payment transactions</p>
            </div>
          </div>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <PackageIcon className="w-5 h-5 text-blue-400" />
                <TrendingUp className="w-4 h-4 text-blue-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-300">Total Transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <TrendingUp className="w-4 h-4 text-emerald-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Total Revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <DollarSign className="w-4 h-4 text-cyan-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalCommission.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Total Commissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1a1a2e] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-200 mb-2 block font-medium">Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full h-10 px-3 bg-[#0e0e24] border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-200 mb-2 block font-medium">Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="bg-[#0e0e24] border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-200 mb-2 block font-medium">End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="bg-[#0e0e24] border-white/20 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleApplyFilters} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No transactions found</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PackageIcon className="w-4 h-4 text-gray-300" />
                          <p className="text-white font-medium">{transaction.package.name}</p>
                          <Badge variant="outline" className={`text-xs ${
                            transaction.status === 'completed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                            transaction.status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                            'border-red-500/50 text-red-300 bg-red-500/10'
                          }`}>
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4" />
                            <span className="truncate">{transaction.user.name} ({transaction.user.email})</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(transaction.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-300">Amount: <span className="text-emerald-300 font-semibold">${transaction.amount.toFixed(2)}</span></span>
                          <span className="text-gray-300">Commission: <span className="text-blue-300 font-semibold">${transaction.commission.toFixed(2)}</span></span>
                        </div>

                        <div className="mt-2 text-xs text-gray-400 font-mono truncate">
                          Wallet: {transaction.buyer_wallet}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
