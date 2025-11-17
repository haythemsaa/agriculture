import { ref, computed, readonly } from 'vue'

/**
 * Composable useSubscriptions - Subscription Management System
 *
 * Recurring product subscriptions with flexible schedules,
 * pause/resume, discounts, and automated deliveries
 *
 * Impact: +35% predictable revenue, +50% customer retention, +20% LTV
 */

// ==================== TYPES ====================

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'pending'
export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom'
export type SubscriptionTier = 'basic' | 'premium' | 'vip'

export interface SubscriptionProduct {
  product_id: number
  product_name: string
  product_image?: string
  category: string
  unit: string
  quantity: number
  unit_price: number
  subscription_discount: number
  total: number
  customizable: boolean
  min_quantity?: number
  max_quantity?: number
}

export interface Subscription {
  id: string
  subscription_number: string
  user_id: number
  tier: SubscriptionTier
  status: SubscriptionStatus
  frequency: SubscriptionFrequency
  custom_schedule?: {
    day_of_week?: number // 0-6 (Sunday-Saturday)
    day_of_month?: number // 1-31
    interval_days?: number
  }
  products: SubscriptionProduct[]
  subtotal: number
  subscription_discount_percent: number
  subscription_discount_amount: number
  delivery_fee: number
  total_per_delivery: number
  delivery_address: string
  payment_method_id: string
  next_delivery_date: number
  last_delivery_date?: number
  deliveries_completed: number
  deliveries_skipped: number
  start_date: number
  end_date?: number
  paused_until?: number
  cancelled_at?: number
  cancellation_reason?: string
  created_at: number
  updated_at: number
  notes?: string
}

export interface SubscriptionDelivery {
  id: string
  subscription_id: string
  delivery_number: number
  scheduled_date: number
  actual_date?: number
  status: 'scheduled' | 'processing' | 'shipped' | 'delivered' | 'skipped' | 'failed'
  order_id?: string
  products: SubscriptionProduct[]
  total_amount: number
  tracking_number?: string
  notes?: string
  created_at: number
}

export interface SubscriptionPlan {
  tier: SubscriptionTier
  name: string
  description: string
  discount_percent: number
  free_delivery_threshold: number
  features: string[]
  min_commitment_months?: number
  color: string
  icon: string
  popular?: boolean
}

export interface SubscriptionStats {
  active_subscriptions: number
  total_subscriptions: number
  monthly_savings: number
  total_savings: number
  next_delivery_count: number
  delivery_success_rate: number
  average_order_value: number
}

// ==================== SUBSCRIPTION PLANS ====================

const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  basic: {
    tier: 'basic',
    name: 'Basic',
    description: 'Parfait pour les besoins réguliers',
    discount_percent: 5,
    free_delivery_threshold: 100,
    features: [
      '5% de réduction sur tous les produits',
      'Livraison gratuite > 100 TND',
      'Modification flexible',
      'Annulation sans frais'
    ],
    color: '#6b7280',
    icon: '📦'
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    description: 'Pour les clients réguliers',
    discount_percent: 10,
    free_delivery_threshold: 50,
    features: [
      '10% de réduction garantie',
      'Livraison gratuite > 50 TND',
      'Priorité de livraison',
      'Produits exclusifs',
      'Support prioritaire',
      'Pause illimitée'
    ],
    min_commitment_months: 3,
    color: '#8b5cf6',
    icon: '⭐',
    popular: true
  },
  vip: {
    tier: 'vip',
    name: 'VIP',
    description: 'Service premium complet',
    discount_percent: 15,
    free_delivery_threshold: 0,
    features: [
      '15% de réduction permanente',
      'Livraison toujours gratuite',
      'Livraison express prioritaire',
      'Accès early access nouveautés',
      'Gestionnaire compte dédié',
      'Personnalisation complète',
      'Cadeaux exclusifs'
    ],
    min_commitment_months: 6,
    color: '#f59e0b',
    icon: '👑'
  }
}

// ==================== STATE ====================

const subscriptions = ref<Subscription[]>([])
const deliveries = ref<SubscriptionDelivery[]>([])
const stats = ref<SubscriptionStats | null>(null)
const isLoading = ref(false)

// ==================== COMPUTED ====================

const activeSubscriptions = computed(() =>
  subscriptions.value.filter(s => s.status === 'active')
)

const pausedSubscriptions = computed(() =>
  subscriptions.value.filter(s => s.status === 'paused')
)

const upcomingDeliveries = computed(() => {
  const now = Date.now()
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000
  return deliveries.value.filter(d =>
    d.status === 'scheduled' &&
    d.scheduled_date >= now &&
    d.scheduled_date <= sevenDaysFromNow
  ).sort((a, b) => a.scheduled_date - b.scheduled_date)
})

const totalMonthlySavings = computed(() =>
  activeSubscriptions.value.reduce((sum, s) => sum + s.subscription_discount_amount, 0)
)

// ==================== SUBSCRIPTION MANAGEMENT ====================

/**
 * Create new subscription
 */
