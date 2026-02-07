'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'

interface Notification {
    id: string
    type: 'info' | 'success' | 'warning'
    title: string
    message: string
    time: string
    read: boolean
}

const initialNotifications: Notification[] = [
    {
        id: '1',
        type: 'success',
        title: 'System Update',
        message: 'New nodes added in Europe for improved speed',
        time: '5 minutes ago',
        read: false
    },
    {
        id: '2',
        type: 'info',
        title: 'Low Network Fees',
        message: 'Now is the ideal time for transactions',
        time: '15 minutes ago',
        read: false
    }
]

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const iconMap = {
        info: Info,
        success: CheckCircle,
        warning: AlertTriangle
    }

    const colorMap = {
        info: 'text-cyan-400 bg-cyan-500/10',
        success: 'text-emerald-400 bg-emerald-500/10',
        warning: 'text-yellow-400 bg-yellow-500/10'
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute left-0 mt-2 w-80 bg-[#0c0c0e] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notification => {
                                    const Icon = iconMap[notification.type]
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${notification.read ? 'bg-transparent' : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`p-2 rounded-lg ${colorMap[notification.type]} flex-shrink-0 h-fit`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                                                    <p className="text-xs text-gray-600 mt-2">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
