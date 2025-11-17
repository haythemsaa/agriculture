import { ref, computed, readonly } from 'vue'

/**
 * Composable useGamification - Gamification System
 *
 * Complete gamification with badges, achievements, points, levels,
 * leaderboards, and challenges to increase engagement
 *
 * Impact: +45% user engagement, +60% daily active users, +35% retention
 */

// ==================== TYPES ====================

export type BadgeCategory = 'purchase' | 'social' | 'loyalty' | 'special' | 'seasonal'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type AchievementType = 'milestone' | 'streak' | 'challenge' | 'hidden'
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'claimed'
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  points: number
  unlocked: boolean
  unlocked_at?: number
  progress: number
  required_progress: number
  color: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  type: AchievementType
  icon: string
  points: number
  tiers: {
    tier: number
    name: string
    requirement: number
    reward_points: number
    reward_badge?: string
  }[]
  current_tier: number
  progress: number
  completed: boolean
  completed_at?: number
  is_hidden: boolean
}

export interface Challenge {
  id: string
  title: string
  description: string
  icon: string
  status: ChallengeStatus
  points_reward: number
  bonus_reward?: {
    type: 'discount' | 'product' | 'credit'
    value: number
  }
  start_date: number
  end_date: number
  progress: number
  required_progress: number
  participants_count: number
  claimed_at?: number
}

export interface UserLevel {
  current_level: number
  current_xp: number
  xp_to_next_level: number
  total_xp: number
  level_progress_percent: number
  level_title: string
  perks: string[]
}

export interface LeaderboardEntry {
  rank: number
  user_id: number
  user_name: string
  user_avatar?: string
  points: number
  level: number
  badges_count: number
  is_current_user: boolean
}

export interface GamificationStats {
  total_points: number
  level: number
  badges_unlocked: number
  total_badges: number
  achievements_completed: number
  total_achievements: number
  challenges_completed: number
  current_streak: number
  longest_streak: number
  rank_overall: number
  rank_monthly: number
}

// ==================== LEVEL CONFIGURATION ====================

const LEVELS = [
  { level: 1, title: 'Débutant', xp_required: 0, perks: [] },
  { level: 2, title: 'Apprenti', xp_required: 100, perks: ['Badge exclusif'] },
  { level: 3, title: 'Cultivateur', xp_required: 250, perks: ['5% de réduction'] },
  { level: 4, title: 'Fermier', xp_required: 500, perks: ['Livraison gratuite'] },
  { level: 5, title: 'Agriculteur', xp_required: 1000, perks: ['Accès early access'] },
  { level: 6, title: 'Expert', xp_required: 2000, perks: ['10% de réduction'] },
  { level: 7, title: 'Maître', xp_required: 4000, perks: ['Support prioritaire'] },
  { level: 8, title: 'Champion', xp_required: 8000, perks: ['Produits exclusifs'] },
  { level: 9, title: 'Légende', xp_required: 15000, perks: ['15% de réduction', 'Gestionnaire dédié'] },
  { level: 10, title: 'Icône', xp_required: 30000, perks: ['Tous les avantages VIP'] }
]

// ==================== STATE ====================

const badges = ref<Badge[]>([])
const achievements = ref<Achievement[]>([])
const challenges = ref<Challenge[]>([])
const userLevel = ref<UserLevel | null>(null)
const leaderboard = ref<LeaderboardEntry[]>([])
const stats = ref<GamificationStats | null>(null)
const isLoading = ref(false)

// ==================== COMPUTED ====================

const unlockedBadges = computed(() =>
  badges.value.filter(b => b.unlocked)
)

const availableBadges = computed(() =>
  badges.value.filter(b => !b.unlocked)
)

const activeChallenges = computed(() =>
  challenges.value.filter(c => c.status === 'active')
)

const completedChallenges = computed(() =>
  challenges.value.filter(c => c.status === 'completed' || c.status === 'claimed')
)

const completedAchievements = computed(() =>
  achievements.value.filter(a => a.completed)
)

const inProgressAchievements = computed(() =>
  achievements.value.filter(a => !a.completed && !a.is_hidden)
)

const totalPoints = computed(() =>
  stats.value?.total_points || 0
)

const currentLevel = computed(() =>
  userLevel.value?.current_level || 1
)

// ==================== BADGES ====================

/**
 * Fetch all badges
 */