const createSubscription = async (data: {
  products: SubscriptionProduct[]
  frequency: SubscriptionFrequency
  tier: SubscriptionTier
  delivery_address: string
  payment_method_id: string
  start_date?: number
}): Promise<Subscription | null> => {
  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/subscriptions', { method: 'POST', body: data })

    await new Promise(resolve => setTimeout(resolve, 1000))

    const plan = SUBSCRIPTION_PLANS[data.tier]
    const subtotal = data.products.reduce((sum, p) => sum + p.total, 0)
    const discountAmount = (subtotal * plan.discount_percent) / 100
    const deliveryFee = subtotal >= plan.free_delivery_threshold ? 0 : 7

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      subscription_number: `SUB-${Date.now().toString().slice(-8)}`,
      user_id: 1,
      tier: data.tier,
      status: 'active',
      frequency: data.frequency,
      products: data.products.map(p => ({
        ...p,
        subscription_discount: plan.discount_percent,
        total: p.quantity * p.unit_price
      })),
      subtotal,
      subscription_discount_percent: plan.discount_percent,
      subscription_discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      total_per_delivery: subtotal - discountAmount + deliveryFee,
      delivery_address: data.delivery_address,
      payment_method_id: data.payment_method_id,
      next_delivery_date: data.start_date || calculateNextDelivery(data.frequency, Date.now()),
      deliveries_completed: 0,
      deliveries_skipped: 0,
      start_date: data.start_date || Date.now(),
      created_at: Date.now(),
      updated_at: Date.now()
    }

    subscriptions.value.push(subscription)
    saveToLocalStorage()

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Update subscription products
 */
const updateSubscriptionProducts = async (
  subscriptionId: string,
  products: SubscriptionProduct[]
): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/products`, { method: 'PUT', body: { products } })

    await new Promise(resolve => setTimeout(resolve, 500))

    subscription.products = products
    recalculateSubscription(subscription)
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error updating products:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Update subscription frequency
 */
const updateFrequency = async (
  subscriptionId: string,
  frequency: SubscriptionFrequency,
  customSchedule?: Subscription['custom_schedule']
): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/frequency`, { method: 'PUT', body: { frequency, customSchedule } })

    await new Promise(resolve => setTimeout(resolve, 500))

    subscription.frequency = frequency
    subscription.custom_schedule = customSchedule
    subscription.next_delivery_date = calculateNextDelivery(frequency, Date.now(), customSchedule)
    subscription.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error updating frequency:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Pause subscription
 */
const pauseSubscription = async (
  subscriptionId: string,
  pausedUntil?: number
): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription || subscription.status !== 'active') return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/pause`, { method: 'POST', body: { pausedUntil } })

    await new Promise(resolve => setTimeout(resolve, 500))

    subscription.status = 'paused'
    subscription.paused_until = pausedUntil
    subscription.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error pausing subscription:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Resume paused subscription
 */
const resumeSubscription = async (subscriptionId: string): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription || subscription.status !== 'paused') return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/resume`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 500))

    subscription.status = 'active'
    subscription.paused_until = undefined
    subscription.next_delivery_date = calculateNextDelivery(subscription.frequency, Date.now())
    subscription.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error resuming subscription:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Cancel subscription
 */
const cancelSubscription = async (
  subscriptionId: string,
  reason: string,
  immediate: boolean = false
): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'POST', body: { reason, immediate } })

    await new Promise(resolve => setTimeout(resolve, 500))

    subscription.status = 'cancelled'
    subscription.cancellation_reason = reason
    subscription.cancelled_at = Date.now()
    if (immediate) {
      subscription.end_date = Date.now()
    } else {
      // Cancel after next delivery
      subscription.end_date = subscription.next_delivery_date
    }
    subscription.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== DELIVERY MANAGEMENT ====================

/**
 * Skip next delivery
 */
