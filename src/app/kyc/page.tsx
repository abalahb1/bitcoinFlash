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

// Selfie Capture Component with AI Face Detection
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
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceQuality, setFaceQuality] = useState<{
    centered: boolean
    goodLighting: boolean
    faceSize: 'good' | 'too-far' | 'too-close' | null
  }>({ centered: false, goodLighting: false, faceSize: null })
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load face-api models
  const loadModels = async () => {
    if (modelsLoaded || loadingModels) return
    
    setLoadingModels(true)
    try {
      const faceapi = (await import('face-api.js')).default || (await import('face-api.js'))
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
      ])
      
      setModelsLoaded(true)
    } catch (err) {
      console.error('Failed to load face detection models:', err)
    } finally {
      setLoadingModels(false)
    }
  }

  const startCamera = async () => {
    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Sorry, your browser does not support camera access. Please use a modern browser or upload a photo instead.')
        return
      }

      // Request camera permission with clear message
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraActive(true)
      
      // Load models when camera starts
      loadModels()
    } catch (err: any) {
      console.error('Camera access error:', err)
      
      // Handle different error types
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert('⚠️ Camera Access Denied\n\nTo continue, please:\n1. Allow camera access in your browser settings\n2. Or use the "Upload Photo" option instead\n\nWe need camera access to verify your identity securely.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        alert('⚠️ No Camera Found\n\nPlease:\n1. Make sure your camera is connected\n2. Or use the "Upload Photo" option from gallery')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        alert('⚠️ Camera In Use\n\nPlease:\n1. Close other applications using the camera\n2. Or use the "Upload Photo" option')
      } else {
        alert('⚠️ Camera Access Error\n\nPlease try again or use the "Upload Photo" option')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
    setCameraActive(false)
    setFaceDetected(false)
  }

  // Face detection loop
  const detectFace = async () => {
    if (!videoRef.current || !overlayCanvasRef.current || !modelsLoaded) return

    try {
      const faceapi = (await import('face-api.js')).default || (await import('face-api.js'))
      const video = videoRef.current
      const canvas = overlayCanvasRef.current
      
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)

      // Clear previous drawings
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      if (detections) {
        setFaceDetected(true)
        
        // Draw face landmarks (mirrored for display)
        if (ctx) {
          ctx.save()
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
          
          // Draw face box
          const box = detections.detection.box
          ctx.strokeStyle = '#a855f7'
          ctx.lineWidth = 3
          ctx.strokeRect(box.x, box.y, box.width, box.height)
          
          // Draw landmarks
          const landmarks = detections.landmarks.positions
          ctx.fillStyle = '#a855f7'
          landmarks.forEach(point => {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
            ctx.fill()
          })
          
          ctx.restore()
        }

        // Check face quality
        const box = detections.detection.box
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight
        
        // Check if face is centered
        const centerX = box.x + box.width / 2
        const centerY = box.y + box.height / 2
        const videoCenterX = videoWidth / 2
        const videoCenterY = videoHeight / 2
        const centered = Math.abs(centerX - videoCenterX) < videoWidth * 0.15 && 
                        Math.abs(centerY - videoCenterY) < videoHeight * 0.15

        // Check face size
        const faceArea = box.width * box.height
        const videoArea = videoWidth * videoHeight
        const faceRatio = faceArea / videoArea
        
        let faceSize: 'good' | 'too-far' | 'too-close' = 'good'
        if (faceRatio < 0.08) faceSize = 'too-far'
        else if (faceRatio > 0.35) faceSize = 'too-close'

        // Simple lighting check (using detection confidence as proxy)
        const goodLighting = detections.detection.score > 0.7

        setFaceQuality({ centered, goodLighting, faceSize })
      } else {
        setFaceDetected(false)
        setFaceQuality({ centered: false, goodLighting: false, faceSize: null })
      }
    } catch (err) {
      console.error('Face detection error:', err)
    }
  }

  // Start detection when camera is active and models are loaded
  useEffect(() => {
    if (cameraActive && modelsLoaded && videoRef.current) {
      // Set canvas size to match video
      const video = videoRef.current
      video.addEventListener('loadedmetadata', () => {
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = video.videoWidth
          overlayCanvasRef.current.height = video.videoHeight
        }
      })

      // Start detection loop
      detectionIntervalRef.current = setInterval(detectFace, 200) // 5 FPS for detection
      
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current)
        }
      }
    }
  }, [cameraActive, modelsLoaded])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Mirror the image horizontally to fix the flipped camera issue
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob and create file
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
    const allChecksPass = faceDetected && faceQuality.centered && faceQuality.goodLighting && faceQuality.faceSize === 'good'
    
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
          
          {/* Face detection overlay */}
          <canvas 
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Face guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-48 h-64 border-4 rounded-full transition-colors ${
                allChecksPass ? 'border-emerald-500' : 'border-purple-500/50'
              }`}></div>
            </div>
          </div>

          {/* Quality indicators */}
          <div className="absolute top-4 left-4 right-4 space-y-2">
            {loadingModels && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading AI models...
              </div>
            )}
            
            {modelsLoaded && (
              <>
                <div className={`bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                  faceDetected ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {faceDetected ? <CheckCircle2 className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {faceDetected ? 'Face detected' : 'Looking for face...'}
                </div>
                
                {faceDetected && (
                  <>
                    <div className={`bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                      faceQuality.centered ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>
                      {faceQuality.centered ? <CheckCircle2 className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {faceQuality.centered ? 'Well centered' : 'Center your face'}
                    </div>
                    
                    <div className={`bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                      faceQuality.faceSize === 'good' ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>
                      {faceQuality.faceSize === 'good' ? <CheckCircle2 className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {faceQuality.faceSize === 'good' ? 'Good distance' : 
                       faceQuality.faceSize === 'too-far' ? 'Move closer' : 
                       faceQuality.faceSize === 'too-close' ? 'Move back' : 'Adjusting...'}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
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
            disabled={!allChecksPass && modelsLoaded}
            className={`flex-1 ${
              allChecksPass 
                ? 'bg-emerald-600 hover:bg-emerald-500 animate-pulse' 
                : 'bg-purple-600 hover:bg-purple-500'
            } text-white disabled:opacity-50`}
          >
            <Camera className="w-4 h-4 mr-2" />
            {allChecksPass ? 'Perfect! Capture' : 'Capture'}
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
              <p className="text-white font-medium">Use AI Camera</p>
              <p className="text-xs text-gray-500 mt-1">Smart face detection</p>
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
