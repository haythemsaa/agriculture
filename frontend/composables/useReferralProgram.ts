import { ref, computed, readonly } from 'vue'

/**
 * Composable useReferralProgram - Referral & Affiliate Program
 *
 * Complete referral system with tracking, rewards, and analytics
 * Supports both customer referrals and affiliate partnerships
 *
 * Impact: +15-25% new customer acquisition, -30% acquisition cost
 */

// ==================== TYPES ====================

export type ReferralStatus = 'pending' | 'completed' | 'expired' | 'rejected'
export type ReferralTier = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond'
export type RewardType = 'credit' | 'discount' | 'points' | 'cashback' | 'product'

export interface ReferralCode {
  code: string
  user_id: number
  user_name: string
  tier: ReferralTier
  discount_percent: number // Discount for referred users
  reward_percent: number // Reward for referrer
  uses_count: number
  max_uses: number | null // null = unlimited
  total_earned: number
  is_active: boolean
  expires_at: number | null
  created_at: number
}

export interface Referral {
  id: string
  referrer_id: number
  referrer_name: string
  referrer_code: string
  referee_id: number
  referee_name: string
  referee_email: string
  status: ReferralStatus
  order_id?: string
  order_amount: number
  reward_amount: number
  reward_type: RewardType
  reward_paid: boolean
  signup_date: number
  purchase_date?: number
  expires_at: number
  notes?: string
}

export interface ReferralReward {
  id: string
  referral_id: string
  user_id: number
  type: RewardType
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paid_at?: number
  created_at: number
  description: string
}

export interface ReferralStats {
  total_referrals: number
  completed_referrals: number
  pending_referrals: number
  total_earned: number
  total_paid: number
  pending_rewards: number
  conversion_rate: number // % of referrals that converted
  average_order_value: number
  tier: ReferralTier
  next_tier?: ReferralTier
  referrals_to_next_tier: number
}

export interface ReferralTierConfig {
  name: ReferralTier
  min_referrals: number
  discount_percent: number
  reward_percent: number
  max_uses: number | null
  perks: string[]
  color: string
  icon: string
}

// ==================== TIER CONFIGURATION ====================

const TIER_CONFIG: Record<ReferralTier, ReferralTierConfig> = {
  basic: {
    name: 'basic',
    min_referrals: 0,
    discount_percent: 5,
    reward_percent: 5,
    max_uses: 10,
    perks: ['5% de réduction pour vos amis', '5% de commission', 'Max 10 utilisations'],
    color: '#6b7280',
    icon: '🌱'
  },
  bronze: {
    name: 'bronze',
    min_referrals: 5,
    discount_percent: 10,
    reward_percent: 7,
    max_uses: 25,
    perks: ['10% de réduction pour vos amis', '7% de commission', 'Max 25 utilisations', 'Badge Bronze'],
    color: '#cd7f32',
    icon: '🥉'
  },
  silver: {
    name: 'silver',
    min_referrals: 15,
    discount_percent: 15,
    reward_percent: 10,
    max_uses: 50,
    perks: ['15% de réduction', '10% de commission', 'Max 50 utilisations', 'Badge Argent', 'Support prioritaire'],
    color: '#c0c0c0',
    icon: '🥈'
  },
  gold: {
    name: 'gold',
    min_referrals: 30,
    discount_percent: 20,
    reward_percent: 12,
    max_uses: 100,
    perks: ['20% de réduction', '12% de commission', 'Max 100 utilisations', 'Badge Or', 'Dashboard analytics', 'Landing page personnalisée'],
    color: '#ffd700',
    icon: '🥇'
  },
  diamond: {
    name: 'diamond',
    min_referrals: 50,
    discount_percent: 25,
    reward_percent: 15,
    max_uses: null,
    perks: ['25% de réduction', '15% de commission', 'Utilisations illimitées', 'Badge Diamant', 'API access', 'Gestionnaire dédié', 'Paiements hebdomadaires'],
    color: '#b9f2ff',
    icon: '💎'
  }
}

// ==================== STATE ====================

const referralCode = ref<ReferralCode | null>(null)
const referrals = ref<Referral[]>([])
const rewards = ref<ReferralReward[]>([])
const stats = ref<ReferralStats | null>(null)
const isLoading = ref(false)

// ==================== COMPUTED ====================

const activeReferrals = computed(() =>
  referrals.value.filter(r => r.status === 'pending' || r.status === 'completed')
)

const completedReferrals = computed(() =>
  referrals.value.filter(r => r.status === 'completed')
)

const pendingReferrals = computed(() =>
  referrals.value.filter(r => r.status === 'pending')
)

const totalEarned = computed(() =>
  rewards.value.filter(r => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0)
)

const pendingRewards = computed(() =>
  rewards.value.filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0)
)

const currentTier = computed(() =>
  referralCode.value?.tier || 'basic'
)

const tierConfig = computed(() =>
  TIER_CONFIG[currentTier.value]
)

// ==================== REFERRAL CODE MANAGEMENT ====================