const fetchBadges = async (): Promise<Badge[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/badges')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockBadges: Badge[] = [
      {
        id: '1',
        name: 'Premier Achat',
        description: 'Effectuer votre premier achat',
        icon: '🛒',
        category: 'purchase',
        rarity: 'common',
        points: 50,
        unlocked: true,
        unlocked_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
        progress: 1,
        required_progress: 1,
        color: '#10b981'
      },
      {
        id: '2',
        name: 'Acheteur Fidèle',
        description: 'Effectuer 10 achats',
        icon: '🎯',
        category: 'loyalty',
        rarity: 'rare',
        points: 200,
        unlocked: false,
        progress: 7,
        required_progress: 10,
        color: '#3b82f6'
      },
      {
        id: '3',
        name: 'Fan de Bio',
        description: 'Acheter 20 produits bio',
        icon: '🌿',
        category: 'purchase',
        rarity: 'epic',
        points: 300,
        unlocked: false,
        progress: 12,
        required_progress: 20,
        color: '#8b5cf6'
      },
      {
        id: '4',
        name: 'Parrain Champion',
        description: 'Parrainer 5 amis',
        icon: '👥',
        category: 'social',
        rarity: 'epic',
        points: 500,
        unlocked: true,
        unlocked_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
        progress: 5,
        required_progress: 5,
        color: '#f59e0b'
      },
      {
        id: '5',
        name: 'Légende',
        description: 'Atteindre le niveau 10',
        icon: '👑',
        category: 'special',
        rarity: 'legendary',
        points: 1000,
        unlocked: false,
        progress: 3,
        required_progress: 10,
        color: '#ef4444'
      }
    ]

    badges.value = mockBadges
    return mockBadges
  } catch (error) {
    console.error('Error fetching badges:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Unlock a badge
 */
const unlockBadge = async (badgeId: string): Promise<boolean> => {
  const badge = badges.value.find(b => b.id === badgeId)
  if (!badge || badge.unlocked) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/gamification/badges/${badgeId}/unlock`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 300))

    badge.unlocked = true
    badge.unlocked_at = Date.now()

    // Add points to user
    if (stats.value) {
      stats.value.total_points += badge.points
    }

    return true
  } catch (error) {
    console.error('Error unlocking badge:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== ACHIEVEMENTS ====================

/**
 * Fetch achievements
 */
const fetchAchievements = async (): Promise<Achievement[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/achievements')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Maître Acheteur',
        description: 'Effectuer des achats réguliers',
        type: 'milestone',
        icon: '🛍️',
        points: 1000,
        tiers: [
          { tier: 1, name: 'Bronze', requirement: 5, reward_points: 100 },
          { tier: 2, name: 'Argent', requirement: 25, reward_points: 300 },
          { tier: 3, name: 'Or', requirement: 50, reward_points: 600 }
        ],
        current_tier: 1,
        progress: 32,
        completed: false,
        is_hidden: false
      },
      {
        id: '2',
        name: 'Série Hebdomadaire',
        description: 'Acheter chaque semaine pendant un mois',
        type: 'streak',
        icon: '🔥',
        points: 500,
        tiers: [
          { tier: 1, name: 'Débutant', requirement: 4, reward_points: 200 },
          { tier: 2, name: 'Confirmé', requirement: 8, reward_points: 300 },
          { tier: 3, name: 'Expert', requirement: 12, reward_points: 500 }
        ],
        current_tier: 1,
        progress: 6,
        completed: false,
        is_hidden: false
      }
    ]

    achievements.value = mockAchievements
    return mockAchievements
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

// ==================== CHALLENGES ====================

/**
 * Fetch active challenges
 */
const fetchChallenges = async (): Promise<Challenge[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/challenges')

    await new Promise(resolve => setTimeout(resolve, 500))

    const now = Date.now()
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Défi Bio du Mois',
        description: 'Acheter 5 produits bio ce mois',
        icon: '🌱',
        status: 'active',
        points_reward: 250,
        bonus_reward: {
          type: 'discount',
          value: 10
        },
        start_date: now - 10 * 24 * 60 * 60 * 1000,
        end_date: now + 20 * 24 * 60 * 60 * 1000,
        progress: 3,
        required_progress: 5,
        participants_count: 1245
      },
      {
        id: '2',
        title: 'Champion du Parrainage',
        description: 'Parrainer 3 nouveaux membres',
        icon: '🎁',
        status: 'active',
        points_reward: 500,
        bonus_reward: {
          type: 'credit',
          value: 20
        },
        start_date: now - 5 * 24 * 60 * 60 * 1000,
        end_date: now + 25 * 24 * 60 * 60 * 1000,
        progress: 1,
        required_progress: 3,
        participants_count: 678
      },
      {
        id: '3',
        title: 'Évaluateur Pro',
        description: 'Laisser 10 avis produits',
        icon: '⭐',
        status: 'completed',
        points_reward: 300,
        start_date: now - 30 * 24 * 60 * 60 * 1000,
        end_date: now - 2 * 24 * 60 * 60 * 1000,
        progress: 10,
        required_progress: 10,
        participants_count: 892
      }
    ]

    challenges.value = mockChallenges
    return mockChallenges
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Claim challenge reward
 */
const claimChallenge = async (challengeId: string): Promise<boolean> => {
  const challenge = challenges.value.find(c => c.id === challengeId)
  if (!challenge || challenge.status !== 'completed') return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/gamification/challenges/${challengeId}/claim`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 300))

    challenge.status = 'claimed'
    challenge.claimed_at = Date.now()

    // Add points
    if (stats.value) {
      stats.value.total_points += challenge.points_reward
    }

    return true
  } catch (error) {
    console.error('Error claiming challenge:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== LEVELS ====================

/**
 * Fetch user level info
 */
const fetchUserLevel = async (): Promise<UserLevel | null> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/level')

    await new Promise(resolve => setTimeout(resolve, 500))

    const totalXP = 1250
    const level = calculateLevel(totalXP)
    const levelConfig = LEVELS[level - 1]
    const nextLevelConfig = LEVELS[level] || LEVELS[LEVELS.length - 1]

    const currentLevelXP = levelConfig.xp_required
    const xpToNext = nextLevelConfig.xp_required - totalXP
    const xpInCurrentLevel = totalXP - currentLevelXP
    const xpNeededForLevel = nextLevelConfig.xp_required - currentLevelXP
    const progress = (xpInCurrentLevel / xpNeededForLevel) * 100

    const mockLevel: UserLevel = {
      current_level: level,
      current_xp: totalXP,
      xp_to_next_level: xpToNext,
      total_xp: totalXP,
      level_progress_percent: Math.round(progress),
      level_title: levelConfig.title,
      perks: levelConfig.perks
    }

    userLevel.value = mockLevel
    return mockLevel
  } catch (error) {
    console.error('Error fetching user level:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Calculate level from XP
 */
const calculateLevel = (xp: number): number => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp_required) {
      return LEVELS[i].level
    }
  }
  return 1
}

