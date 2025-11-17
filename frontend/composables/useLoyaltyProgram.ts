/**
 * Composable for loyalty points program
 * Rewards, tiers, and points management
 */

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface LoyaltyAccount {
  user_id: string
  points_balance: number
  points_lifetime: number
  tier: MemberTier
  tier_progress: number
  next_tier: MemberTier | null
  points_to_next_tier: number
  member_since: number
  last_activity: number
}

export interface PointsTransaction {
  id: string
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund'
  amount: number
  reason: string
  order_id?: string
  created_at: number
  expires_at?: number
}

export interface Reward {
  id: string
  name: string
  description: string
  points_cost: number
  value: number
  type: 'discount' | 'free_shipping' | 'product' | 'voucher'
  image?: string
  available: boolean
  tier_requirement?: MemberTier
}

export interface TierBenefits {
  tier: MemberTier
  name: string
  color: string
  icon: string
  min_points: number
  benefits: string[]
  multiplier: number
  birthday_bonus: number
  early_access: boolean
  free_shipping_threshold?: number
}

const STORAGE_KEY = 'loyalty_account'

const TIER_CONFIG: Record<MemberTier, TierBenefits> = {
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    color: '#CD7F32',
    icon: '🥉',
    min_points: 0,
    benefits: [
      '1 point = 1 TND dépensé',
      'Récompenses exclusives',
      'Historique des points',
    ],
    multiplier: 1,
    birthday_bonus: 50,
    early_access: false,
  },
  silver: {
    tier: 'silver',
    name: 'Argent',
    color: '#C0C0C0',
    icon: '🥈',
    min_points: 1000,
    benefits: [
      '1.5 points = 1 TND dépensé',
      'Livraison gratuite dès 50 TND',
      'Bonus anniversaire +100 points',
      'Accès prioritaire support',
    ],
    multiplier: 1.5,
    birthday_bonus: 100,
    early_access: false,
    free_shipping_threshold: 50,
  },
  gold: {
    tier: 'gold',
    name: 'Or',
    color: '#FFD700',
    icon: '🥇',
    min_points: 5000,
    benefits: [
      '2 points = 1 TND dépensé',
      'Livraison gratuite dès 30 TND',
      'Bonus anniversaire +200 points',
      'Accès anticipé aux ventes',
      'Récompenses exclusives Gold',
    ],
    multiplier: 2,
    birthday_bonus: 200,
    early_access: true,
    free_shipping_threshold: 30,
  },
  platinum: {
    tier: 'platinum',
    name: 'Platine',
    color: '#E5E4E2',
    icon: '💎',
    min_points: 10000,
    benefits: [
      '3 points = 1 TND dépensé',
      'Livraison gratuite toujours',
      'Bonus anniversaire +500 points',
      'Accès VIP anticipé',
      'Récompenses exclusives Platinum',
      'Manager compte dédié',
    ],
    multiplier: 3,
    birthday_bonus: 500,
    early_access: true,
    free_shipping_threshold: 0,
  },
}

