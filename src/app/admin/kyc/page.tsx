'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileCheck, Loader2, CheckCircle2, XCircle, Clock,
  Eye, Shield, ArrowLeft, Download
} from 'lucide-react'
import Link from 'next/link'

type KYCUser = {
  id: string
  name: string
  email: string
  phone: string | null
  kyc_passport_url: string | null
  kyc_selfie_url: string | null
  kyc_status: string
  is_verified: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminKYCPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<KYCUser[]>([])
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchKYCRequests()
  }, [])

  const fetchKYCRequests = async () => {
    try {
      const res = await fetch('/api/admin/kyc?status=pending')
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch KYC requests')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setSelectedUser(null)
        fetchKYCRequests()
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
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">KYC Management</h1>
              <p className="text-xs text-gray-400">Review and approve identity verifications</p>
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

        {selectedUser ? (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Review KYC Documents</span>
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Name</p>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white font-medium mb-3">Passport/ID Document</p>
                  {selectedUser.kyc_passport_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
                      <img 
                        src={selectedUser.kyc_passport_url} 
                        alt="Passport" 
                        className="w-full h-full object-cover"
                      />
                      <a 
                        href={selectedUser.kyc_passport_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>

                <div>
                  <p className="text-white font-medium mb-3">Selfie Photo</p>
                  {selectedUser.kyc_selfie_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
                      <img 
                        src={selectedUser.kyc_selfie_url} 
                        alt="Selfie" 
                        className="w-full h-full object-cover"
                      />
                      <a 
                        href={selectedUser.kyc_selfie_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg hover:bg-black/70"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No photo uploaded</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleAction(selectedUser.id, 'approve')}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Approve KYC
                </Button>
                <Button
                  onClick={() => handleAction(selectedUser.id, 'reject')}
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 h-12"
                >
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reject KYC
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#0e0e24] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Pending KYC Requests ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <FileCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No pending KYC requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Submitted: {new Date(user.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
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
