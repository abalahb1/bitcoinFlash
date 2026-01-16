'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert, Upload, Loader2, Camera, Lock, CheckCircle2, Clock } from 'lucide-react'
import { FaceCapture } from '@/components/FaceCapture'

type KYCStatus = 'pending' | 'approved' | 'rejected' | 'none'

interface KYCBlockingModalProps {
  status: KYCStatus
  userId: string
}

export function KYCBlockingModal({ status, userId }: KYCBlockingModalProps) {
  const [uploadingPassport, setUploadingPassport] = useState(false)
  const [uploadingSelfie, setUploadingSelfie] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [message, setMessage] = useState('')
  const [passportUploaded, setPassportUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)

  // If approved or no status provided (shouldn't happen if logic is correct), don't show anything
  if (status === 'approved') return null

  // If pending, show a strict "Under Review" screen
  if (status === 'pending') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a1f] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
            <Clock className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Verification In Progress</h1>
            <p className="text-gray-400">
              Your documents have been submitted and are currently under review. 
              Please allow up to 24 hours for our team to verify your identity.
            </p>
          </div>
          <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl text-yellow-500/80 text-sm">
            You will be notified once your account is activated.
          </div>
        </div>
      </div>
    )
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
        if (type === 'passport') setPassportUploaded(true)
        if (type === 'selfie') setSelfieUploaded(true)
        setMessage(`✅ ${type === 'passport' ? 'Passport' : 'Selfie'} uploaded successfully`)
        setTimeout(() => setMessage(''), 3000)

        // If both uploaded, reload to trigger "Pending" state
        if ((type === 'passport' && selfieUploaded) || (type === 'selfie' && passportUploaded)) {
             window.location.reload()
        }

      } else {
        setMessage(`❌ Error: ${data.error || 'Upload failed'}`)
      }
    } catch (error) {
      setMessage('❌ Connection error')
    } finally {
      setUploadState(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a1f]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Info */}
        <div className="space-y-6 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 text-red-400 text-sm font-medium">
             <ShieldAlert className="w-4 h-4" />
             Action Required
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
             Identity Verification Required <span className="text-red-500">.</span>
           </h1>
           <p className="text-lg text-gray-400 leading-relaxed">
             To ensure the security of the USDT Flash network and comply with international regulations, 
             we require all generated accounts to complete a one-time KYC verification.
           </p>
           
           <div className="flex flex-col gap-4">
             <div className="bg-black/30 p-4 rounded-xl border border-gray-800 flex items-start gap-3">
               <Lock className="w-5 h-5 text-cyan-400 mt-1" />
               <div className="text-left">
                 <h3 className="text-white font-medium">Secure Encrypted Storage</h3>
                 <p className="text-sm text-gray-500">Your data is encrypted with military-grade protocols and stored offline.</p>
               </div>
             </div>
           </div>
        </div>

        {/* Right Side: Upload Form */}
        <Card className="bg-black/50 border-gray-800 shadow-2xl relative overflow-hidden">
           {/* Top Loader Bar */}
           {(uploadingPassport || uploadingSelfie) && (
             <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/20">
               <div className="h-full bg-cyan-400 animate-progress" />
             </div>
           )}

           <CardHeader>
             <CardTitle className="text-white">Upload Documents</CardTitle>
             <CardDescription>Please verify your identity to continue.</CardDescription>
           </CardHeader>
           
           <CardContent className="space-y-6">
             {message && (
                <Alert className={`${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
             )}

             {/* Passport Upload */}
             <div className="space-y-3">
               <Label className="text-gray-300">1. Government ID / Passport</Label>
               {passportUploaded ? (
                 <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
                   <CheckCircle2 className="w-5 h-5" />
                   <span>Document Uploaded</span>
                 </div>
               ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'passport')}
                      className="hidden"
                      id="modal-passport"
                      disabled={uploadingPassport}
                    />
                    <label htmlFor="modal-passport" className="block w-full p-4 border border-dashed border-gray-700 bg-black/20 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/5 cursor-pointer transition-all flex items-center justify-center gap-3 text-gray-400 hover:text-white">
                       {uploadingPassport ? <Loader2 className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5" />}
                       <span>Click to Upload Image</span>
                    </label>
                  </div>
               )}
             </div>

             {/* Selfie Upload */}
             <div className="space-y-3">
               <Label className="text-gray-300">2. Live Selfie Search</Label>
               {selfieUploaded ? (
                 <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
                   <CheckCircle2 className="w-5 h-5" />
                   <span>Face Scan Complete</span>
                 </div>
               ) : (
                 showCamera ? (
                    <div className="border border-gray-700 rounded-xl overflow-hidden bg-black">
                        <FaceCapture 
                           onCapture={(file) => handleFileUpload(file, 'selfie')}
                           loading={uploadingSelfie}
                        />
                        <Button variant="ghost" size="sm" onClick={() => setShowCamera(false)} className="w-full text-red-400 hover:text-red-300">Cancel Camera</Button>
                    </div>
                 ) : (
                    <div className="flex gap-3">
                        <Button 
                          onClick={() => setShowCamera(true)}
                          className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                        >
                            <Camera className="w-4 h-4 mr-2" /> Start Camera
                        </Button>
                        <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                              className="hidden"
                              id="modal-selfie"
                              disabled={uploadingSelfie}
                            />
                            <label htmlFor="modal-selfie">
                                <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white hover:bg-white/5" asChild>
                                    <span>Upload</span>
                                </Button>
                            </label>
                        </div>
                    </div>
                 )
               )}
             </div>

             {/* Footer Status */}
             <div className="pt-4 border-t border-gray-800 text-xs text-center text-gray-500">
               {status === 'rejected' && <p className="text-red-400 font-medium mb-2">Note: Your previous application was rejected. Please upload clearer documents.</p>}
               Complete all steps to unlock access.
             </div>

           </CardContent>
        </Card>
      </div>
    </div>
  )
}