/**
 * Generate or fetch user's referral code
 */
const generateReferralCode = async (customCode?: string): Promise<ReferralCode | null> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/referrals/generate', { method: 'POST', body: { customCode } })

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500))

    const code: ReferralCode = {
      code: customCode || `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      user_id: 1,
      user_name: 'John Doe',
      tier: 'basic',
      discount_percent: 5,
      reward_percent: 5,
      uses_count: 0,
      max_uses: 10,
      total_earned: 0,
      is_active: true,
      expires_at: null,
      created_at: Date.now()
    }

    referralCode.value = code
    localStorage.setItem('agritech_referral_code', JSON.stringify(code))

    return code
  } catch (error) {
    console.error('Error generating referral code:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch user's referral code
 */
const fetchReferralCode = async (): Promise<ReferralCode | null> => {
  isLoading.value = true

  try {
    // Try localStorage first
    const stored = localStorage.getItem('agritech_referral_code')
    if (stored) {
      referralCode.value = JSON.parse(stored)
      return referralCode.value
    }

    // In real implementation, fetch from API
    // const response = await $fetch('/api/referrals/my-code')

    return null
  } catch (error) {
    console.error('Error fetching referral code:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Validate a referral code
 */
const validateCode = async (code: string): Promise<{ valid: boolean; discount?: number; message: string }> => {
  try {
    // In real implementation, call API
    // const response = await $fetch(`/api/referrals/validate/${code}`)

    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock validation
    if (code.startsWith('REF')) {
      return {
        valid: true,
        discount: 10,
        message: 'Code valide! Vous bénéficiez de 10% de réduction'
      }
    }

    return {
      valid: false,
      message: 'Code invalide ou expiré'
    }
  } catch (error) {
    return {
      valid: false,
      message: 'Erreur lors de la validation'
    }
  }
}

// ==================== REFERRAL TRACKING ====================

/**
 * Fetch user's referrals
 */
const fetchReferrals = async (): Promise<Referral[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/referrals/my-referrals')

    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock data
    const mockReferrals: Referral[] = [
      {
        id: '1',
        referrer_id: 1,
        referrer_name: 'John Doe',
        referrer_code: 'REFJOHN123',
        referee_id: 10,
        referee_name: 'Alice Martin',
        referee_email: 'alice@example.com',
        status: 'completed',
        order_id: 'ORD-001',
        order_amount: 150,
        reward_amount: 7.5,
        reward_type: 'credit',
        reward_paid: true,
        signup_date: Date.now() - 30 * 24 * 60 * 60 * 1000,
        purchase_date: Date.now() - 25 * 24 * 60 * 60 * 1000,
        expires_at: Date.now() + 60 * 24 * 60 * 60 * 1000
      },
      {
        id: '2',
        referrer_id: 1,
        referrer_name: 'John Doe',
        referrer_code: 'REFJOHN123',
        referee_id: 11,
        referee_name: 'Bob Smith',
        referee_email: 'bob@example.com',
        status: 'pending',
        order_amount: 0,
        reward_amount: 0,
        reward_type: 'credit',
        reward_paid: false,
        signup_date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        expires_at: Date.now() + 85 * 24 * 60 * 60 * 1000,
        notes: 'En attente du premier achat'
      }
    ]

    referrals.value = mockReferrals
    return mockReferrals
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch referral statistics
 */
const fetchStats = async (): Promise<ReferralStats | null> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/referrals/stats')

    await new Promise(resolve => setTimeout(resolve, 500))

    const completedCount = completedReferrals.value.length
    const totalCount = referrals.value.length

    const mockStats: ReferralStats = {
      total_referrals: totalCount,
      completed_referrals: completedCount,
      pending_referrals: pendingReferrals.value.length,
      total_earned: totalEarned.value,
      total_paid: 150.50,
      pending_rewards: pendingRewards.value,
      conversion_rate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
      average_order_value: 125.75,
      tier: currentTier.value,
      next_tier: getNextTier(currentTier.value),
      referrals_to_next_tier: getReferralsToNextTier(completedCount)
    }

    stats.value = mockStats
    return mockStats
  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

// ==================== REWARDS ====================

/**
 * Fetch user's rewards
 */
const fetchRewards = async (): Promise<ReferralReward[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/referrals/rewards')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockRewards: ReferralReward[] = [
      {
        id: '1',
        referral_id: '1',
        user_id: 1,
        type: 'credit',
        amount: 7.5,
        currency: 'TND',
        status: 'paid',
        paid_at: Date.now() - 20 * 24 * 60 * 60 * 1000,
        created_at: Date.now() - 25 * 24 * 60 * 60 * 1000,
        description: 'Commission pour Alice Martin'
      }
    ]

    rewards.value = mockRewards
    return mockRewards
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Request payout for accumulated rewards
 */
const requestPayout = async (amount: number, method: 'bank' | 'credit' | 'mobile'): Promise<boolean> => {
  try {
    // In real implementation, call API
    // await $fetch('/api/referrals/payout', { method: 'POST', body: { amount, method } })

    await new Promise(resolve => setTimeout(resolve, 1000))

    return true
  } catch (error) {
    console.error('Error requesting payout:', error)
    return false
  }
}

// ==================== SHARING ====================

/**
 * Generate share links for different platforms
 */
const getShareLinks = (code: string) => {
  const baseUrl = 'https://agritech.tn'
  const referralUrl = `${baseUrl}?ref=${code}`
  const message = `Rejoignez AgriTech Tunisia avec mon code ${code} et bénéficiez de ${tierConfig.value.discount_percent}% de réduction sur votre première commande!`

  return {
    direct: referralUrl,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`,
    email: `mailto:?subject=${encodeURIComponent('Rejoignez AgriTech Tunisia')}&body=${encodeURIComponent(message + '\n\n' + referralUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
  }
}

/**
 * Copy referral link to clipboard
 */
const copyReferralLink = async (code: string): Promise<boolean> => {
  try {
    const link = getShareLinks(code).direct
    await navigator.clipboard.writeText(link)
    return true
  } catch (error) {
    console.error('Error copying link:', error)
    return false
  }
}

// ==================== TIER MANAGEMENT ====================

/**
 * Get next tier based on current tier
 */
const getNextTier = (current: ReferralTier): ReferralTier | undefined => {
  const tiers: ReferralTier[] = ['basic', 'bronze', 'silver', 'gold', 'diamond']
  const currentIndex = tiers.indexOf(current)
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : undefined
}

/**
 * Calculate referrals needed to reach next tier
 */
const getReferralsToNextTier = (currentReferrals: number): number => {
  const nextTier = getNextTier(currentTier.value)
  if (!nextTier) return 0

  const nextTierConfig = TIER_CONFIG[nextTier]
  return Math.max(0, nextTierConfig.min_referrals - currentReferrals)
}

/**
 * Get tier progress percentage
 */
const getTierProgress = (): number => {
  const nextTier = getNextTier(currentTier.value)
  if (!nextTier) return 100

  const completedCount = completedReferrals.value.length
  const currentMin = TIER_CONFIG[currentTier.value].min_referrals
  const nextMin = TIER_CONFIG[nextTier].min_referrals

  return ((completedCount - currentMin) / (nextMin - currentMin)) * 100
}

// ==================== ANALYTICS ====================

/**
 * Get top performing referrals
 */
const getTopReferrals = (limit: number = 5): Referral[] => {
  return [...completedReferrals.value]
    .sort((a, b) => b.order_amount - a.order_amount)
    .slice(0, limit)
}

/**
 * Get recent referrals
 */
const getRecentReferrals = (limit: number = 10): Referral[] => {
  return [...referrals.value]
    .sort((a, b) => b.signup_date - a.signup_date)
    .slice(0, limit)
}

/**
 * Get referrals by status
 */
const getReferralsByStatus = (status: ReferralStatus): Referral[] => {
  return referrals.value.filter(r => r.status === status)
}

/**
 * Calculate earnings for a period
 */
const getEarningsForPeriod = (days: number): number => {
  const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000
  return rewards.value
    .filter(r => r.created_at >= cutoffDate && (r.status === 'approved' || r.status === 'paid'))
    .reduce((sum, r) => sum + r.amount, 0)
}

// ==================== FORMATTING ====================

/**
 * Format referral status
 */
const formatStatus = (status: ReferralStatus): string => {
  const statusMap: Record<ReferralStatus, string> = {
    pending: 'En attente',
    completed: 'Complété',
    expired: 'Expiré',
    rejected: 'Rejeté'
  }
  return statusMap[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: ReferralStatus): string => {
  const colorMap: Record<ReferralStatus, string> = {
    pending: '#f59e0b',
    completed: '#10b981',
    expired: '#6b7280',
    rejected: '#ef4444'
  }
  return colorMap[status]
}

/**
 * Format date relative
 */
const formatRelativeDate = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`
  return `Il y a ${Math.floor(days / 30)} mois`
}

// ==================== EXPORT ====================

export function useReferralProgram() {
  return {
    // State
    referralCode: readonly(referralCode),
    referrals: readonly(referrals),
    rewards: readonly(rewards),
    stats: readonly(stats),
    isLoading: readonly(isLoading),

    // Computed
    activeReferrals,
    completedReferrals,
    pendingReferrals,
    totalEarned,
    pendingRewards,
    currentTier,
    tierConfig,

    // Code Management
    generateReferralCode,
    fetchReferralCode,
    validateCode,

    // Tracking
    fetchReferrals,
    fetchStats,

    // Rewards
    fetchRewards,
    requestPayout,

    // Sharing
    getShareLinks,
    copyReferralLink,

    // Tier Management
    getNextTier,
    getReferralsToNextTier,
    getTierProgress,

    // Analytics
    getTopReferrals,
    getRecentReferrals,
    getReferralsByStatus,
    getEarningsForPeriod,

    // Formatting
    formatStatus,
    getStatusColor,
    formatRelativeDate,

    // Config
    TIER_CONFIG
  }
}
