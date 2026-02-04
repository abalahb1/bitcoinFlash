'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Bitcoin, Shield, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
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
        body: JSON.stringify({ username, password }),
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-md p-4 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F7931A] to-yellow-600 shadow-lg shadow-orange-500/20 mb-4">
            <Bitcoin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardContent className="p-8">
            {message && (
              <Alert className={`mb-6 border ${message.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Username</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 bg-black/20 border-white/10 focus:border-primary transition-colors"
                    required
                  />
                  <Shield className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-black/20 border-white/10 focus:border-primary transition-colors"
                    required
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Protected by Bitcoin Flash Protocol V3</p>
          <p className="mt-1">Secure Encrypted Connection</p>
        </div>
      </div>
    </div>
  )
}
