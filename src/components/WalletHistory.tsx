'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown, Clock } from 'lucide-react'

type Withdrawal = {
  id: string
  amount: number
  address: string
  status: string
  created_at: string
  processed_at: string | null
  rejection_reason: string | null
}

type Deposit = {
  id: string
  amount: number
  status: string
  created_at: string
  confirmed_at: string | null
  tx_hash: string | null
}

export function WalletHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const [withdrawalsRes, depositsRes] = await Promise.all([
        fetch('/api/wallet/withdrawals'),
        fetch('/api/wallet/deposits')
      ])

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json()
        setWithdrawals(data)
      }

      if (depositsRes.ok) {
        const data = await depositsRes.json()
        setDeposits(data)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Withdrawals */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No withdrawals yet</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-orange-400" />
                      <span className="text-white font-semibold">${withdrawal.amount.toFixed(2)}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      withdrawal.status === 'completed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                      withdrawal.status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                      'border-red-500/50 text-red-300 bg-red-500/10'
                    }`}>
                      {withdrawal.status}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm font-mono truncate">{withdrawal.address}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(withdrawal.created_at).toLocaleString()}</span>
                  </div>
                  {withdrawal.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
                      Reason: {withdrawal.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposits */}
      <Card className="bg-[#1a1a2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Deposit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No deposits yet</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-semibold">${deposit.amount.toFixed(2)}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      deposit.status === 'confirmed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                      'border-yellow-500/50 text-yellow-300 bg-yellow-500/10'
                    }`}>
                      {deposit.status}
                    </Badge>
                  </div>
                  {deposit.tx_hash && (
                    <p className="text-gray-300 text-sm font-mono truncate">TX: {deposit.tx_hash}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {deposit.confirmed_at 
                        ? `Confirmed: ${new Date(deposit.confirmed_at).toLocaleString()}`
                        : `Created: ${new Date(deposit.created_at).toLocaleString()}`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
