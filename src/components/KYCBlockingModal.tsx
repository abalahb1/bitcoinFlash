'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface KYCBlockingModalProps {
  status: string
  userId: string
  isVerified: boolean
}

export function KYCBlockingModal({ status, userId, isVerified }: KYCBlockingModalProps) {
  const router = useRouter()
  // We use local state to hide it optimistically if needed, 
  // but main logic relies on parent passing updated props
  const [mounting, setMounting] = useState(true)

  useEffect(() => {
    setMounting(false)
  }, [])

  // If verified, don't show anything
  if (isVerified) return null
  if (mounting) return null // Prevent hydration mismatch

  return (
    <div className="fixed inset-0 z-[100] bg-[#050510]/95 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0e0e24] border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Verification Required</CardTitle>
          <CardDescription className="text-gray-400">
            Access to the Flash Protocol requires identity verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'pending' ? (
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <h4 className="text-yellow-400 font-medium text-sm">Under Review</h4>
                   <p className="text-gray-400 text-xs">Your documents are currently being reviewed by our compliance team. You will be notified once approved.</p>
                </div>
             </div>
          ) : (
             <div className="space-y-4 text-sm text-gray-400 text-center">
                <p>This is a mandatory step to prevent misuse of the simulation network.</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                   <div className="bg-white/5 p-2 rounded flex flex-col items-center gap-1">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Encrypted Data</span>
                   </div>
                   <div className="bg-white/5 p-2 rounded flex flex-col items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>5 Min Process</span>
                   </div>
                </div>
             </div>
          )}

          <Button 
            onClick={() => router.push('/kyc')}
            className={`w-full h-12 text-lg font-medium shadow-lg hover:shadow-orange-500/20 transition-all ${
                status === 'pending' 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white'
            }`}
          >
            {status === 'pending' ? 'View Status' : 'Start Verification'} 
            {!status && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
