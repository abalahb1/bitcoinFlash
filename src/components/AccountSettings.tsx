'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2, ShieldCheck, Percent, Briefcase, FileCheck, Wallet, Camera, UserSquare2, CheckCircle2, Shield } from 'lucide-react'
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
  const [walletValidation, setWalletValidation] = useState<{
    isValid: boolean
    network: string
    error: string
  } | null>(null)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  // Validate commission wallet address
  const validateWalletAddress = (address: string) => {
    if (!address || address.trim() === '') {
      setWalletValidation(null)
      return
    }

    const trimmedAddress = address.trim()
    let isValid = false
    let network = 'Unknown'
    let error = ''

    // Bitcoin (BTC) validation
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Bitcoin (Legacy/SegWit)'
    } else if (/^bc1[a-z0-9]{39,59}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Bitcoin (Native SegWit)'
    }
    // Tron (TRX) validation
    else if (/^T[A-Za-z1-9]{33}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Tron (TRC20)'
    }
    // Ethereum (ETH) validation
    else if (/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Ethereum (ERC20)'
    }
    // Solana validation
    else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress) && !trimmedAddress.startsWith('T') && !trimmedAddress.startsWith('1') && !trimmedAddress.startsWith('3')) {
      isValid = true
      network = 'Solana'
    }
    // Litecoin validation
    else if (/^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Litecoin'
    }
    else {
      error = 'Invalid wallet address format. Please enter a valid cryptocurrency address.'
    }

    setWalletValidation({ isValid, network, error })
  }

  const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCommissionWallet(value)
    validateWalletAddress(value)
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

      {/* Agent Dashboard Card - Modern Global Design */}
      <Card className="bg-gradient-to-br from-[#0a0a1f] via-[#1a1a2e] to-[#0a0a1f] border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-900/20">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Agent Program</h3>
                <p className="text-gray-400 text-sm">Earn commissions on every sale</p>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2">
              <Percent className="w-3 h-3 mr-1" />
              10% Commission
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Verification Status</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white capitalize">{user.kyc_status}</span>
                <Badge 
                  variant={user.kyc_status === 'approved' ? 'default' : 'secondary'} 
                  className={user.kyc_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
                >
                  {user.kyc_status === 'approved' ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Commission Rate</span>
                <Percent className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                10<span className="text-yellow-400 text-xl">%</span>
                <span className="text-gray-500 text-sm ml-2">per sale</span>
              </div>
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
            <Label className="text-gray-300 font-medium">Wallet Address (BTC/USDT/ETH)</Label>
            <Input
              value={commissionWallet}
              onChange={handleWalletChange}
              placeholder="Enter your wallet address"
              className={`bg-black/40 border-gray-700 text-white font-mono h-11 focus:border-cyan-500 transition-colors ${
                walletValidation?.isValid ? 'border-emerald-500/50' : 
                walletValidation?.error ? 'border-red-500/50' : ''
              }`}
            />
            
            {/* Validation Feedback */}
            {walletValidation && (
              <div className={`mt-2 p-3 rounded-lg border ${
                walletValidation.isValid 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                {walletValidation.isValid ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-emerald-400">Valid Address</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Network: <span className="text-white font-medium">{walletValidation.network}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-red-400">Invalid Address</div>
                      <div className="text-xs text-gray-400 mt-0.5">{walletValidation.error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveWallet}
            disabled={loading || !walletValidation?.isValid}
            className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 h-11 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
