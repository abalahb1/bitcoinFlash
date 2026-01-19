'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User as UserIcon, Loader2, ArrowLeft, Save, Plus, Edit, Trash2,
  Mail, Phone, Wallet, Calendar, DollarSign, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Clock, Package as PackageIcon
} from 'lucide-react'
import Link from 'next/link'

type Payment = {
  id: string
  amount: number
  commission: number
  status: string
  created_at: string
  package: {
    name: string
  }
}

type Withdrawal = {
  id: string
  amount: number
  address: string
  status: string
  created_at: string
}

type Deposit = {
  id: string
  amount: number
  status: string
  confirmed_at: string | null
  created_at: string
}

type UserDetails = {
  id: string
  name: string
  email: string
  phone: string | null
  wallet_balance_usdt: number
  wallet_balance_btc: number
  usdt_trc20_address: string | null
  kyc_status: string
  is_verified: boolean
  commission_wallet: string | null
  createdAt: string
  payments: Payment[]
  withdrawalRequests: Withdrawal[]
  deposits: Deposit[]
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserDetails | null>(null)
  const [editedUser, setEditedUser] = useState<any>({})
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [packages, setPackages] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState({
    packageId: '',
    amount: '',
    commission: '',
    status: 'completed',
    transactionDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  })

  useEffect(() => {
    fetchUserDetails()
    fetchPackages()
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json()
      setUser(data)
      setEditedUser({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        wallet_balance_usdt: data.wallet_balance_usdt,
        wallet_balance_btc: data.wallet_balance_btc,
        usdt_trc20_address: data.usdt_trc20_address || '',
        commission_wallet: data.commission_wallet || '',
        is_verified: data.is_verified
      })
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages')
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (err) {
      console.error('Failed to fetch packages')
    }
  }

  const handleSaveUser = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: editedUser })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: 'User updated successfully', type: 'success' })
        fetchUserDetails()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to update user', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.packageId || !newTransaction.amount) {
      setMessage({ text: 'Please fill all required fields', type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...newTransaction
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: 'Transaction added successfully', type: 'success' })
        setShowAddTransaction(false)
        setNewTransaction({ 
          packageId: '', 
          amount: '', 
          commission: '', 
          status: 'completed',
          transactionDate: new Date().toISOString().split('T')[0]
        })
        fetchUserDetails()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to add transaction', type: 'error' })
    }
  }

  const handleDeleteTransaction = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const res = await fetch(`/api/admin/transactions?paymentId=${paymentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ text: 'Transaction deleted successfully', type: 'success' })
        fetchUserDetails()
      } else {
        setMessage({ text: 'Failed to delete transaction', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to delete transaction', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Card className="bg-[#1a1a2e] border-red-500/50">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
            <Link href="/admin/users">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-500">Back to Users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSpent = user.payments.reduce((sum, p) => sum + p.amount, 0)
  const totalCommission = user.payments.reduce((sum, p) => sum + p.commission, 0)
  const totalWithdrawn = user.withdrawalRequests
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0)
  const totalDeposited = user.deposits
    .filter(d => d.status === 'confirmed')
    .reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1f] to-[#050510]">
      <header className="border-b border-white/10 bg-[#0a0a1f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-gray-300">{user.email}</p>
            </div>
          </div>
          {user.is_verified && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 border ${
            message.type === 'success' 
              ? 'border-emerald-500/50 bg-emerald-500/10' 
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <AlertDescription className={message.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <TrendingUp className="w-4 h-4 text-emerald-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${user.wallet_balance_usdt.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Current Balance</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <TrendingUp className="w-4 h-4 text-blue-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Total Spent</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <DollarSign className="w-4 h-4 text-cyan-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${totalDeposited.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Total Deposited</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-5 h-5 text-orange-400" />
                <DollarSign className="w-4 h-4 text-orange-400/50" />
              </div>
              <p className="text-2xl font-bold text-white">${totalWithdrawn.toFixed(2)}</p>
              <p className="text-xs text-gray-300">Total Withdrawn</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-[#1a1a2e] border border-white/10 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300">Profile</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300">Transactions ({user.payments.length})</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300">Withdrawals ({user.withdrawalRequests.length})</TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300">Deposits ({user.deposits.length})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>User Information</span>
                  <Button onClick={handleSaveUser} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">Name</Label>
                    <Input
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">Email</Label>
                    <Input
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">Phone</Label>
                    <Input
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">USDT Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedUser.wallet_balance_usdt}
                      onChange={(e) => setEditedUser({...editedUser, wallet_balance_usdt: parseFloat(e.target.value)})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">USDT TRC20 Address</Label>
                    <Input
                      value={editedUser.usdt_trc20_address}
                      onChange={(e) => setEditedUser({...editedUser, usdt_trc20_address: e.target.value})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200 mb-2 block font-medium">Commission Wallet</Label>
                    <Input
                      value={editedUser.commission_wallet}
                      onChange={(e) => setEditedUser({...editedUser, commission_wallet: e.target.value})}
                      className="bg-[#0e0e24] border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={editedUser.is_verified}
                    onChange={(e) => setEditedUser({...editedUser, is_verified: e.target.checked})}
                    className="w-4 h-4 rounded border-white/20"
                  />
                  <Label htmlFor="verified" className="text-gray-200 font-medium">Verified User</Label>
                </div>

                <div className="pt-4 border-t border-white/10 text-sm text-gray-300">
                  <p>Account created: <span className="text-white font-medium">{new Date(user.createdAt).toLocaleString()}</span></p>
                  <p>KYC Status: <span className="text-white font-semibold">{user.kyc_status}</span></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Purchase History</span>
                  <Button onClick={() => setShowAddTransaction(!showAddTransaction)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddTransaction && (
                  <div className="mb-6 p-4 bg-[#0e0e24] rounded-lg border border-white/20 space-y-4">
                    <h3 className="text-white font-semibold text-lg">New Transaction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-200 mb-2 block font-medium">Package</Label>
                        <select
                          value={newTransaction.packageId}
                          onChange={(e) => setNewTransaction({...newTransaction, packageId: e.target.value})}
                          className="w-full h-10 px-3 bg-[#050510] border border-white/20 text-white rounded-md"
                        >
                          <option value="" className="bg-[#050510]">Select Package</option>
                          {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id} className="bg-[#050510]">{pkg.name} - ${pkg.price_usd}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-gray-200 mb-2 block font-medium">Amount (USD)</Label>
                        <Input
                          type="number"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                          className="bg-[#050510] border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-200 mb-2 block font-medium">Commission (USD)</Label>
                        <Input
                          type="number"
                          value={newTransaction.commission}
                          onChange={(e) => setNewTransaction({...newTransaction, commission: e.target.value})}
                          className="bg-[#050510] border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-200 mb-2 block font-medium">Transaction Date</Label>
                        <Input
                          type="date"
                          value={newTransaction.transactionDate}
                          onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                          className="bg-[#050510] border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-200 mb-2 block font-medium">Status</Label>
                        <select
                          value={newTransaction.status}
                          onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                          className="w-full h-10 px-3 bg-[#050510] border border-white/20 text-white rounded-md"
                        >
                          <option value="completed" className="bg-[#050510]">Completed</option>
                          <option value="pending" className="bg-[#050510]">Pending</option>
                          <option value="failed" className="bg-[#050510]">Failed</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleAddTransaction} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                      <Button onClick={() => setShowAddTransaction(false)} variant="outline" className="border-white/20 text-gray-200 hover:bg-white/10">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {user.payments.length === 0 ? (
                    <p className="text-gray-300 text-center py-8">No transactions yet</p>
                  ) : (
                    user.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-[#0e0e24] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <PackageIcon className="w-4 h-4 text-gray-300" />
                            <p className="text-white font-medium">{payment.package.name}</p>
                            <Badge variant="outline" className={`text-xs ${
                              payment.status === 'completed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                              payment.status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                              'border-red-500/50 text-red-300 bg-red-500/10'
                            }`}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-300">
                            <span>Amount: <span className="text-emerald-300 font-semibold">${payment.amount.toFixed(2)}</span></span>
                            <span>Commission: <span className="text-blue-300 font-semibold">${payment.commission.toFixed(2)}</span></span>
                            <span className="text-gray-400">{new Date(payment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteTransaction(payment.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.withdrawalRequests.length === 0 ? (
                    <p className="text-gray-300 text-center py-8">No withdrawals yet</p>
                  ) : (
                    user.withdrawalRequests.map((withdrawal) => (
                      <div key={withdrawal.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-emerald-300 font-bold text-lg">${withdrawal.amount.toFixed(2)}</p>
                          <Badge variant="outline" className={`text-xs ${
                            withdrawal.status === 'completed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                            withdrawal.status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                            'border-red-500/50 text-red-300 bg-red-500/10'
                          }`}>
                            {withdrawal.status}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm font-mono">{withdrawal.address}</p>
                        <p className="text-gray-400 text-xs mt-1">{new Date(withdrawal.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card className="bg-[#1a1a2e] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Deposit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.deposits.length === 0 ? (
                    <p className="text-gray-300 text-center py-8">No deposits yet</p>
                  ) : (
                    user.deposits.map((deposit) => (
                      <div key={deposit.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-emerald-300 font-bold text-lg">${deposit.amount.toFixed(2)}</p>
                          <Badge variant="outline" className={`text-xs ${
                            deposit.status === 'confirmed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                            'border-yellow-500/50 text-yellow-300 bg-yellow-500/10'
                          }`}>
                            {deposit.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {deposit.confirmed_at 
                            ? `Confirmed: ${new Date(deposit.confirmed_at).toLocaleString()}`
                            : `Created: ${new Date(deposit.created_at).toLocaleString()}`
                          }
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
