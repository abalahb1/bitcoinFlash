'use client'

import { Badge } from '@/components/ui/badge'
import { getTierConfig, type TierType } from '@/lib/tiers'

interface TierBadgeProps {
  tier: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function TierBadge({ tier, size = 'md', showIcon = true }: TierBadgeProps) {
  const config = getTierConfig(tier)
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <Badge 
      className={`${sizeClasses[size]} font-semibold border-2`}
      style={{
        backgroundColor: `${config.color}20`,
        borderColor: `${config.color}80`,
        color: config.color
      }}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.name}
    </Badge>
  )
}
