'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Loader2, FileCheck, Wallet, Camera, UserSquare2, CheckCircle2, Shield, Key, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { FaceCapture } from '@/components/FaceCapture'
import { extractApiError } from '@/lib/error-utils'

type User = {
  id: string
  name: string
  username: string
  email?: string | null
  wallet_ref: string | null
  usdt_trc20_address: string | null
  kyc_passport_url: string | null
  kyc_selfie_url: string | null
  kyc_status: string
  commission_wallet: string | null
  account_tier?: string
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

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match', type: 'error' })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ text: 'Password must be at least 8 characters', type: 'error' })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ text: 'Password changed successfully!', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ 
          text: data.error?.message || 'Failed to change password', 
          type: 'error' 
        })
      }
    } catch (error) {
      setPasswordMessage({ text: 'Connection error', type: 'error' })
    } finally {
      setChangingPassword(false)
      setTimeout(() => setPasswordMessage(null), 4000)
    }
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

    // Tron (TRX) validation - Only accept TRC20
    if (/^T[A-Za-z1-9]{33}$/.test(trimmedAddress)) {
      isValid = true
      network = 'Tron (TRC20)'
    } else {
      error = 'Invalid address. Only USDT TRC20 addresses are accepted (starts with T).'
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
        showMessage(extractApiError(data, 'Upload failed'))
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
        showMessage(extractApiError(data, 'Failed to save'))
      }
    } catch (error) {
      showMessage('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-[var(--font-outfit)]">
      {message && (
        <Alert className="border-cyan-500/50 bg-cyan-500/10">
          <AlertDescription className="text-cyan-400 font-medium">{message}</AlertDescription>
        </Alert>
      )}

      {/* Change Password Section */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader 
          className="cursor-pointer hover:bg-secondary/5 transition-colors" 
          onClick={() => setShowPasswordChange(!showPasswordChange)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="p-2 bg-secondary rounded-lg">
                <Key className="w-5 h-5 text-primary" />
              </div>
              Change Password
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {showPasswordChange ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          <CardDescription className="text-muted-foreground">
            Update your account password for security
          </CardDescription>
        </CardHeader>
        
        {showPasswordChange && (
          <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {passwordMessage && (
            <Alert className={`border ${
              passwordMessage.type === 'success' 
                ? 'border-emerald-500/50 bg-emerald-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              <AlertDescription className={
                passwordMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }>
                {passwordMessage.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-gray-300">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-black/40 border-gray-700 text-white h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-black/40 border-gray-700 text-white h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`bg-black/40 border-gray-700 text-white h-11 ${
                confirmPassword && newPassword !== confirmPassword ? 'border-red-500/50' : ''
              }`}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 h-11 transition-all disabled:opacity-50"
          >
            {changingPassword ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Changing Password...</>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </CardContent>
        )}
      </Card>

      {/* Commission Wallet */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 bg-secondary rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            Commission Wallet
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Destination address for your automated commission payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Wallet Address (USDT TRC20)</Label>
            <Input
              value={commissionWallet}
              onChange={handleWalletChange}
              placeholder="Enter your wallet address"
              className={`bg-black/40 border-gray-700 text-white font-mono h-11 focus:border-cyan-500 transition-colors ${walletValidation?.isValid ? 'border-emerald-500/50' :
                walletValidation?.error ? 'border-red-500/50' : ''
                }`}
            />

            {/* Validation Feedback */}
            {walletValidation && (
              <div className={`mt-2 p-3 rounded-lg border ${walletValidation.isValid
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

      {/* KYC Upload - Only show if not approved */}
      {user.kyc_status !== 'approved' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="p-2 bg-secondary rounded-lg">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              Identity Verification (KYC)
            </CardTitle>
            <CardDescription className="text-muted-foreground">
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
                          className="h-32 bg-secondary hover:bg-secondary/80 border border-primary/20 hover:border-primary hover:shadow-md transition-all group flex flex-col gap-3"
                        >
                          <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-center">
                            <span className="text-foreground font-medium block">Start Face Scan</span>
                            <span className="text-muted-foreground text-xs">Professional Verification</span>
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
      )}
    </div>
  )
}
