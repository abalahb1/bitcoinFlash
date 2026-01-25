'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Bitcoin, Terminal } from 'lucide-react'
import { TopTicker, HeroMarketSlides } from '@/components/MarketTicker'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('Session Initialized. Redirecting...', 'success')
        // Short delay to show success message before redirect
        setTimeout(() => {
            router.push('/dashboard')
            router.refresh() // Ensure middleware re-runs
        }, 800)
      } else {
        // Handle both old format (data.error = string) and new format (data.error = { message: string })
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Access Denied'
        showMessage(errorMessage, 'error')
      }
    } catch (error) {
      showMessage('Connection refused by host', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050510] relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02020a] to-[#0a0a1f] z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Market Ticker */}
      <div className="h-10 relative z-20">
         <TopTicker />
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col pt-10">
        <HeroMarketSlides />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
              {/* Logo */}
              <div className="text-center mb-8 space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-[#F7931A] to-yellow-600 rounded-2xl shadow-lg shadow-orange-500/20">
                  <Bitcoin className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Bitcoin Flash
                </h1>
                <p className="text-gray-400">
                  Premium Flash Bitcoin Generator
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
                   <span>Supports:</span>
                   <span className="text-gray-300">Binance</span>
                   <span className="w-1 h-1 rounded-full bg-gray-600" />
                   <span className="text-gray-300">Coinbase</span>
                   <span className="w-1 h-1 rounded-full bg-gray-600" />
                   <span className="text-gray-300">MetaMask</span>
                </div>
              </div>

              {/* Message */}
              {message && (
                <Alert className={`mb-6 border ${
                  message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                  message.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-400' :
                  'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                }`}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

                <Card className="bg-[#0e0e24]/80 backdrop-blur-xl border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-500" />
                      Auth Gateway
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      authorized_agents_only
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-300">Agent ID / Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="agent@flash-core.io"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-black/20 border-white/10 text-white focus:border-emerald-500 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-gray-300">Access Key</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-black/20 border-white/10 text-white focus:border-emerald-500 h-12"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-lg shadow-lg shadow-emerald-500/20 transition-all font-medium rounded-lg"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Initialize Session
                      </Button>
                    </form>
                  </CardContent>
                </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
