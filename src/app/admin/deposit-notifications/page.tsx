'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, Loader2, CheckCircle2, XCircle, Clock,
  ArrowLeft, AlertTriangle, User
} from 'lucide-react'
import Link from 'next/link'

type DepositNotification = {
  id: string
  amount: number
  tx_hash: string | null
  status: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
    wallet_balance_usdt: number
  }
}

export default function AdminDepositNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'all'>('pending')
  const [notifications, setNotifications] = useState<DepositNotification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<DepositNotification | null>(null)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/admin/deposit-notifications?status=${filter}`)
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedNotification) return

    setProcessing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/deposit-notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: selectedNotification.id,
          action,
          notes
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setSelectedNotification(null)
        setNotes('')
        fetchNotifications()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: 'Failed to process request', type: 'error' })
    } finally {
      setProcessing(false)
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Deposit Notifications</h1>
              <p className="text-xs text-gray-400">Review and confirm user deposits</p>
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

        {selectedNotification ? (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Process Deposit Notification</span>
                <Button variant="ghost" onClick={() => setSelectedNotification(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">User</p>
                  <p className="text-white font-medium">{selectedNotification.user.name}</p>
                  <p className="text-gray-400 text-xs">{selectedNotification.user.email}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Current Balance: ${selectedNotification.user.wallet_balance_usdt.toFixed(2)} USDT
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-emerald-400 font-bold text-2xl">${selectedNotification.amount.toFixed(2)} USDT</p>
                </div>
              </div>

              {selectedNotification.tx_hash && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Transaction Hash</p>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <code className="text-white font-mono text-sm break-all">{selectedNotification.tx_hash}</code>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-semibold text-sm">Review Carefully</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Verify the transaction details before approving. The user's balance will be credited immediately.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Admin Notes (Optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this deposit..."
                  className="bg-[#1a1a2e] border-white/10 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve & Credit Balance
                </Button>
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Deposit Notifications</CardTitle>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
                  <TabsList className="bg-[#1a1a2e]">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="confirmed" className="data-[state=active]:bg-emerald-600">
                      Confirmed
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">
                      All
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {filter === 'pending' ? 'No pending notifications' : 'No notifications found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <p className="text-white font-medium">{notification.user.name}</p>
                          <Badge variant="outline" className={`text-xs ${
                            notification.status === 'confirmed' ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10' :
                            notification.status === 'pending' ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10' :
                            'border-red-500/50 text-red-300 bg-red-500/10'
                          }`}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{notification.user.email}</p>
                        <p className="text-emerald-400 font-bold mt-1">${notification.amount.toFixed(2)} USDT</p>
                        {notification.tx_hash && (
                          <p className="text-gray-500 text-xs mt-1 font-mono truncate max-w-md">
                            TX: {notification.tx_hash}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {notification.status === 'pending' && (
                        <Button
                          onClick={() => setSelectedNotification(notification)}
                          className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process
                        </Button>
                      )}
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