export const useLoyaltyProgram = () => {
  const config = useRuntimeConfig()
  const account = ref<LoyaltyAccount | null>(null)
  const transactions = ref<PointsTransaction[]>([])
  const rewards = ref<Reward[]>([])
  const loading = ref(false)

  /**
   * Fetch loyalty account
   */
  const fetchAccount = async (): Promise<LoyaltyAccount | null> => {
    loading.value = true

    try {
      const response = await $fetch<{ account: LoyaltyAccount }>(
        `${config.public.apiBase}/loyalty/account`
      )

      account.value = response.account
      saveToStorage()

      return account.value
    } catch (error) {
      console.error('Failed to fetch loyalty account:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch points history
   */
  const fetchTransactions = async (options: {
    type?: PointsTransaction['type']
    limit?: number
  } = {}): Promise<PointsTransaction[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ transactions: PointsTransaction[] }>(
        `${config.public.apiBase}/loyalty/transactions`,
        {
          params: {
            type: options.type,
            limit: options.limit || 50,
          },
        }
      )

      transactions.value = response.transactions || []
      return transactions.value
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch available rewards
   */
  const fetchRewards = async (tierFilter?: MemberTier): Promise<Reward[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ rewards: Reward[] }>(
        `${config.public.apiBase}/loyalty/rewards`,
        {
          params: { tier: tierFilter },
        }
      )

      rewards.value = response.rewards || []
      return rewards.value
    } catch (error) {
      console.error('Failed to fetch rewards:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Redeem a reward
   */
  const redeemReward = async (rewardId: string): Promise<boolean> => {
    if (!account.value) return false

    loading.value = true

    try {
      const reward = rewards.value.find(r => r.id === rewardId)
      if (!reward) return false

      if (account.value.points_balance < reward.points_cost) {
        throw new Error('Solde de points insuffisant')
      }

      await $fetch(`${config.public.apiBase}/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
      })

      // Update balance
      account.value.points_balance -= reward.points_cost

      // Add transaction
      transactions.value.unshift({
        id: `trans-${Date.now()}`,
        type: 'redeem',
        amount: -reward.points_cost,
        reason: `Échange: ${reward.name}`,
        created_at: Date.now(),
      })

      saveToStorage()
      return true
    } catch (error) {
      console.error('Failed to redeem reward:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculate points earned from purchase
   */
  const calculatePointsEarned = (amount: number, tier?: MemberTier): number => {
    const currentTier = tier || account.value?.tier || 'bronze'
    const multiplier = TIER_CONFIG[currentTier].multiplier
    return Math.floor(amount * multiplier)
  }

  /**
   * Get tier benefits
   */
  const getTierBenefits = (tier: MemberTier): TierBenefits => {
    return TIER_CONFIG[tier]
  }

  /**
   * Get current tier benefits
   */
  const getCurrentTierBenefits = (): TierBenefits | null => {
    if (!account.value) return null
    return getTierBenefits(account.value.tier)
  }

  /**
   * Get next tier benefits
   */
  const getNextTierBenefits = (): TierBenefits | null => {
    if (!account.value || !account.value.next_tier) return null
    return getTierBenefits(account.value.next_tier)
  }

  /**
   * Get tier progress percentage
   */
  const getTierProgress = (): number => {
    if (!account.value) return 0
    return account.value.tier_progress
  }

  /**
   * Convert points to currency value
   */
  const pointsToValue = (points: number): number => {
    // 100 points = 1 TND
    return points / 100
  }

  /**
   * Convert currency to points
   */
  const valueToPoints = (value: number): number => {
    // 1 TND = 100 points
    return value * 100
  }

  /**
   * Check if can redeem reward
   */
  const canRedeem = (reward: Reward): boolean => {
    if (!account.value) return false
    if (!reward.available) return false
    if (account.value.points_balance < reward.points_cost) return false
    if (reward.tier_requirement) {
      const tierOrder: MemberTier[] = ['bronze', 'silver', 'gold', 'platinum']
      const currentTierIndex = tierOrder.indexOf(account.value.tier)
      const requiredTierIndex = tierOrder.indexOf(reward.tier_requirement)
      if (currentTierIndex < requiredTierIndex) return false
    }
    return true
  }

  /**
   * Get expiring points (within 30 days)
   */
  const getExpiringPoints = (): number => {
    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000

    return transactions.value
      .filter(t =>
        t.type === 'earn' &&
        t.expires_at &&
        t.expires_at < thirtyDaysFromNow &&
        t.expires_at > Date.now()
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  /**
   * Get transaction summary by type
   */
  const getTransactionSummary = (): Record<string, number> => {
    const summary: Record<string, number> = {
      earned: 0,
      redeemed: 0,
      expired: 0,
      bonus: 0,
    }

    transactions.value.forEach(t => {
      if (t.type === 'earn') summary.earned += t.amount
      if (t.type === 'redeem') summary.redeemed += Math.abs(t.amount)
      if (t.type === 'expire') summary.expired += Math.abs(t.amount)
      if (t.type === 'bonus') summary.bonus += t.amount
    })

    return summary
  }

  /**
   * Format transaction date
   */
  const formatTransactionDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  /**
   * Get transaction icon
   */
  const getTransactionIcon = (type: PointsTransaction['type']): string => {
    const icons = {
      earn: '➕',
      redeem: '➖',
      expire: '⏰',
      bonus: '🎁',
      refund: '↩️',
    }
    return icons[type] || '•'
  }

  /**
   * Get transaction color
   */
  const getTransactionColor = (type: PointsTransaction['type']): string => {
    const colors = {
      earn: 'text-green-600',
      redeem: 'text-red-600',
      expire: 'text-gray-600',
      bonus: 'text-purple-600',
      refund: 'text-blue-600',
    }
    return colors[type] || 'text-gray-600'
  }

  /**
   * Get tier color class
   */
  const getTierColorClass = (tier: MemberTier): string => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get affordable rewards
   */
  const getAffordableRewards = (): Reward[] => {
    if (!account.value) return []
    return rewards.value.filter(r =>
      canRedeem(r)
    )
  }

  /**
   * Get rewards by type
   */
  const getRewardsByType = (type: Reward['type']): Reward[] => {
    return rewards.value.filter(r => r.type === type)
  }

  /**
   * Calculate days until points expire
   */
  const getDaysUntilExpiry = (transaction: PointsTransaction): number | null => {
    if (!transaction.expires_at) return null
    const diff = transaction.expires_at - Date.now()
    return Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  /**
   * Get member status text
   */
  const getMemberStatus = (): string => {
    if (!account.value) return 'Non membre'

    const tierName = getTierBenefits(account.value.tier).name
    const nextTier = account.value.next_tier

    if (!nextTier) {
      return `${tierName} - Niveau Maximum`
    }

    const pointsNeeded = account.value.points_to_next_tier
    return `${tierName} - ${pointsNeeded} points pour ${getTierBenefits(nextTier).name}`
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client || !account.value) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.value))
    } catch (error) {
      console.error('Failed to save loyalty account:', error)
    }
  }

  /**
   * Load from localStorage
   */
  const loadFromStorage = () => {
    if (!process.client) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        account.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load loyalty account:', error)
    }
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    account: readonly(account),
    transactions: readonly(transactions),
    rewards: readonly(rewards),
    loading: readonly(loading),
    fetchAccount,
    fetchTransactions,
    fetchRewards,
    redeemReward,
    calculatePointsEarned,
    getTierBenefits,
    getCurrentTierBenefits,
    getNextTierBenefits,
    getTierProgress,
    pointsToValue,
    valueToPoints,
    canRedeem,
    getExpiringPoints,
    getTransactionSummary,
    formatTransactionDate,
    getTransactionIcon,
    getTransactionColor,
    getTierColorClass,
    getAffordableRewards,
    getRewardsByType,
    getDaysUntilExpiry,
    getMemberStatus,
  }
}
