'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package as PackageIcon, Loader2, Plus, Edit, Trash2, 
  ArrowLeft, DollarSign, Clock, Zap, Bitcoin
} from 'lucide-react'
import Link from 'next/link'

type Package = {
  id: string
  name: string
  usdt_amount: string
  btc_amount: string
  price_usd: number
  duration: number
  transfers: number
  _count: {
    payments: number
  }
}

export default function AdminPackagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<Package[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    usdt_amount: '',
    btc_amount: '',
    price_usd: '',
    duration: '45',
    transfers: '27'
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages')
      if (res.status === 403) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch packages')
      const data = await res.json()
      setPackages(data)
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPackage ? '/api/admin/packages' : '/api/admin/packages'
      const method = editingPackage ? 'PUT' : 'POST'
      
      const body = editingPackage 
        ? { packageId: editingPackage.id, updates: formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: data.message, type: 'success' })
        setShowForm(false)
        setEditingPackage(null)
        setFormData({
          name: '',
          usdt_amount: '',
          btc_amount: '',
          price_usd: '',
          duration: '45',
          transfers: '27'
        })
        fetchPackages()
      } else {
        setMessage({ text: data.error, type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to save package', type: 'error' })
    }
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      usdt_amount: pkg.usdt_amount,
      btc_amount: pkg.btc_amount,
      price_usd: pkg.price_usd.toString(),
      duration: pkg.duration.toString(),
      transfers: pkg.transfers.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (packageId: string, packageName: string) => {
    if (!confirm(`Are you sure you want to delete package "${packageName}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/packages?packageId=${packageId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ text: 'Package deleted successfully', type: 'success' })
        fetchPackages()
      } else {
        setMessage({ text: 'Failed to delete package', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to delete package', type: 'error' })
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
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <PackageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Packages Management</h1>
              <p className="text-xs text-gray-400">Create and manage flash packages</p>
            </div>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingPackage(null); }} className="bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4 mr-2" />
            New Package
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
            <AlertDescription className={message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card className="bg-[#0e0e24] border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Package Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Flash Starter"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">Price (USD)</Label>
                    <Input
                      type="number"
                      value={formData.price_usd}
                      onChange={(e) => setFormData({...formData, price_usd: e.target.value})}
                      placeholder="500"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">USDT Amount</Label>
                    <Input
                      value={formData.usdt_amount}
                      onChange={(e) => setFormData({...formData, usdt_amount: e.target.value})}
                      placeholder="150,000"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">BTC Amount</Label>
                    <Input
                      value={formData.btc_amount}
                      onChange={(e) => setFormData({...formData, btc_amount: e.target.value})}
                      placeholder="100"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">Duration (Days)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="45"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-2 block">Daily Transfers</Label>
                    <Input
                      type="number"
                      value={formData.transfers}
                      onChange={(e) => setFormData({...formData, transfers: e.target.value})}
                      placeholder="27"
                      className="bg-[#1a1a2e] border-white/10 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                    {editingPackage ? 'Update Package' : 'Create Package'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPackage(null); }} className="border-white/10 text-white">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="bg-[#0e0e24] border-white/10 hover:border-emerald-500/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{pkg.name}</CardTitle>
                    <p className="text-emerald-400 font-bold text-2xl mt-2">${pkg.price_usd.toLocaleString()}</p>
                  </div>
                  <Bitcoin className="w-8 h-8 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">BTC Amount:</span>
                    <span className="text-white font-semibold">{pkg.btc_amount} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">USDT Amount:</span>
                    <span className="text-white font-semibold">{pkg.usdt_amount} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-semibold">{pkg.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transfers:</span>
                    <span className="text-white font-semibold">{pkg.transfers}/day</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-400">Total Sales:</span>
                    <span className="text-emerald-400 font-bold">{pkg._count.payments}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleEdit(pkg)} size="sm" variant="outline" className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(pkg.id, pkg.name)} size="sm" variant="outline" className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && !showForm && (
          <div className="text-center py-12">
            <PackageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No packages found</p>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500">
              <Plus className="w-4 h-4 mr-2" />
              Create First Package
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
