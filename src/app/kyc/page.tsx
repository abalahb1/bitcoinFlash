'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, CheckCircle2, Shield, User, Camera, FileText, ChevronRight, ChevronLeft, Lock } from 'lucide-react'
import { TopTicker } from '@/components/MarketTicker'

// Types
type Step = 'intro' | 'passport' | 'selfie' | 'review' | 'success'

export default function KYCPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('intro')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form State
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initial Data Fetch
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then(data => {
        setUser(data)
        // If already verified or pending, redirect back to dashboard or show status
        if (data.is_verified) {
           router.replace('/dashboard')
        } else if (data.kyc_status === 'pending') {
           setCurrentStep('success') // Show pending/success screen
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'selfie') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      setError('File size must be less than 3MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'passport') {
        setPassportFile(file)
        setPassportPreview(reader.result as string)
      } else {
        setSelfieFile(file)
        setSelfiePreview(reader.result as string)
      }
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const uploadFile = async (file: File, type: 'passport' | 'selfie') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const res = await fetch('/api/upload/kyc', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Upload failed')
    }
    
    return res.json()
  }

  const handleSubmit = async () => {
    if (!passportFile || !selfieFile) {
      setError('Please upload both documents')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Upload Passport
      await uploadFile(passportFile, 'passport')
      // Upload Selfie
      await uploadFile(selfieFile, 'selfie')
      
      setCurrentStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
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
    <div className="min-h-screen flex flex-col bg-[#050510] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] to-[#0a0a1f] z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <TopTicker />
        
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-40px)] flex flex-col items-center justify-center">
          
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-4">
               <Shield className="w-4 h-4" /> Secure Verification Protocol
             </div>
             <h1 className="text-3xl md:text-4xl font-bold text-white">Identity Verification</h1>
             <p className="text-gray-400 max-w-md mx-auto">
               To comply with international regulations and ensure platform security, we require identity verification for all agents.
             </p>
          </div>

          {/* Wizard Card */}
          <Card className="w-full max-w-2xl bg-[#0e0e24]/80 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
             
             {/* Progress Bar */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: currentStep === 'intro' ? '20%' : 
                           currentStep === 'passport' ? '50%' : 
                           currentStep === 'selfie' ? '80%' : '100%' 
                  }}
                  transition={{ duration: 0.5 }}
                />
             </div>

             <CardContent className="p-8 pt-12 min-h-[400px]">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Intro */}
                  {currentStep === 'intro' && (
                    <motion.div
                      key="intro"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-semibold">Government ID</h3>
                            <p className="text-sm text-gray-400">Valid Passport, ID Card, or Driver's License</p>
                         </div>
                         <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold">Selfie Photo</h3>
                            <p className="text-sm text-gray-400">Clear photo of your face for liveness check</p>
                         </div>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
                         <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <h4 className="text-emerald-400 text-sm font-medium">Data Privacy Guaranteed</h4>
                            <p className="text-xs text-emerald-500/70">Your data is encrypted and stored securely. It is only used for verification purposes and is never shared with third parties.</p>
                         </div>
                      </div>

                      <Button 
                        onClick={() => setCurrentStep('passport')}
                        className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Start Verification <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Passport Upload */}
                  {currentStep === 'passport' && (
                    <motion.div
                      key="passport"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white">Upload Identity Document</h3>
                        <p className="text-gray-400 text-sm">Please upload a clear photo of your government-issued ID.</p>
                      </div>

                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors bg-black/20 group relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'passport')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {passportPreview ? (
                          <div className="relative w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden border border-white/20">
                            <img src={passportPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-medium">Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 space-y-4 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Click or drag file to upload</p>
                              <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 3MB)</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                      )}

                      <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setCurrentStep('intro')} className="border-white/10 text-white hover:bg-white/5">
                          Back
                        </Button>
                        <Button 
                          onClick={() => setCurrentStep('selfie')}
                          disabled={!passportFile}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Continue <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Selfie Upload */}
                  {currentStep === 'selfie' && (
                    <motion.div
                      key="selfie"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white">Take a Selfie</h3>
                        <p className="text-gray-400 text-sm">Please provide a photo of your face to verify your identity.</p>
                      </div>

                      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-colors bg-black/20 group relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'selfie')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {selfiePreview ? (
                          <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white/10">
                            <img src={selfiePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-medium">Change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 space-y-4 pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Camera className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Upload Selfie</p>
                              <p className="text-xs text-gray-500 mt-1">Make sure your face is clearly visible</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                      )}

                      <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setCurrentStep('passport')} className="border-white/10 text-white hover:bg-white/5">
                          Back
                        </Button>
                        <Button 
                          onClick={handleSubmit}
                          disabled={!selfieFile || uploading}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                        >
                          {uploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                          ) : (
                            <>Submit Verification <CheckCircle2 className="w-4 h-4 ml-2" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Success/Pending */}
                  {currentStep === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-8"
                    >
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                           <Shield className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Verification Pending</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">
                          Thank you! Your documents have been received and are currently under review. This usually takes less than 1 hour.
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 max-w-sm mx-auto text-sm text-gray-300">
                        <p>Status: <span className="text-yellow-400 font-bold uppercase tracking-wider">In Review</span></p>
                      </div>

                      <Button 
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        Return to Dashboard
                      </Button>
                    </motion.div>
                  )}

                </AnimatePresence>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
