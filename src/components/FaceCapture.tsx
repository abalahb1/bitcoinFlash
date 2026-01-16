'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Camera, RefreshCw, CheckCircle2, ScanFace } from 'lucide-react'
import { motion } from 'framer-motion'

interface FaceCaptureProps {
  onCapture: (file: File) => void
  loading?: boolean
}

export function FaceCapture({ onCapture, loading = false }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const capture = useCallback(() => {
    setIsScanning(true)
    // Simulate scanning delay for effect
    setTimeout(() => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (imageSrc) {
        setImageSrc(imageSrc)
        // Convert base64 to File
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" })
            onCapture(file)
          })
      }
      setIsScanning(false)
    }, 1500)
  }, [webcamRef, onCapture])

  const retake = () => {
    setImageSrc(null)
  }

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  }

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black/40 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
      
      {!imageSrc ? (
        <div className="relative">
          {/* Camera Feed */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-[400px] object-cover mirror-mode"
          />

          {/* Professional Overlay Mask */}
          <div className="absolute inset-0 pointer-events-none">
            {/* The dark overlay with a cutout oval */}
            <div className="absolute inset-0 bg-black/40">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[220px] h-[300px] rounded-[50%] border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(0,243,255,0.2)_inset] bg-transparent backdrop-blur-none" 
                    style={{
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                    }}
               />
               
               {/* Corner brackets */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[240px] h-[320px]">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500" />
               </div>
            </div>

            {/* Scanning Line Animation */}
            {isScanning && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[220px] h-[300px] overflow-hidden rounded-[50%]">
                 <motion.div
                    initial={{ top: "-10%" }}
                    animate={{ top: "110%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute left-0 w-full h-2 bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.8)]"
                 />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
            <div className="inline-block px-4 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
              <p className="text-white font-medium text-sm flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-cyan-400" />
                {isScanning ? "Analyzing Face..." : "Position face in oval"}
              </p>
            </div>
          </div>

          {/* Capture Button */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
            <Button
              onClick={capture}
              disabled={isScanning || loading}
              className="rounded-full w-16 h-16 bg-white border-4 border-cyan-500 hover:bg-gray-200 hover:scale-105 transition-all p-0 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
            >
              {isScanning ? (
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-cyan-500/10" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative h-[400px] bg-black">
          <img src={imageSrc} alt="Selfie" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4">
             <div className="p-4 bg-emerald-500/20 rounded-full border-2 border-emerald-500/50 animate-in zoom-in duration-300">
               <CheckCircle2 className="w-12 h-12 text-emerald-400" />
             </div>
             <p className="text-white font-medium text-lg">Photo Captured</p>
             
             <div className="flex gap-4 mt-4">
               <Button 
                onClick={retake}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
               >
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Retake
               </Button>
             </div>
          </div>
          
          {loading && (
             <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
               <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
               <p className="text-cyan-400 font-medium">Uploading verification...</p>
             </div>
          )}
        </div>
      )}
    </div>
  )
}
