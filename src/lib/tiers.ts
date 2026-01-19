// Tier configuration
export const TIER_CONFIG = {
  bronze: {
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
    name: 'Gold',
    commissionRate: 0.10, // 10%
    color: '#FFD700',
    icon: '🥇',
    features: [
      'VIP support',
      '10% commission on sales',
      'Express processing time',
      'Access to exclusive packages',
      'Dedicated account manager',
      'Early access to new features'
    ]
  }
} as const

export type TierType = keyof typeof TIER_CONFIG

export function getTierConfig(tier: string) {
  return TIER_CONFIG[tier as TierType] || TIER_CONFIG.bronze
}

export function calculateCommission(amount: number, tier: string): number {
  const config = getTierConfig(tier)
  return amount * config.commissionRate
}
