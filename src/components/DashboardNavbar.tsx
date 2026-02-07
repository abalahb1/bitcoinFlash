'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  User,
  History,
  BarChart2,
  LogOut,
  Bitcoin,
  Menu,
  X,
  ChevronRight,
  Shield,
  Zap,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationBell } from '@/components/NotificationBell'

export type View = 'landing' | 'wallet' | 'payment' | 'account' | 'history' | 'commissions'

interface DashboardNavbarProps {
  currentView: View
  setCurrentView: (view: View) => void
  onLogout: () => void
  user: any // utilizing any to avoid complex type import issues, essentially UserType
}

export function DashboardNavbar({ currentView, setCurrentView, onLogout, user }: DashboardNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'landing', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'account', label: 'Agent Profile', icon: User },
    { id: 'history', label: 'Transactions', icon: History },
    { id: 'commissions', label: 'Commissions', icon: BarChart2 },
  ]

  // Mobile reordered list: Account first
  const mobileNavItems = [
    navItems[2], // Account
    navItems[0], // Dashboard
    navItems[1], // Wallet
    navItems[3], // History
    navItems[4], // Commissions
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#F7931A] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#F7931A] to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg font-bold text-white tracking-wider">BITCOIN</span>
                <span className="text-xs font-bold text-[#F7931A] tracking-[0.2em] uppercase hidden sm:block">Flash Protocol</span>
                <span className="text-xs font-bold text-[#F7931A] tracking-[0.2em] uppercase sm:hidden">FLASH</span>
              </div>
            </motion.button>

            {/* Desktop Navigation - Hidden on tablet/mobile, visible on large screens */}
            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = currentView === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`
                      relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                      flex items-center gap-2
                      ${isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#F7931A] to-yellow-600 rounded-full shadow-lg shadow-orange-900/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-current'}`} />
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Mobile/Tablet Menu Button - Visible up to Large Screens */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-50 p-2 text-white"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-8 h-8" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-8 h-8" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden bg-[#050510] pt-24 pb-8 px-6 overflow-y-auto"
          >
            <div className="flex flex-col h-full">


              {/* Navigation Links */}
              <div className="space-y-2 flex-1">
                {mobileNavItems.map((item, idx) => {
                  const isActive = currentView === item.id
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + (idx * 0.05) }}
                      onClick={() => {
                        setCurrentView(item.id as View)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`
                        w-full p-4 rounded-xl flex items-center justify-between group transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-[#F7931A]/20 to-orange-600/10 border border-[#F7931A]/30'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                          ${isActive ? 'bg-[#F7931A] text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'}
                        `}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-lg font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="activeDot" className="w-2 h-2 rounded-full bg-[#F7931A]" />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Support
                  </a>
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
                <div className="mt-6 text-center text-xs text-gray-600">
                  v3.0.4-beta • Flash Protocol
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
