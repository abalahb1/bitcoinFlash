'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TierBadge } from '@/components/TierBadge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users as UsersIcon, Loader2, Search, Edit, Trash2, CheckCircle2, 
  XCircle, ArrowLeft, DollarSign, Mail, Phone, Calendar, Plus
} from 'lucide-react'
import Link from 'next/link'

type User = {
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
  account_tier: 'bronze' | 'silver' | 'gold'
  createdAt: string
  updatedAt: string
  _count: {
    payments: number
    withdrawalRequests: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVerified, setFilterVerified] = useState<string>('all')
  const [filterKYC, setFilterKYC] = useState<string>('all')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    account_tier: 'bronze',
    wallet_balance_usdt: 0,
    is_verified: false
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      let url = '/api/admin/users?'
      if (searchTerm) url += `search=${searchTerm}&`
      if (filterVerified !== 'all') url += `verified=${filterVerified}&`
      if (filterKYC !== 'all') url += `kyc_status=${filterKYC}&`

      const res = await fetch(url)
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchUsers()
  }

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          updates: { is_verified: !currentStatus }
        })
      })

      if (res.ok) {
        setMessage({ text: 'User verification status updated', type: 'success' })
        fetchUsers()
      } else {
        setMessage({ text: 'Failed to update user', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to update user', type: 'error' })
    }
  }

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ text: 'User deleted successfully', type: 'success' })
        fetchUsers()
      } else {
        setMessage({ text: 'Failed to delete user', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to delete user', type: 'error' })
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage({ text: 'Name, email, and password are required', type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: 'User created successfully!', type: 'success' })
        setShowCreateModal(false)
        setNewUser({
          name: '',
          email: '',
          password: '',
          phone: '',
          account_tier: 'bronze',
          wallet_balance_usdt: 0,
          is_verified: false
        })
        fetchUsers()
      } else {
        setMessage({ text: data.error || 'Failed to create user', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to create user', type: 'error' })
    }
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">User Management</h1>
              <p className="text-sm text-gray-300">Manage all registered users</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
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

        {/* Filters */}
        <Card className="bg-[#1a1a2e] border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by email or name..."
                    className="bg-[#0e0e24] border-white/20 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <select
                  value={filterVerified}
                  onChange={(e) => { setFilterVerified(e.target.value); setLoading(true); fetchUsers(); }}
                  className="w-full h-10 px-3 bg-[#0e0e24] border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Users</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>
              <div>
                <select
                  value={filterKYC}
                  onChange={(e) => { setFilterKYC(e.target.value); setLoading(true); fetchUsers(); }}
                  className="w-full h-10 px-3 bg-[#0e0e24] border border-white/20 text-white rounded-md"
                >
                  <option value="all">All KYC Status</option>
                  <option value="none">No KYC</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-[#1a1a2e] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="p-4 bg-[#0e0e24] rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold truncate">{user.name}</h3>
                          <TierBadge tier={user.account_tier} size="sm" />
                          {user.is_verified && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${
                            user.kyc_status === 'approved' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                            user.kyc_status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                            user.kyc_status === 'rejected' ? 'border-red-500/50 text-red-300 bg-red-500/10' :
                            'border-gray-500/50 text-gray-300 bg-gray-500/10'
                          }`}>
                            KYC: {user.kyc_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="w-4 h-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-emerald-300 font-semibold">${user.wallet_balance_usdt.toFixed(2)} USDT</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                          <span>Payments: {user._count.payments}</span>
                          <span>Withdrawals: {user._count.withdrawalRequests}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => toggleVerification(user.id, user.is_verified)}
                          variant="outline"
                          className={user.is_verified 
                            ? 'border-red-500/50 text-red-300 hover:bg-red-500/10' 
                            : 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10'
                          }
                        >
                          {user.is_verified ? (
                            <><XCircle className="w-4 h-4 mr-1" /> Unverify</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-1" /> Verify</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteUser(user.id, user.name)}
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1a1a2e] border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Create New User</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Name *</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Full name"
                    className="bg-[#0e0e24] border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@example.com"
                    className="bg-[#0e0e24] border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Password *</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                    className="bg-[#0e0e24] border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Phone</Label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+1234567890"
                    className="bg-[#0e0e24] border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Account Tier</Label>
                  <select
                    value={newUser.account_tier}
                    onChange={(e) => setNewUser({...newUser, account_tier: e.target.value})}
                    className="w-full h-10 px-3 bg-[#0e0e24] border border-white/20 text-white rounded-md"
                  >
                    <option value="bronze">🥉 Bronze (5%)</option>
                    <option value="silver">🥈 Silver (7%)</option>
                    <option value="gold">🥇 Gold (10%)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-200 mb-2 block font-medium">Initial Balance (USDT)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newUser.wallet_balance_usdt}
                    onChange={(e) => setNewUser({...newUser, wallet_balance_usdt: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="bg-[#0e0e24] border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-verified"
                  checked={newUser.is_verified}
                  onChange={(e) => setNewUser({...newUser, is_verified: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20"
                />
                <Label htmlFor="create-verified" className="text-gray-200 font-medium">
                  Mark as Verified
                </Label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={handleCreateUser}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="border-white/20 text-gray-200 hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
