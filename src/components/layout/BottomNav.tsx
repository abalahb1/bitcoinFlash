'use client'

import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Wallet, 
  User, 
  History, 
  BarChart2
} from 'lucide-react'
import type { View } from './AppShell'

interface BottomNavProps {
  currentView: View
  setCurrentView: (view: View) => void
}

const navItems = [
  { id: 'landing', label: 'Home', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'history', label: 'History', icon: History },
  { id: 'commissions', label: 'Earn', icon: BarChart2 },
  { id: 'account', label: 'Profile', icon: User },
]

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  return (
    <nav 
      className="bg-card/95 backdrop-blur-xl border-t border-border pb-safe"
      style={{ paddingBottom: 'max(var(--safe-bottom), 8px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`
                flex flex-col items-center justify-center 
                w-16 h-14 rounded-xl
                transition-all duration-200 relative
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute inset-x-2 -top-0.5 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </motion.div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