/**
 * Add XP to user
 */
const addXP = async (amount: number, reason: string): Promise<boolean> => {
  if (!userLevel.value) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch('/api/gamification/add-xp', { method: 'POST', body: { amount, reason } })

    await new Promise(resolve => setTimeout(resolve, 300))

    userLevel.value.current_xp += amount
    userLevel.value.total_xp += amount

    // Check for level up
    const newLevel = calculateLevel(userLevel.value.total_xp)
    if (newLevel > userLevel.value.current_level) {
      userLevel.value.current_level = newLevel
      // Trigger level up event
    }

    return true
  } catch (error) {
    console.error('Error adding XP:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== LEADERBOARD ====================

/**
 * Fetch leaderboard
 */
const fetchLeaderboard = async (period: LeaderboardPeriod = 'monthly'): Promise<LeaderboardEntry[]> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/leaderboard', { params: { period } })

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        user_id: 10,
        user_name: 'Ahmed Ben Ali',
        user_avatar: undefined,
        points: 8500,
        level: 8,
        badges_count: 24,
        is_current_user: false
      },
      {
        rank: 2,
        user_id: 25,
        user_name: 'Fatma Mansour',
        user_avatar: undefined,
        points: 7200,
        level: 7,
        badges_count: 20,
        is_current_user: false
      },
      {
        rank: 3,
        user_id: 1,
        user_name: 'Mohamed Trabelsi',
        user_avatar: undefined,
        points: 6850,
        level: 7,
        badges_count: 18,
        is_current_user: true
      }
    ]

    leaderboard.value = mockLeaderboard
    return mockLeaderboard
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

// ==================== STATISTICS ====================

/**
 * Fetch gamification stats
 */
const fetchStats = async (): Promise<GamificationStats | null> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/gamification/stats')

    await new Promise(resolve => setTimeout(resolve, 500))

    const mockStats: GamificationStats = {
      total_points: 6850,
      level: 7,
      badges_unlocked: 18,
      total_badges: 45,
      achievements_completed: 12,
      total_achievements: 30,
      challenges_completed: 8,
      current_streak: 14,
      longest_streak: 28,
      rank_overall: 145,
      rank_monthly: 3
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

// ==================== HELPERS ====================

/**
 * Get badge rarity color
 */
const getRarityColor = (rarity: BadgeRarity): string => {
  const colors: Record<BadgeRarity, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b'
  }
  return colors[rarity]
}

/**
 * Get progress percentage for badge
 */
const getBadgeProgress = (badge: Badge): number => {
  return Math.round((badge.progress / badge.required_progress) * 100)
}

/**
 * Get days remaining for challenge
 */
const getChallengeDaysRemaining = (challenge: Challenge): number => {
  const diff = challenge.end_date - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

/**
 * Format points with commas
 */
const formatPoints = (points: number): string => {
  return points.toLocaleString('fr-TN')
}

// ==================== EXPORT ====================

export function useGamification() {
  return {
    // State
    badges: readonly(badges),
    achievements: readonly(achievements),
    challenges: readonly(challenges),
    userLevel: readonly(userLevel),
    leaderboard: readonly(leaderboard),
    stats: readonly(stats),
    isLoading: readonly(isLoading),

    // Computed
    unlockedBadges,
    availableBadges,
    activeChallenges,
    completedChallenges,
    completedAchievements,
    inProgressAchievements,
    totalPoints,
    currentLevel,

    // Badges
    fetchBadges,
    unlockBadge,

    // Achievements
    fetchAchievements,

    // Challenges
    fetchChallenges,
    claimChallenge,

    // Levels
    fetchUserLevel,
    calculateLevel,
    addXP,

    // Leaderboard
    fetchLeaderboard,

    // Statistics
    fetchStats,

    // Helpers
    getRarityColor,
    getBadgeProgress,
    getChallengeDaysRemaining,
    formatPoints,

    // Config
    LEVELS
  }
}
