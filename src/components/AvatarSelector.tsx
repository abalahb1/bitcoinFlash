'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Crypto avatars using cryptocurrency logos from CryptoLogos CDN
// High quality cryptocurrency icons
export const AVATAR_SKINS = [
    // Major Cryptocurrencies
    { id: 'avatar-1', image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', label: 'Bitcoin', gradient: 'from-orange-500 to-yellow-500' },
    { id: 'avatar-2', image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', label: 'Ethereum', gradient: 'from-blue-500 to-purple-500' },
    { id: 'avatar-3', image: 'https://cryptologos.cc/logos/tether-usdt-logo.png', label: 'Tether', gradient: 'from-green-500 to-emerald-500' },
    { id: 'avatar-4', image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', label: 'BNB', gradient: 'from-yellow-500 to-amber-500' },
    { id: 'avatar-5', image: 'https://cryptologos.cc/logos/solana-sol-logo.png', label: 'Solana', gradient: 'from-purple-500 to-pink-500' },
    { id: 'avatar-6', image: 'https://cryptologos.cc/logos/xrp-xrp-logo.png', label: 'XRP', gradient: 'from-gray-600 to-gray-800' },

    // Popular Altcoins
    { id: 'avatar-7', image: 'https://cryptologos.cc/logos/cardano-ada-logo.png', label: 'Cardano', gradient: 'from-blue-600 to-blue-800' },
    { id: 'avatar-8', image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', label: 'Dogecoin', gradient: 'from-yellow-400 to-amber-600' },
    { id: 'avatar-9', image: 'https://cryptologos.cc/logos/polygon-matic-logo.png', label: 'Polygon', gradient: 'from-purple-500 to-violet-600' },
    { id: 'avatar-10', image: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', label: 'Polkadot', gradient: 'from-pink-500 to-pink-700' },
    { id: 'avatar-11', image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', label: 'Litecoin', gradient: 'from-gray-400 to-gray-600' },
    { id: 'avatar-12', image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', label: 'Avalanche', gradient: 'from-red-500 to-red-700' },

    // DeFi & Layer 2
    { id: 'avatar-13', image: 'https://cryptologos.cc/logos/chainlink-link-logo.png', label: 'Chainlink', gradient: 'from-blue-500 to-blue-700' },
    { id: 'avatar-14', image: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', label: 'Uniswap', gradient: 'from-pink-400 to-pink-600' },
    { id: 'avatar-15', image: 'https://cryptologos.cc/logos/aave-aave-logo.png', label: 'Aave', gradient: 'from-cyan-500 to-purple-600' },
    { id: 'avatar-16', image: 'https://cryptologos.cc/logos/the-graph-grt-logo.png', label: 'The Graph', gradient: 'from-purple-500 to-indigo-600' },

    // More Popular Coins
    { id: 'avatar-17', image: 'https://cryptologos.cc/logos/monero-xmr-logo.png', label: 'Monero', gradient: 'from-orange-500 to-orange-700' },
    { id: 'avatar-18', image: 'https://cryptologos.cc/logos/stellar-xlm-logo.png', label: 'Stellar', gradient: 'from-gray-800 to-black' },
    { id: 'avatar-19', image: 'https://cryptologos.cc/logos/cosmos-atom-logo.png', label: 'Cosmos', gradient: 'from-purple-600 to-indigo-800' },
    { id: 'avatar-20', image: 'https://cryptologos.cc/logos/near-protocol-near-logo.png', label: 'NEAR', gradient: 'from-gray-700 to-black' },
    { id: 'avatar-21', image: 'https://cryptologos.cc/logos/tron-trx-logo.png', label: 'TRON', gradient: 'from-red-500 to-red-700' },
    { id: 'avatar-22', image: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png', label: 'Shiba Inu', gradient: 'from-orange-400 to-red-500' },
    { id: 'avatar-23', image: 'https://cryptologos.cc/logos/aptos-apt-logo.png', label: 'Aptos', gradient: 'from-teal-500 to-cyan-600' },
    { id: 'avatar-24', image: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', label: 'Arbitrum', gradient: 'from-blue-500 to-cyan-500' },
]

export const DEFAULT_AVATAR_ID = 'avatar-1'
export const DEFAULT_AVATAR = AVATAR_SKINS[0]

export function getAvatarConfig(avatarId: string | null | undefined) {
    const found = AVATAR_SKINS.find(a => a.id === avatarId)
    return found || DEFAULT_AVATAR
}

interface AvatarSelectorProps {
    currentAvatarId: string
    onSelect: (avatarId: string) => void
    userName?: string
}

export function AvatarSelector({ currentAvatarId, onSelect, userName }: AvatarSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-2">Choose your crypto avatar</div>
            <div className="grid grid-cols-6 gap-3 max-h-[320px] overflow-y-auto pr-2">
                {AVATAR_SKINS.map((avatar) => {
                    const isSelected = currentAvatarId === avatar.id
                    return (
                        <button
                            key={avatar.id}
                            onClick={() => onSelect(avatar.id)}
                            className={cn(
                                "relative group aspect-square rounded-full transition-all duration-200",
                                "hover:scale-110 hover:shadow-lg hover:shadow-white/10",
                                isSelected
                                    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0c0c0e] scale-105"
                                    : "hover:ring-2 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#0c0c0e]"
                            )}
                        >
                            <div className={cn(
                                "w-full h-full rounded-full overflow-hidden p-2 bg-gradient-to-br",
                                avatar.gradient
                            )}>
                                <img
                                    src={avatar.image}
                                    alt={avatar.label}
                                    className="w-full h-full object-contain drop-shadow-lg"
                                    loading="lazy"
                                />
                            </div>
                            {isSelected && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                            {/* Tooltip */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {avatar.label}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

interface UserAvatarProps {
    avatarId?: string | null
    userName?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showBorder?: boolean
    className?: string
}

const sizeClasses = {
    sm: { container: 'w-8 h-8', padding: 'p-1' },
    md: { container: 'w-10 h-10', padding: 'p-1.5' },
    lg: { container: 'w-16 h-16', padding: 'p-2' },
    xl: { container: 'w-28 h-28 md:w-32 md:h-32', padding: 'p-4' },
}

export function UserAvatar({
    avatarId,
    userName = 'User',
    size = 'md',
    showBorder = false,
    className
}: UserAvatarProps) {
    const avatar = getAvatarConfig(avatarId)
    const sizeConfig = sizeClasses[size]

    return (
        <div
            className={cn(
                "rounded-full overflow-hidden bg-gradient-to-br",
                avatar.gradient,
                sizeConfig.container,
                sizeConfig.padding,
                showBorder && "ring-2 ring-white/20",
                className
            )}
        >
            <img
                src={avatar.image}
                alt={avatar.label}
                className="w-full h-full object-contain drop-shadow-lg"
            />
        </div>
    )
}

// Hook to manage avatar selection with localStorage
export function useAvatarSelection(userId?: string) {
    const storageKey = userId ? `avatar-${userId}` : 'avatar-guest'
    const [avatarId, setAvatarId] = useState<string>(DEFAULT_AVATAR_ID)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(storageKey)
        if (stored && AVATAR_SKINS.some(a => a.id === stored)) {
            setAvatarId(stored)
        }
        setIsLoaded(true)
    }, [storageKey])

    const updateAvatar = (newAvatarId: string) => {
        setAvatarId(newAvatarId)
        localStorage.setItem(storageKey, newAvatarId)
    }

    return { avatarId, updateAvatar, isLoaded }
}
