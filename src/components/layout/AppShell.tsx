'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

// Types
export type View = 'landing' | 'wallet' | 'payment' | 'account' | 'history' | 'commissions'

interface AppShellContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  currentView: View
  setCurrentView: (view: View) => void
  isMobile: boolean
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined)

export function useAppShell() {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider')
  }
  return context
}

interface AppShellProps {
  children: ReactNode
  user: any
  currentView: View
  setCurrentView: (view: View) => void
  onLogout: () => void
}

export function AppShell({ 
  children, 
  user, 
  currentView, 
  setCurrentView, 
  onLogout 
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const contextValue: AppShellContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    currentView,
    setCurrentView,
    isMobile,
  }

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen-safe flex flex-col bg-background">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
          <Sidebar
            user={user}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onLogout={onLogout}
          />
        </div>

        {/* Main Content Area */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            !isMobile ? (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]') : ''
          }`}
        >
          {/* Top Bar */}
          <TopBar 
            user={user}
            onLogout={onLogout}
            currentView={currentView}
            setCurrentView={setCurrentView}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Page Content */}
          <main className="flex-1 pt-16 pb-20 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="container mx-auto container-padding py-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50">
          <BottomNav
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>
      </div>
    </AppShellContext.Provider>
  )
}
