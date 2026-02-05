'use client'

import { useState, useEffect, useRef } from 'react'
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

// Selfie Capture Component - Simple Manual Capture
function SelfieCapture({
  onCapture,
  preview,
  onReset
}: {
  onCapture: (file: File, preview: string) => void
  preview: string | null
  onReset: () => void
}) {
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert('⚠️ Camera Requires HTTPS\n\nCamera access requires a secure connection (HTTPS).\n\nPlease:\n1. Access the site via HTTPS\n2. Or use localhost for testing\n3. Or use the "Upload Photo" option')
        return
      }

      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Sorry, your browser does not support camera access. Please use a modern browser or upload a photo instead.')
        return
      }

      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err)
            })
          }
        }
      }

      setCameraActive(true)
    } catch (err: any) {
      console.error('Camera access error:', err)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('⚠️ Camera Access Denied\n\nTo continue, please:\n1. Allow camera access in your browser settings\n2. Click "Allow" when prompted\n3. Or use the "Upload Photo" option instead')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        alert('⚠️ No Camera Found\n\nPlease:\n1. Make sure your camera is connected\n2. Check if another app is using the camera\n3. Or use the "Upload Photo" option from gallery')
      } else {
        alert('⚠️ Camera Access Error\n\n' + (err.message || 'Unknown error') + '\n\nPlease try again or use the "Upload Photo" option')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const flipCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  // Restart camera when facingMode changes
  useEffect(() => {
    if (cameraActive && !stream) {
      const timer = setTimeout(() => {
        startCamera()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [facingMode])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Mirror the image horizontally
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      const previewUrl = canvas.toDataURL('image/jpeg', 0.9)

      onCapture(file, previewUrl)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      alert('File size must be less than 3MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onCapture(file, reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-xl">
          <img src={preview} alt="Selfie Preview" className="w-full h-full object-cover" />
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full border-white/10 text-white hover:bg-white/5"
        >
          <Camera className="w-4 h-4 mr-2" />
          Retake Photo
        </Button>
      </div>
    )
  }

  if (cameraActive) {
    return (
      <div className="space-y-4">
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden border-4 border-purple-500/30 bg-black shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Face guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-64 border-4 border-purple-500/60 rounded-full"></div>
            </div>
            {/* Corner brackets */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-72 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white flex items-center gap-2">
              <Camera className="w-3 h-3 text-purple-400" />
              Position your face in the oval and tap Capture
            </div>
          </div>

          {/* Flip Camera Button */}
          <button
            onClick={flipCamera}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all z-10"
            title="Flip Camera"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <Button
            onClick={stopCamera}
            variant="outline"
            className="flex-1 border-white/10 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={capturePhoto}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture Photo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Permission info */}
      <Alert className="border-purple-500/30 bg-purple-500/5">
        <Shield className="w-4 h-4 text-purple-400" />
        <AlertDescription className="text-xs text-gray-300">
          <strong className="text-purple-400">Notice:</strong> Your browser will request camera access permission. We need this to verify your identity securely. Your data is protected and will never be shared with third parties.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={startCamera}
          className="p-8 rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 transition-all group"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Take Selfie</p>
              <p className="text-xs text-gray-500 mt-1">Use your camera</p>
            </div>
          </div>
        </button>

        <label className="p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-black/20 hover:bg-purple-500/5 transition-all cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Upload Photo</p>
              <p className="text-xs text-gray-500 mt-1">Choose from gallery</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050510] text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-50 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

      <div className="relative z-10">
        <TopTicker />

        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-40px)] flex flex-col items-center justify-center">

          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-mono tracking-[0.2em] mb-4">
              <Shield className="w-4 h-4" /> SECURE VERIFICATION PROTOCOL
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Identity Verification</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Verify your identity to unlock all dashboard features with the new unified Flash BTC identity.
            </p>
          </div>

          {/* Wizard Card */}
          <Card className="w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
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
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-white font-semibold">Government ID</h3>
                        <p className="text-sm text-gray-400">Valid Passport, ID Card, or Driver's License</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-cyan-400" />
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
                      className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold border-none shadow-[0_0_30px_rgba(16,185,129,0.35)]"
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
                      <Button variant="outline" onClick={() => setCurrentStep('intro')} className="border-white/10 text-white hover:border-emerald-400/50 hover:bg-white/5">
                        Back
                      </Button>
                      <Button
                        onClick={() => setCurrentStep('selfie')}
                        disabled={!passportFile}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold disabled:opacity-60"
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
                      <p className="text-gray-400 text-sm">Please provide a clear photo of your face to verify your identity.</p>
                    </div>

                    <SelfieCapture
                      onCapture={(file, preview) => {
                        setSelfieFile(file)
                        setSelfiePreview(preview)
                        setError(null)
                      }}
                      preview={selfiePreview}
                      onReset={() => {
                        setSelfieFile(null)
                        setSelfiePreview(null)
                      }}
                    />

                    {error && (
                      <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCurrentStep('passport')} className="border-white/10 text-white hover:border-emerald-400/50 hover:bg-white/5">
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selfieFile || uploading}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold disabled:opacity-60"
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