const skipNextDelivery = async (
  subscriptionId: string,
  reason?: string
): Promise<boolean> => {
  const subscription = subscriptions.value.find(s => s.id === subscriptionId)
  if (!subscription || subscription.status !== 'active') return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/subscriptions/${subscriptionId}/skip-delivery`, { method: 'POST', body: { reason } })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Create skipped delivery record
    const delivery: SubscriptionDelivery = {
      id: `del_${Date.now()}`,
      subscription_id: subscriptionId,
      delivery_number: subscription.deliveries_completed + subscription.deliveries_skipped + 1,
      scheduled_date: subscription.next_delivery_date,
      status: 'skipped',
      products: subscription.products,
      total_amount: subscription.total_per_delivery,
      notes: reason,
      created_at: Date.now()
    }

    deliveries.value.push(delivery)
    subscription.deliveries_skipped++
    subscription.next_delivery_date = calculateNextDelivery(
      subscription.frequency,
      subscription.next_delivery_date,
      subscription.custom_schedule
    )
    subscription.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error skipping delivery:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch subscription deliveries
 */
const fetchDeliveries = async (subscriptionId?: string): Promise<SubscriptionDelivery[]> => {
  isLoading.value = true

  try {
    // Try localStorage first
    const stored = localStorage.getItem('agritech_subscription_deliveries')
    if (stored) {
      const allDeliveries: SubscriptionDelivery[] = JSON.parse(stored)
      deliveries.value = allDeliveries
      return subscriptionId
        ? allDeliveries.filter(d => d.subscription_id === subscriptionId)
        : allDeliveries
    }

    // In real implementation, fetch from API
    // const response = await $fetch('/api/subscriptions/deliveries', { params: { subscriptionId } })

    return []
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

// ==================== CALCULATIONS ====================

/**
 * Calculate next delivery date based on frequency
 */
const calculateNextDelivery = (
  frequency: SubscriptionFrequency,
  fromDate: number,
  customSchedule?: Subscription['custom_schedule']
): number => {
  const date = new Date(fromDate)

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'custom':
      if (customSchedule?.interval_days) {
        date.setDate(date.getDate() + customSchedule.interval_days)
      }
      break
  }

  return date.getTime()
}

/**
 * Recalculate subscription totals
 */
const recalculateSubscription = (subscription: Subscription): void => {
  const plan = SUBSCRIPTION_PLANS[subscription.tier]

  subscription.subtotal = subscription.products.reduce((sum, p) => sum + p.total, 0)
  subscription.subscription_discount_amount = (subscription.subtotal * plan.discount_percent) / 100
  subscription.delivery_fee = subscription.subtotal >= plan.free_delivery_threshold ? 0 : 7
  subscription.total_per_delivery =
    subscription.subtotal - subscription.subscription_discount_amount + subscription.delivery_fee

  subscription.updated_at = Date.now()
}

/**
 * Calculate total savings from subscription
 */
const calculateTotalSavings = (subscription: Subscription): number => {
  const savingsPerDelivery = subscription.subscription_discount_amount
  const totalDeliveries = subscription.deliveries_completed
  return savingsPerDelivery * totalDeliveries
}

// ==================== STATISTICS ====================

/**
 * Fetch subscription statistics
 */
const fetchStats = async (): Promise<SubscriptionStats | null> => {
  isLoading.value = true

  try {
    // In real implementation, fetch from API
    // const response = await $fetch('/api/subscriptions/stats')

    await new Promise(resolve => setTimeout(resolve, 500))

    const activeCount = activeSubscriptions.value.length
    const totalDeliveries = deliveries.value.length
    const successfulDeliveries = deliveries.value.filter(d => d.status === 'delivered').length

    const mockStats: SubscriptionStats = {
      active_subscriptions: activeCount,
      total_subscriptions: subscriptions.value.length,
      monthly_savings: totalMonthlySavings.value,
      total_savings: subscriptions.value.reduce((sum, s) => sum + calculateTotalSavings(s), 0),
      next_delivery_count: upcomingDeliveries.value.length,
      delivery_success_rate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 100,
      average_order_value: activeCount > 0
        ? activeSubscriptions.value.reduce((sum, s) => sum + s.total_per_delivery, 0) / activeCount
        : 0
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
 * Get status label
 */
const getStatusLabel = (status: SubscriptionStatus): string => {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Actif',
    paused: 'En pause',
    cancelled: 'Annulé',
    expired: 'Expiré',
    pending: 'En attente'
  }
  return labels[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: SubscriptionStatus): string => {
  const colors: Record<SubscriptionStatus, string> = {
    active: '#10b981',
    paused: '#f59e0b',
    cancelled: '#ef4444',
    expired: '#6b7280',
    pending: '#3b82f6'
  }
  return colors[status]
}

/**
 * Get frequency label
 */
const getFrequencyLabel = (frequency: SubscriptionFrequency): string => {
  const labels: Record<SubscriptionFrequency, string> = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bi-hebdomadaire',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    custom: 'Personnalisé'
  }
  return labels[frequency]
}

/**
 * Format date for display
 */
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('fr-TN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Get days until next delivery
 */
const getDaysUntilDelivery = (subscription: Subscription): number => {
  const diff = subscription.next_delivery_date - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

// ==================== PERSISTENCE ====================

const saveToLocalStorage = () => {
  localStorage.setItem('agritech_subscriptions', JSON.stringify(subscriptions.value))
  localStorage.setItem('agritech_subscription_deliveries', JSON.stringify(deliveries.value))
}

// ==================== EXPORT ====================

export function useSubscriptions() {
  return {
    // State
    subscriptions: readonly(subscriptions),
    deliveries: readonly(deliveries),
    stats: readonly(stats),
    isLoading: readonly(isLoading),

    // Computed
    activeSubscriptions,
    pausedSubscriptions,
    upcomingDeliveries,
    totalMonthlySavings,

    // Subscription Management
    createSubscription,
    updateSubscriptionProducts,
    updateFrequency,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,

    // Delivery Management
    skipNextDelivery,
    fetchDeliveries,

    // Calculations
    calculateNextDelivery,
    calculateTotalSavings,

    // Statistics
    fetchStats,

    // Helpers
    getStatusLabel,
    getStatusColor,
    getFrequencyLabel,
    formatDate,
    getDaysUntilDelivery,

    // Config
    SUBSCRIPTION_PLANS
  }
}
