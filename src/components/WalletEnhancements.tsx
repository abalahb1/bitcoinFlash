'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check, Loader2, ArrowRightLeft, Wallet, QrCode } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  wallet_ref: string | null
  usdt_trc20_address: string | null
}

export function WalletEnhancements({ user, onUpdate }: {
  user: User
  onUpdate: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [trc20Address, setTrc20Address] = useState(user.usdt_trc20_address || '')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSaveWallet = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdt_trc20_address: trc20Address
        })
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('Address saved successfully')
        onUpdate()
      } else {
        showMessage(data.error || 'Failed to save')
      }
    } catch (error) {
      showMessage('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className="border-cyan-500/50 bg-cyan-500/10">
          <AlertDescription className="text-cyan-400 font-medium">{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* USDT TRC20 Address Configuration */}
        <Card className="bg-card border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-lg">
              <div className="p-2 bg-secondary rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              Deposit Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure your wallet for receiving funds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground font-medium">USDT TRC20 Address</Label>
              <div className="relative group">
                <Input
                  value={trc20Address}
                  onChange={(e) => setTrc20Address(e.target.value)}
                  placeholder="TVxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-secondary border-input text-foreground font-mono pl-10 focus:border-primary transition-colors h-11"
                />
                <Wallet className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5 group-hover:text-primary transition-colors" />
              </div>
            </div>
            
            <Button
              onClick={handleSaveWallet}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-primary h-11 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Address'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Receive QR COde */}
        {user.usdt_trc20_address && (
          <Card className="bg-card border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
             <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <div className="p-2 bg-secondary rounded-lg">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
                </div>
                Receive Funds
              </CardTitle>
              <CardDescription className="text-muted-foreground">Scan to deposit USDT</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                 <QRCodeSVG value={user.usdt_trc20_address} size={150} />
              </div>
              <div className="text-center w-full space-y-3">
                <div className="text-xs text-gray-400 font-mono break-all px-4 py-2 bg-black/40 rounded border border-gray-800">
                  {user.usdt_trc20_address}
                </div>
                <Button
                  onClick={() => copyToClipboard(user.usdt_trc20_address!)}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 w-full"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied to Clipboard' : 'Copy Address'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wallet References with QR */}
      {user.wallet_ref && (
        <Card className="bg-card border-border hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2 text-lg">
              <div className="p-2 bg-secondary rounded-lg">
                <QrCode className="w-5 h-5 text-purple-500" />
              </div>
              System Reference
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Use this code for internal transfers and system identification
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <QRCodeSVG value={user.wallet_ref} size={140} />
            </div>
            <div className="flex-1 space-y-6 w-full text-center md:text-left">
              <div>
                <Label className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Reference ID</Label>
                <div className="text-3xl font-mono text-white font-bold tracking-widest break-all mt-1">
                  {user.wallet_ref}
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(user.wallet_ref!)}
                className="w-full md:w-auto px-8 bg-purple-500/10 border border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy Reference'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
