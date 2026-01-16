'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Basic redirect just in case middleware lets it through
    // or for client-side navigation
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="text-gray-500 text-sm">Redirecting to secure gateway...</p>
    </div>
  )
}
