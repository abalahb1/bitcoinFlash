'use client'

import { Badge } from '@/components/ui/badge'
import { getTierConfig, type TierType } from '@/lib/tiers'
import { Medal, Crown, Shield } from 'lucide-react'

interface TierBadgeProps {
  tier: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const iconMap = {
  medal: Medal,
  crown: Crown,
  shield: Shield,
}

export function TierBadge({ tier, size = 'md', showIcon = true }: TierBadgeProps) {
  const config = getTierConfig(tier)
  const IconComponent = iconMap[config.iconName] || Medal

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge
      className={`${sizeClasses[size]} font-semibold border`}
      style={{
        backgroundColor: `${config.color}15`,
        borderColor: `${config.color}50`,
        color: config.color
      }}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} mr-1`} />}
      {config.name}
    </Badge>
  )
}
