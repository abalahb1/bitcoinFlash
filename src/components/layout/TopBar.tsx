'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu,
  X,
  Bell,
  Search,
  Bitcoin,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { NetworkStatus } from '@/components/NetworkStatus'
import type { View } from './AppShell'

interface TopBarProps {
  user: any
  onLogout: () => void
  currentView: View
  setCurrentView: (view: View) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const viewTitles: Record<View, string> = {
  landing: 'Dashboard',
  wallet: 'Wallet',
  payment: 'Checkout',
  account: 'Agent Profile',
  history: 'Transaction History',
  commissions: 'Commissions',
}

export function TopBar({ 
  user, 
  onLogout, 
  currentView,
  setCurrentView,
  sidebarCollapsed,
  onToggleSidebar
}: TopBarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-auto z-40 h-14 lg:h-16 bg-background/80 backdrop-blur-xl border-b border-border"
        style={{ 
          left: 'var(--topbar-left, 0)',
          width: 'auto'
        }}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6 gap-4">
          {/* Left: Mobile Logo / Desktop Title */}
          <div className="flex items-center gap-4">
            {/* Mobile Logo */}
            <button 
              onClick={() => setCurrentView('landing')}
              className="lg:hidden flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center shadow-lg">
                <Bitcoin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">FLASH</span>
            </button>

            {/* Desktop Title */}
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">
                {viewTitles[currentView]}
              </h1>
            </div>
          </div>

          {/* Center: Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions, wallets..."
                className="pl-10 bg-secondary/50 border-border focus:border-primary h-10"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-muted-foreground"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Network Status (Desktop) */}
            <div className="hidden lg:block">
              <NetworkStatus collapsed={false} compact />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-card border-border">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu (Desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden lg:flex items-center gap-2 h-10 px-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-white max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="font-normal text-xs text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('account')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle (Sheet) */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 text-white"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col border-l border-border bg-card text-foreground">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentView('account')
                      setShowMobileMenu(false)
                    }}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help & Support
                  </Button>
                </div>

                {/* Sticky Footer */}
                <div className="p-4 border-t border-border mt-auto bg-card">
                  <NetworkStatus collapsed={false} />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-4"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Log Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-card overflow-hidden"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..."
                    className="pl-10 bg-secondary/50 border-border"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
