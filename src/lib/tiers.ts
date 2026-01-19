// Tier configuration
export const TIERS = {
  bronze: {
    tier: 'bronze' as const,
    name: 'Bronze',
    commissionRate: 0.05, // 5%
    color: '#CD7F32',
    icon: '🥉',
    features: [
      'Basic support',
      '5% commission on sales',
      'Standard processing time',
      'Access to basic packages'
    ]
  },
  silver: {
    tier: 'silver' as const,
    name: 'Silver',
    commissionRate: 0.07, // 7%
    color: '#C0C0C0',
    icon: '🥈',
    features: [
      'Priority support',
      '7% commission on sales',
      'Faster processing time',
      'Access to all packages',
      'Monthly performance reports'
    ]
  },
  gold: {
    tier: 'gold' as const,
    name: 'Gold',
    commissionRate: 0.10, // 10%
    color: '#FFD700',
    icon: '🥇',
    features: [
      'VIP support 24/7',
      '10% commission on sales',
      'Instant processing',
      'Access to all packages',
      'Real-time analytics',
      'Dedicated account manager',
      'Custom commission structures'
    ]
  }
} as const

export type TierType = 'bronze' | 'silver' | 'gold'

export function getTierConfig(tier: string | null | undefined) {
  if (!tier) return TIERS.bronze
  const normalizedTier = tier.toLowerCase() as TierType
  return TIERS[normalizedTier] || TIERS.bronze
}

export function calculateCommission(amount: number, tier: string): number {
  const config = getTierConfig(tier)
  return amount * config.commissionRate
}
