'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Wallet, 
  User, 
  History, 
  BarChart2, 
  LogOut, 
  Bitcoin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NetworkStatus } from '@/components/NetworkStatus'
import type { View } from './AppShell'

interface SidebarProps {
  user: any
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  currentView: View
  setCurrentView: (view: View) => void
  onLogout: () => void
}

const navItems = [
  { id: 'landing', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'account', label: 'Agent Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'history', label: 'Transactions', icon: History },
  { id: 'commissions', label: 'Commissions', icon: BarChart2 },
]

export function Sidebar({ 
  user, 
  collapsed, 
  onCollapse, 
  currentView, 
  setCurrentView,
  onLogout 
}: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="h-full bg-card/95 backdrop-blur-xl border-r border-border flex flex-col"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <motion.div 
            className="flex items-center gap-3 overflow-hidden"
            animate={{ opacity: 1 }}
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center shadow-lg">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col leading-none"
              >
                <span className="text-lg font-bold text-white">BITCOIN</span>
                <span className="text-xs font-bold text-primary tracking-widest">FLASH PROTOCOL</span>
              </motion.div>
            )}
          </motion.div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-white shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id
            const Icon = item.icon

            const button = (
              <button
                onClick={() => setCurrentView(item.id as View)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg neon-glow-orange' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-card border-border">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.id}>{button}</div>
          })}
        </nav>

        {/* Network Status */}
        <div className={`px-3 py-3 border-t border-border ${collapsed ? 'flex justify-center' : ''}`}>
          <NetworkStatus collapsed={collapsed} />
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}

            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border-border">
                  Log Out
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
