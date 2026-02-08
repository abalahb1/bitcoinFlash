'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Bell,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Key,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Palette,
  Settings,
  Shield,
  Smartphone,
  User,
  Wallet,
  Eye,
  EyeOff,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

type UserShape = {
  id?: string
  name?: string
  email?: string | null
  username?: string
  is_verified?: boolean
  kyc_status?: string | null
  account_tier?: string | null
  wallet_ref?: string | null
  commission_wallet?: string | null
  usdt_trc20_address?: string | null
  kyc_passport_url?: string | null
  kyc_selfie_url?: string | null
}

type Preferences = {
  transactionAlerts: boolean
  securityAlerts: boolean
  productUpdates: boolean
  weeklySummary: boolean
  autoLogout: boolean
}

const defaultPreferences: Preferences = {
  transactionAlerts: true,
  securityAlerts: true,
  productUpdates: false,
  weeklySummary: true,
  autoLogout: true,
}

type SettingsTab = 'account' | 'security' | 'notifications' | 'appearance'

export function UserSettingsView({
  user,
  onLogout,
}: {
  user: UserShape
  onLogout: () => void
}) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const appVersion = process.env.NEXT_PUBLIC_SITE_VERSION || 'v3.0.0'
  const protocolVersion = 'Flash Protocol V3'
  const environmentLabel = process.env.NODE_ENV === 'production' ? 'Production' : 'Development'

  useEffect(() => {
    const stored = localStorage.getItem('user-preferences')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as Partial<Preferences>
      setPreferences((prev) => ({ ...prev, ...parsed }))
    } catch {
      localStorage.removeItem('user-preferences')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('user-preferences', JSON.stringify(preferences))
    setSaved(true)
    const timer = setTimeout(() => setSaved(false), 1200)
    return () => clearTimeout(timer)
  }, [preferences])

  const statusBadge = useMemo(() => {
    if (user?.is_verified) {
      return { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' }
    }
    if (user?.kyc_status && user.kyc_status !== 'approved') {
      return { label: 'Pending KYC', className: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/40' }
    }
    return { label: 'Unverified', className: 'bg-red-500/10 text-red-300 border-red-500/40' }
  }, [user?.is_verified, user?.kyc_status])

  // Password change handler
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match', type: 'error' })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ text: 'Password must be at least 8 characters', type: 'error' })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordMessage({ text: 'Password changed successfully!', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({
          text: data.error?.message || 'Failed to change password',
          type: 'error'
        })
      }
    } catch (error) {
      setPasswordMessage({ text: 'Connection error', type: 'error' })
    } finally {
      setChangingPassword(false)
      setTimeout(() => setPasswordMessage(null), 4000)
    }
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-24 right-6 h-48 w-48 rounded-full bg-cyan-500/10 blur-[110px]" />

      {/* Header */}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300 mb-2">
            <Settings className="w-3 h-3" />
            SETTINGS_CENTER
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage your account, security, and preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {saved && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-1">
              <AlertDescription className="text-xs">Preferences saved</AlertDescription>
            </Alert>
          )}
          <Badge className={`border ${statusBadge.className}`}>{statusBadge.label}</Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-[#0c0c0e] border border-white/10 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Account Overview */}
          <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0c0c0e] via-[#0b1214] to-[#050510]">
            <CardHeader className="relative flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Account Details</CardTitle>
                <p className="text-xs text-gray-400">Your identity and verification status</p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-gray-400 mb-1">Name</div>
                <div className="text-white font-semibold truncate">{user?.name || '—'}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-gray-400 mb-1">Email</div>
                <div className="text-white font-semibold truncate">{user?.email || '—'}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-gray-400 mb-1">Reference ID</div>
                <div className="text-white font-semibold truncate font-mono">{user?.wallet_ref || '—'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Site Info */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span>Application Version</span>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{appVersion}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span>Protocol</span>
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">{protocolVersion}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span>Environment</span>
                <Badge className="bg-white/5 text-gray-300 border-white/10">{environmentLabel}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Legal Section */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Legal & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="text-sm text-gray-300">
                <AccordionItem value="privacy" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline">Privacy Policy</AccordionTrigger>
                  <AccordionContent className="text-gray-400 space-y-4">
                    <div>
                      <p className="mb-3">
                        We are committed to protecting user privacy and maintaining the confidentiality of all data
                        and information accessed or handled through this website or its related services. This policy
                        explains how data is handled, the limits of its use, and the obligations imposed on relevant parties.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">1. Scope of Service</h4>
                      <p>
                        The website provides digital services related to marketing and selling Flash Bitcoin packages
                        generated through private servers. These services are offered exclusively through authorized
                        entities and under specific guidelines.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">2. Data Protection</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>All technical and operational data related to servers and operations is handled with complete confidentiality.</li>
                        <li>No technical or operational information will be disclosed to any third party under any circumstances.</li>
                        <li>Necessary technical and organizational measures are taken to protect data from unauthorized access, leakage, or misuse.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">3. Confidentiality & Restrictions</h4>
                      <p className="mb-2">The following are strictly prohibited:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Taking screenshots</li>
                        <li>Recording video or audio</li>
                        <li>Sharing or publishing any visual or technical content, or operational information related to the service or servers</li>
                      </ul>
                      <p className="mt-2 text-amber-400/80">
                        Any violation of these obligations is considered a serious breach of this Privacy Policy,
                        resulting in immediate termination of service access without prior notice.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">4. Access & Permissions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Any access permissions granted are personal and exclusive to the authorized user.</li>
                        <li>Sharing login credentials or authorizing another person to use the account or access the system is prohibited.</li>
                        <li>The user bears full responsibility for any activity conducted using their access credentials.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">5. Policy Compliance</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Users and authorized entities must operate within the framework defined by the website administration.</li>
                        <li>Any use outside the authorized scope or in violation of technical instructions constitutes a breach of this Privacy Policy and Terms of Use.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">6. Policy Modifications</h4>
                      <p>
                        The website reserves the right to modify or update this Privacy Policy at any time.
                        Modifications take effect immediately upon publication on the website. Continued use
                        of the service constitutes implicit consent to these modifications.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">7. Consent</h4>
                      <p className="text-emerald-400/80">
                        By using this website or any of its services, you acknowledge your complete agreement
                        to this Privacy Policy and commitment to all its terms.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="terms" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline">Terms of Service</AccordionTrigger>
                  <AccordionContent className="text-gray-400 space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Sales Mechanism</h4>
                      <p className="mb-3">
                        We provide, through a dedicated server, a Flash Bitcoin package generation service with clear
                        and consistent technical specifications. Packages are generated directly from the production
                        server without any intermediaries.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Flash Bitcoin Features</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Valid for use up to <span className="text-emerald-400">45 days</span></li>
                        <li>Transferable up to <span className="text-emerald-400">27 transactions</span></li>
                        <li>Supports seamless splitting and batch sending</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Transaction Process</h4>
                      <p className="mb-2">
                        We ensure a direct and secure sales process that guarantees complete transparency and
                        full compliance with the specifications agreed upon with the client.
                      </p>
                      <p className="mb-2">The sales process follows these steps:</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>
                          <span className="text-white">In-Person Meeting:</span> Both parties meet face-to-face at the same table to ensure complete transparency.
                        </li>
                        <li>
                          <span className="text-white">Payment Transfer:</span> The buyer transfers the full transaction value in USDT to the wallet code provided, according to the package and amount agreed upon in advance.
                        </li>
                        <li>
                          <span className="text-white">Confirmation & Delivery:</span> After final confirmation that the payment has been received and is irreversible, the agreed Flash Bitcoin package is delivered immediately.
                        </li>
                        <li>
                          <span className="text-white">No Test Transactions:</span> No test transactions are conducted, as the Flash is generated directly as a ready-made package from the production server.
                        </li>
                        <li>
                          <span className="text-white">Full Commitment:</span> We are fully committed to all specifications and terms agreed upon in advance without any changes.
                        </li>
                        <li>
                          <span className="text-white">Post-Delivery Support:</span> After delivery, we remain present with the client until they fully inspect and verify the package in our presence to ensure complete satisfaction.
                        </li>
                      </ol>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-emerald-400">
                        Through this mechanism, we guarantee clarity of concept, speed of execution,
                        complete credibility, and protection of all parties' rights.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="data" className="border-white/10">
                  <AccordionTrigger className="hover:no-underline">Data Retention</AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    Operational logs and compliance records are retained for regulatory and audit
                    obligations. You may request data export or deletion where applicable.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Change Password */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <Alert className={`border ${passwordMessage.type === 'success'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-red-500/50 bg-red-500/10'
                  }`}>
                  <AlertDescription className={passwordMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                    {passwordMessage.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-[#050505] border-white/10 text-white h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-[#050505] border-white/10 text-white h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`bg-[#050505] border-white/10 text-white h-11 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500/50' : ''
                    }`}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 h-11"
              >
                {changingPassword ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Changing Password...</>
                ) : (
                  <><Key className="w-4 h-4 mr-2" /> Update Password</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">2FA Not Enabled</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Current Device</p>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">This Device</Badge>
              </div>
              <Separator className="my-4 bg-white/10" />
              <Button
                variant="outline"
                onClick={onLogout}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out of This Device
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Transaction Notifications */}
          <Card className="border border-white/10 bg-[#0c0c0e]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Transaction Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PreferenceRow
                title="Transaction alerts"
                description="Instant notifications for purchases, withdrawals, and transfers."
                checked={preferences.transactionAlerts}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, transactionAlerts: checked }))
                }
              />
              <PreferenceRow
                title="Weekly summary"
                description="Receive weekly activity and performance summaries."
                checked={preferences.weeklySummary}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, weeklySummary: checked }))
                }
              />
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card className="border border-white/10 bg-[#0c0c0e]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PreferenceRow
                title="Security alerts"
                description="Login attempts, new device access, and critical warnings."
                checked={preferences.securityAlerts}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, securityAlerts: checked }))
                }
              />
              <PreferenceRow
                title="Auto logout"
                description="Automatically sign out after 30 minutes of inactivity."
                checked={preferences.autoLogout}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, autoLogout: checked }))
                }
              />
            </CardContent>
          </Card>

          {/* Marketing Notifications */}
          <Card className="border border-white/10 bg-[#0c0c0e]/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                Product Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreferenceRow
                title="Product updates"
                description="News, feature launches, and protocol updates."
                checked={preferences.productUpdates}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, productUpdates: checked }))
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Language */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">English (US)</p>
                    <p className="text-xs text-gray-500">Display language</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-gray-400">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 text-center transition-all">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#0a0a0a] border border-white/20"></div>
                  <span className="text-sm text-white font-medium">Dark</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mt-2" />
                </button>
                <button className="p-4 rounded-lg border border-white/10 bg-white/5 text-center hover:border-white/20 transition-all">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white border border-gray-200"></div>
                  <span className="text-sm text-gray-400 font-medium">Light</span>
                </button>
                <button className="p-4 rounded-lg border border-white/10 bg-white/5 text-center hover:border-white/20 transition-all">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-800 to-white border"></div>
                  <span className="text-sm text-gray-400 font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Display Density */}
          <Card className="bg-[#0c0c0e]/80 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Display Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 text-center transition-all">
                  <span className="text-sm text-white font-medium">Comfortable</span>
                  <p className="text-xs text-gray-500 mt-1">More spacing</p>
                </button>
                <button className="p-4 rounded-lg border border-white/10 bg-white/5 text-center hover:border-white/20 transition-all">
                  <span className="text-sm text-gray-300 font-medium">Compact</span>
                  <p className="text-xs text-gray-500 mt-1">Less spacing</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Support Section - Always Visible */}
      <Card className="bg-[#0c0c0e]/80 border border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-white font-medium">Need Help?</p>
                <p className="text-xs text-gray-500">Contact our support team</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              Get Support
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PreferenceRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-2 transition-all ${checked
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : 'border-white/10 bg-white/5 hover:border-white/20'
        }`}
    >
      <div>
        <div className="text-sm text-white font-medium">{title}</div>
        <p className="text-[11px] text-gray-500 leading-tight">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
