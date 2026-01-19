'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Wallet, Loader2, CheckCircle2, XCircle, Clock,
  ArrowLeft, Copy, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

type Withdrawal = {
  id: string
  amount: number
  address: string
  network: string
  status: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
    wallet_balance_usdt: number
  }
}

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals?status=pending')
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch withdrawals')
      const data = await res.json()
      setWithdrawals(data)
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawal) return

    setProcessing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          action,
          notes,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setSelectedWithdrawal(null)
        setNotes('')
        setRejectionReason('')
        fetchWithdrawals()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to process request', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setMessage({ text: 'Address copied to clipboard', type: 'success' })
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Withdrawal Management</h1>
              <p className="text-xs text-gray-400">Process withdrawal requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 border ${
            message.type === 'success' 
              ? 'border-emerald-500/50 bg-emerald-500/10' 
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <AlertDescription className={message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {selectedWithdrawal ? (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Process Withdrawal Request</span>
                <Button variant="ghost" onClick={() => setSelectedWithdrawal(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">User</p>
                  <p className="text-white font-medium">{selectedWithdrawal.user.name}</p>
                  <p className="text-gray-400 text-xs">{selectedWithdrawal.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-emerald-400 font-bold text-2xl">${selectedWithdrawal.amount.toFixed(2)} USDT</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Withdrawal Address ({selectedWithdrawal.network})</p>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <code className="text-white font-mono text-sm flex-1 break-all">{selectedWithdrawal.address}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyAddress(selectedWithdrawal.address)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm">Important</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Please verify the address and amount before approving. Once approved, the transaction cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Admin Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this withdrawal..."
                  className="bg-[#1a1a2e] border-white/10 text-white"
                  rows={3}
                />
              </div>

              {rejectionReason && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Rejection Reason</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this withdrawal is being rejected..."
                    className="bg-[#1a1a2e] border-white/10 text-white"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve & Send
                </Button>
                <Button
                  onClick={() => {
                    if (!rejectionReason) {
                      setRejectionReason(' ')
                    } else {
                      handleAction('reject')
                    }
                  }}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reject & Refund
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Pending Withdrawals ({withdrawals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No pending withdrawal requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex-1">
                        <p className="text-white font-medium">{withdrawal.user.name}</p>
                        <p className="text-gray-400 text-sm">{withdrawal.user.email}</p>
                        <p className="text-emerald-400 font-bold mt-1">${withdrawal.amount.toFixed(2)} USDT</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Requested: {new Date(withdrawal.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        className="bg-orange-600 hover:bg-orange-500 text-white"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Process
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
