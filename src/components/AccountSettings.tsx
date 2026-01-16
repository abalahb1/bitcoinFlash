'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2, ShieldCheck, Percent, Briefcase, FileCheck, Wallet, Camera, UserSquare2 } from 'lucide-react'
import { FaceCapture } from '@/components/FaceCapture'

type User = {
  id: string
  name: string
  email: string
  wallet_ref: string | null
  usdt_trc20_address: string | null
  kyc_passport_url: string | null
  kyc_selfie_url: string | null
  kyc_status: string
  commission_wallet: string | null
}

export function AccountSettings({ user, onUpdate }: {
  user: User
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [uploadingPassport, setUploadingPassport] = useState(false)
  const [uploadingSelfie, setUploadingSelfie] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [message, setMessage] = useState('')
  const [commissionWallet, setCommissionWallet] = useState(user.commission_wallet || '')

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleFileUpload = async (file: File, type: 'passport' | 'selfie') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const setUploadState = type === 'passport' ? setUploadingPassport : setUploadingSelfie
    setUploadState(true)

    try {
      const res = await fetch('/api/upload/kyc', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('Document uploaded successfully')
        onUpdate()
      } else {
        showMessage(data.error || 'Upload failed')
      }
    } catch (error) {
      showMessage('Connection error')
    } finally {
      setUploadState(false)
    }
  }

  const handleSaveWallet = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commission_wallet: commissionWallet
        })
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('Commission wallet saved successfully')
        onUpdate()
      } else {
        showMessage(data.error || 'Failed to save')
      }
    } catch (error) {
      showMessage('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className="border-cyan-500/50 bg-cyan-500/10">
          <AlertDescription className="text-cyan-400 font-medium">{message}</AlertDescription>
        </Alert>
      )}

      {/* Agent Info Card */}
      <Card className="bg-[#0a0a1f]/90 backdrop-blur-md border border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)] transition-all duration-500 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-white flex items-center gap-3 text-2xl">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <Briefcase className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <span className="text-yellow-400 font-bold tracking-tight">Agent Dashboard</span>
              <p className="text-sm font-normal text-gray-400 mt-1">Manage your agency status and earnings</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 relative z-10">
           {/* Commission Rate */}
           <div className="bg-gradient-to-br from-yellow-500/5 to-transparent p-6 rounded-2xl border border-yellow-500/10 hover:border-yellow-500/30 transition-colors group">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <h3 className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Commission Rate</h3>
                 <p className="text-yellow-500/60 text-xs mt-1">Per direct sale</p>
               </div>
               <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <Percent className="w-5 h-5 text-yellow-400" />
               </div>
             </div>
             <div className="text-5xl font-bold text-white tracking-tight">
               10<span className="text-yellow-400 text-3xl">%</span>
             </div>
           </div>

           {/* Agent Status */}
           <div className="bg-gradient-to-br from-cyan-500/5 to-transparent p-6 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 transition-colors group">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <h3 className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Account Status</h3>
                 <p className="text-cyan-500/60 text-xs mt-1">Verification level</p>
               </div>
               <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-5 h-5 text-cyan-400" />
               </div>
             </div>
             <div className="flex items-end gap-3">
               <div className="text-2xl font-bold text-white">
                 {user.kyc_status === 'approved' ? 'Verified Agent' : 'Standard User'}
               </div>
               <Badge variant={user.kyc_status === 'approved' ? 'default' : 'secondary'} className="mb-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30">
                 {user.kyc_status === 'approved' ? 'Active' : 'Unverified'}
               </Badge>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Commission Wallet */}
      <Card className="bg-[#0a0a1f]/80 backdrop-blur-sm border border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Wallet className="w-5 h-5 text-cyan-400" />
            </div>
            Commission Wallet
          </CardTitle>
          <CardDescription className="text-gray-400">
            Destination address for your automated commission payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Wallet Address (BTC/USDT)</Label>
            <Input
              value={commissionWallet}
              onChange={(e) => setCommissionWallet(e.target.value)}
              placeholder="Enter your wallet address"
              className="bg-black/40 border-gray-700 text-white font-mono h-11 focus:border-cyan-500 transition-colors"
            />
          </div>

          <Button
            onClick={handleSaveWallet}
            disabled={loading}
            className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 h-11 transition-all"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Commission Wallet'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* KYC Upload */}
      <Card className="bg-[#0a0a1f]/80 backdrop-blur-sm border border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
             <div className="p-2 bg-cyan-500/10 rounded-lg">
              <FileCheck className="w-5 h-5 text-cyan-400" />
            </div>
            Identity Verification (KYC)
          </CardTitle>
          <CardDescription className="text-gray-400">
            Required to activate your agent status and withdraw commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Passport Upload */}
            <div className="space-y-4">
              <Label className="text-gray-300 font-medium flex items-center gap-2">
                <UserSquare2 className="w-4 h-4 text-cyan-400" />
                Passport / ID Card
              </Label>
              {user.kyc_passport_url ? (
                <div className="mt-2 relative group overflow-hidden rounded-xl border border-cyan-500/30">
                  <img src={user.kyc_passport_url} alt="Passport" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/50 backdrop-blur-sm">
                      <FileCheck className="w-4 h-4" /> Uploaded
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'passport')}
                    className="hidden"
                    id="passport-upload"
                    disabled={uploadingPassport}
                  />
                  <label htmlFor="passport-upload" className="block w-full h-48 border-2 border-dashed border-gray-700/50 bg-black/20 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group">
                    <div className="p-4 bg-cyan-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                      {uploadingPassport ? (
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-gray-300 font-medium block">Click to upload</span>
                      <span className="text-gray-500 text-xs mt-1">JPG, PNG up to 5MB</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Selfie Upload - Enhanced with Live Face Capture */}
            <div className="space-y-4">
              <Label className="text-gray-300 font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Live Face Verification
              </Label>
              {user.kyc_selfie_url ? (
                <div className="mt-2 relative group overflow-hidden rounded-xl border border-cyan-500/30">
                  <img src={user.kyc_selfie_url} alt="Selfie" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white flex items-center gap-2 bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/50 backdrop-blur-sm">
                       <FileCheck className="w-4 h-4" /> Verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                    {/* Toggle between Upload and Camera */}
                    {showCamera ? (
                        <div className="space-y-4">
                             <FaceCapture 
                                onCapture={(file) => handleFileUpload(file, 'selfie')}
                                loading={uploadingSelfie}
                             />
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowCamera(false)}
                                className="w-full text-gray-400 hover:text-white"
                             >
                                Cancel Camera
                             </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                             <Button
                                onClick={() => setShowCamera(true)}
                                className="h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all group flex flex-col gap-3"
                             >
                                <div className="p-3 bg-cyan-500/20 rounded-full group-hover:scale-110 transition-transform">
                                   <Camera className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div className="text-center">
                                    <span className="text-cyan-100 font-medium block">Start Face Scan</span>
                                    <span className="text-cyan-400/60 text-xs">Professional Verification</span>
                                </div>
                             </Button>

                             {/* Fallback to file upload */}
                             <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                                    className="hidden"
                                    id="selfie-upload"
                                    disabled={uploadingSelfie}
                                />
                                <label htmlFor="selfie-upload" className="block w-full text-center py-2 text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
                                    or upload a file manually
                                </label>
                             </div>
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
