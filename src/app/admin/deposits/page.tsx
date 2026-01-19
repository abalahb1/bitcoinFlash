'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, Loader2, Plus, ArrowLeft, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

type User = {
  id: string
  name: string
  email: string
  wallet_balance_usdt: number
}

export default function AdminDepositsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [searchEmail, setSearchEmail] = useState('')

  const searchUser = async () => {
    if (!searchEmail) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${searchEmail}`)
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to search users')
      const data = await res.json()
      setUsers(data)
      if (data.length === 1) {
        setSelectedUser(data[0])
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDeposit = async () => {
    if (!selectedUser || !amount) return

    setProcessing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(amount),
          txHash,
          notes
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setAmount('')
        setTxHash('')
        setNotes('')
        setSelectedUser(null)
        setSearchEmail('')
        setUsers([])
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to confirm deposit', type: 'error' })
    } finally {
      setProcessing(false)
    }
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Manual Deposit</h1>
              <p className="text-xs text-gray-400">Confirm deposits to user wallets</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
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

        <Card className="bg-[#0e0e24] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Confirm Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Search User */}
            <div>
              <Label className="text-gray-300 mb-2 block">Search User by Email</Label>
              <div className="flex gap-2">
                <Input
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="bg-[#1a1a2e] border-white/10 text-white flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                />
                <Button onClick={searchUser} disabled={loading || !searchEmail}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </div>

            {/* User Selection */}
            {users.length > 1 && (
              <div>
                <Label className="text-gray-300 mb-2 block">Select User</Label>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Current Balance: ${user.wallet_balance_usdt.toFixed(2)} USDT
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected User Info */}
            {selectedUser && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-400 font-semibold mb-2">Selected User</p>
                <p className="text-white font-medium">{selectedUser.name}</p>
                <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                <p className="text-gray-300 text-sm mt-2">
                  Current Balance: <span className="text-emerald-400 font-bold">${selectedUser.wallet_balance_usdt.toFixed(2)} USDT</span>
                </p>
              </div>
            )}

            {/* Deposit Details */}
            {selectedUser && (
              <>
                <div>
                  <Label htmlFor="amount" className="text-gray-300 mb-2 block">Deposit Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-[#1a1a2e] border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="txHash" className="text-gray-300 mb-2 block">Transaction Hash (Optional)</Label>
                  <Input
                    id="txHash"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="bg-[#1a1a2e] border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-300 mb-2 block">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                    className="bg-[#1a1a2e] border-white/10 text-white"
                  />
                </div>

                {amount && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">Summary</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Balance:</span>
                        <span className="text-white">${selectedUser.wallet_balance_usdt.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Deposit Amount:</span>
                        <span className="text-emerald-400 font-bold">+${parseFloat(amount || '0').toFixed(2)} USDT</span>
                      </div>
                      <div className="h-px bg-white/10 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">New Balance:</span>
                        <span className="text-emerald-400 font-bold text-lg">
                          ${(selectedUser.wallet_balance_usdt + parseFloat(amount || '0')).toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleConfirmDeposit}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Confirm Deposit
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
