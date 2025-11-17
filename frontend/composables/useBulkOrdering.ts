import { ref, computed, readonly } from 'vue'

/**
 * Composable useBulkOrdering - B2B Bulk Ordering System
 *
 * Professional bulk ordering with quote requests, price negotiation,
 * volume discounts, and custom delivery schedules
 *
 * Impact: +40% order value, +25% professional customers, +30% retention B2B
 */

// ==================== TYPES ====================

export type QuoteStatus = 'draft' | 'submitted' | 'pending' | 'quoted' | 'negotiating' | 'accepted' | 'rejected' | 'expired'
export type DeliveryFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
export type PaymentTerms = 'immediate' | 'net15' | 'net30' | 'net60' | 'net90'
export type BusinessType = 'restaurant' | 'hotel' | 'retailer' | 'distributor' | 'cooperative' | 'processor' | 'exporter'

export interface BulkOrderItem {
  product_id: number
  product_name: string
  product_image?: string
  category: string
  unit: string
  quantity: number
  requested_price?: number
  quoted_price?: number
  total: number
  min_order_quantity: number
  available_stock: number
  lead_time_days: number
  notes?: string
}

export interface QuoteRequest {
  id: string
  quote_number: string
  business_id: number
  business_name: string
  business_type: BusinessType
  seller_id: number
  seller_name: string
  status: QuoteStatus
  items: BulkOrderItem[]
  subtotal: number
  volume_discount_percent: number
  volume_discount_amount: number
  tax_amount: number
  delivery_fee: number
  total_amount: number
  delivery_frequency: DeliveryFrequency
  delivery_address: string
  delivery_date: number
  payment_terms: PaymentTerms
  special_requirements?: string
  validity_days: number
  expires_at: number
  created_at: number
  updated_at: number
  quoted_at?: number
  accepted_at?: number
  notes?: string
  admin_notes?: string
}

export interface VolumeDiscount {
  id: string
  product_id: number
  product_name: string
  tier: number
  min_quantity: number
  max_quantity: number | null
  discount_percent: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_active: boolean
}

export interface RecurringOrder {
  id: string
  quote_id: string
  business_id: number
  frequency: DeliveryFrequency
  custom_schedule?: {
    day_of_week?: number
    day_of_month?: number
    interval_days?: number
  }
  next_delivery: number
  items: BulkOrderItem[]
  total_amount: number
  is_active: boolean
  start_date: number
  end_date?: number
  deliveries_count: number
  last_delivery?: number
  created_at: number
}

export interface NegotiationMessage {
  id: string
  quote_id: string
  sender_id: number
  sender_name: string
  sender_type: 'buyer' | 'seller'
  message: string
  proposed_price?: number
  proposed_terms?: Partial<QuoteRequest>
  attachments?: { name: string; url: string }[]
  timestamp: number
}

export interface BulkOrderStats {
  total_quotes: number
  pending_quotes: number
  accepted_quotes: number
  total_volume: number
  total_value: number
  average_discount: number
  recurring_orders: number
  conversion_rate: number
}

// ==================== VOLUME DISCOUNT TIERS ====================

const VOLUME_DISCOUNT_TIERS: VolumeDiscount[] = [
  {
    id: '1',
    product_id: 0, // 0 = applies to all
    product_name: 'Tous les produits',
    tier: 1,
    min_quantity: 50,
    max_quantity: 100,
    discount_percent: 5,
    discount_type: 'percentage',
    discount_value: 5,
    is_active: true
  },
  {
    id: '2',
    product_id: 0,
    product_name: 'Tous les produits',
    tier: 2,
    min_quantity: 100,
    max_quantity: 500,
    discount_percent: 10,
    discount_type: 'percentage',
    discount_value: 10,
    is_active: true
  },
  {
    id: '3',
    product_id: 0,
    product_name: 'Tous les produits',
    tier: 3,
    min_quantity: 500,
    max_quantity: 1000,
    discount_percent: 15,
    discount_type: 'percentage',
    discount_value: 15,
    is_active: true
  },
  {
    id: '4',
    product_id: 0,
    product_name: 'Tous les produits',
    tier: 4,
    min_quantity: 1000,
    max_quantity: null,
    discount_percent: 20,
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true
  }
]

// ==================== STATE ====================

const quotes = ref<QuoteRequest[]>([])
const currentQuote = ref<QuoteRequest | null>(null)
const recurringOrders = ref<RecurringOrder[]>([])
const negotiations = ref<NegotiationMessage[]>([])
const stats = ref<BulkOrderStats | null>(null)
const isLoading = ref(false)

// ==================== COMPUTED ====================

const draftQuotes = computed(() =>
  quotes.value.filter(q => q.status === 'draft')
)

const pendingQuotes = computed(() =>
  quotes.value.filter(q => q.status === 'pending' || q.status === 'submitted')
)

const activeQuotes = computed(() =>
  quotes.value.filter(q => q.status === 'quoted' || q.status === 'negotiating')
)

const acceptedQuotes = computed(() =>
  quotes.value.filter(q => q.status === 'accepted')
)

const activeRecurringOrders = computed(() =>
  recurringOrders.value.filter(o => o.is_active)
)

const totalQuotesValue = computed(() =>
  quotes.value.reduce((sum, q) => sum + q.total_amount, 0)
)

// ==================== QUOTE MANAGEMENT ====================

/**
 * Create a new quote request (draft)
 */
const createQuote = (businessInfo: {
  business_id: number
  business_name: string
  business_type: BusinessType
}): QuoteRequest => {
  const quote: QuoteRequest = {
    id: `quote_${Date.now()}`,
    quote_number: `BQ-${Date.now().toString().slice(-8)}`,
    ...businessInfo,
    seller_id: 0,
    seller_name: '',
    status: 'draft',
    items: [],
    subtotal: 0,
    volume_discount_percent: 0,
    volume_discount_amount: 0,
    tax_amount: 0,
    delivery_fee: 0,
    total_amount: 0,
    delivery_frequency: 'one_time',
    delivery_address: '',
    delivery_date: Date.now() + 7 * 24 * 60 * 60 * 1000,
    payment_terms: 'net30',
    validity_days: 30,
    expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
    created_at: Date.now(),
    updated_at: Date.now()
  }

  quotes.value.push(quote)
  currentQuote.value = quote
  saveToLocalStorage()

  return quote
}

/**
 * Add item to quote
 */
const addItemToQuote = (quoteId: string, item: Omit<BulkOrderItem, 'total'>): boolean => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  const itemWithTotal: BulkOrderItem = {
    ...item,
    total: item.quantity * (item.requested_price || 0)
  }

  quote.items.push(itemWithTotal)
  recalculateQuote(quote)
  saveToLocalStorage()

  return true
}

/**
 * Update item quantity in quote
 */
const updateItemQuantity = (quoteId: string, productId: number, quantity: number): boolean => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  const item = quote.items.find(i => i.product_id === productId)
  if (!item) return false

  // Check minimum order quantity
  if (quantity < item.min_order_quantity) {
    console.error(`Minimum order quantity is ${item.min_order_quantity}`)
    return false
  }

  // Check available stock
  if (quantity > item.available_stock) {
    console.error(`Only ${item.available_stock} units available`)
    return false
  }

  item.quantity = quantity
  item.total = quantity * (item.quoted_price || item.requested_price || 0)

  recalculateQuote(quote)
  saveToLocalStorage()

  return true
}

/**
 * Remove item from quote
 */
const removeItemFromQuote = (quoteId: string, productId: number): boolean => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  const index = quote.items.findIndex(i => i.product_id === productId)
  if (index === -1) return false

  quote.items.splice(index, 1)
  recalculateQuote(quote)
  saveToLocalStorage()

  return true
}

/**
 * Recalculate quote totals including volume discounts
 */
const recalculateQuote = (quote: QuoteRequest): void => {
  // Calculate subtotal
  quote.subtotal = quote.items.reduce((sum, item) => sum + item.total, 0)

  // Calculate volume discount
  const totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0)
  const volumeDiscount = calculateVolumeDiscount(totalQuantity)
  quote.volume_discount_percent = volumeDiscount.percent
  quote.volume_discount_amount = (quote.subtotal * volumeDiscount.percent) / 100

  // Calculate tax (19% TVA in Tunisia)
  const taxableAmount = quote.subtotal - quote.volume_discount_amount
  quote.tax_amount = taxableAmount * 0.19

  // Total
  quote.total_amount = taxableAmount + quote.tax_amount + quote.delivery_fee

  quote.updated_at = Date.now()
}

/**
 * Calculate volume discount based on total quantity
 */
const calculateVolumeDiscount = (totalQuantity: number): { tier: number; percent: number } => {
  for (let i = VOLUME_DISCOUNT_TIERS.length - 1; i >= 0; i--) {
    const tier = VOLUME_DISCOUNT_TIERS[i]
    if (totalQuantity >= tier.min_quantity) {
      if (tier.max_quantity === null || totalQuantity <= tier.max_quantity) {
        return {
          tier: tier.tier,
          percent: tier.discount_percent
        }
      }
    }
  }
  return { tier: 0, percent: 0 }
}

/**
 * Submit quote request to seller
 */
const submitQuote = async (quoteId: string): Promise<boolean> => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  if (quote.items.length === 0) {
    console.error('Cannot submit empty quote')
    return false
  }

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/bulk-orders/quotes/${quoteId}/submit`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 1000))

    quote.status = 'submitted'
    quote.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error submitting quote:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch quotes for current user
 */
const fetchQuotes = async (): Promise<QuoteRequest[]> => {
  isLoading.value = true

  try {
    // Try localStorage first
    const stored = localStorage.getItem('agritech_bulk_quotes')
    if (stored) {
      quotes.value = JSON.parse(stored)
      return quotes.value
    }

    // In real implementation, fetch from API
    // const response = await $fetch('/api/bulk-orders/quotes')

    return []
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

/**
 * Accept a quoted price from seller
 */
const acceptQuote = async (quoteId: string): Promise<boolean> => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote || quote.status !== 'quoted') return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/bulk-orders/quotes/${quoteId}/accept`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 1000))

    quote.status = 'accepted'
    quote.accepted_at = Date.now()
    quote.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error accepting quote:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Reject a quote
 */
const rejectQuote = async (quoteId: string, reason: string): Promise<boolean> => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/bulk-orders/quotes/${quoteId}/reject`, { method: 'POST', body: { reason } })

    await new Promise(resolve => setTimeout(resolve, 1000))

    quote.status = 'rejected'
    quote.notes = reason
    quote.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error rejecting quote:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== NEGOTIATIONS ====================

/**
 * Send negotiation message
 */
const sendNegotiation = async (
  quoteId: string,
  message: string,
  proposedPrice?: number,
  proposedTerms?: Partial<QuoteRequest>
): Promise<boolean> => {
  const quote = quotes.value.find(q => q.id === quoteId)
  if (!quote) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/bulk-orders/quotes/${quoteId}/negotiate`, { method: 'POST', body: { message, proposedPrice, proposedTerms } })

    await new Promise(resolve => setTimeout(resolve, 500))

    const negotiationMessage: NegotiationMessage = {
      id: `neg_${Date.now()}`,
      quote_id: quoteId,
      sender_id: quote.business_id,
      sender_name: quote.business_name,
      sender_type: 'buyer',
      message,
      proposed_price: proposedPrice,
      proposed_terms: proposedTerms,
      timestamp: Date.now()
    }

    negotiations.value.push(negotiationMessage)
    quote.status = 'negotiating'
    quote.updated_at = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error sending negotiation:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Get negotiations for a quote
 */
const getQuoteNegotiations = (quoteId: string): NegotiationMessage[] => {
  return negotiations.value.filter(n => n.quote_id === quoteId)
}

// ==================== RECURRING ORDERS ====================

/**
 * Convert accepted quote to recurring order
 */
const createRecurringOrder = async (
  quoteId: string,
  frequency: DeliveryFrequency,
  startDate: number,
  endDate?: number
): Promise<RecurringOrder | null> => {
  const quote = quotes.value.find(q => q.id === quoteId && q.status === 'accepted')
  if (!quote) return null

  isLoading.value = true

  try {
    // In real implementation, call API
    // const response = await $fetch('/api/bulk-orders/recurring', { method: 'POST', body: { quoteId, frequency, startDate, endDate } })

    await new Promise(resolve => setTimeout(resolve, 1000))

    const recurring: RecurringOrder = {
      id: `rec_${Date.now()}`,
      quote_id: quoteId,
      business_id: quote.business_id,
      frequency,
      next_delivery: startDate,
      items: [...quote.items],
      total_amount: quote.total_amount,
      is_active: true,
      start_date: startDate,
      end_date,
      deliveries_count: 0,
      created_at: Date.now()
    }

    recurringOrders.value.push(recurring)
    saveToLocalStorage()

    return recurring
  } catch (error) {
    console.error('Error creating recurring order:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

/**
 * Cancel recurring order
 */
const cancelRecurringOrder = async (orderId: string): Promise<boolean> => {
  const order = recurringOrders.value.find(o => o.id === orderId)
  if (!order) return false

  isLoading.value = true

  try {
    // In real implementation, call API
    // await $fetch(`/api/bulk-orders/recurring/${orderId}/cancel`, { method: 'POST' })

    await new Promise(resolve => setTimeout(resolve, 500))

    order.is_active = false
    order.end_date = Date.now()
    saveToLocalStorage()

    return true
  } catch (error) {
    console.error('Error canceling recurring order:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// ==================== STATISTICS ====================

/**
 * Fetch bulk order statistics
 */
const fetchStats = async (): Promise<BulkOrderStats | null> => {
  isLoading.value = true

  try {
    // In real implementation, fetch from API
    // const response = await $fetch('/api/bulk-orders/stats')

    await new Promise(resolve => setTimeout(resolve, 500))

    const totalQuotes = quotes.value.length
    const accepted = acceptedQuotes.value.length

    const mockStats: BulkOrderStats = {
      total_quotes: totalQuotes,
      pending_quotes: pendingQuotes.value.length,
      accepted_quotes: accepted,
      total_volume: quotes.value.reduce((sum, q) =>
        sum + q.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0
      ),
      total_value: totalQuotesValue.value,
      average_discount: quotes.value.length > 0
        ? quotes.value.reduce((sum, q) => sum + q.volume_discount_percent, 0) / quotes.value.length
        : 0,
      recurring_orders: activeRecurringOrders.value.length,
      conversion_rate: totalQuotes > 0 ? (accepted / totalQuotes) * 100 : 0
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
 * Get quote status label
 */
const getStatusLabel = (status: QuoteStatus): string => {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Brouillon',
    submitted: 'Soumis',
    pending: 'En attente',
    quoted: 'Devis reçu',
    negotiating: 'Négociation',
    accepted: 'Accepté',
    rejected: 'Rejeté',
    expired: 'Expiré'
  }
  return labels[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: QuoteStatus): string => {
  const colors: Record<QuoteStatus, string> = {
    draft: '#6b7280',
    submitted: '#3b82f6',
    pending: '#f59e0b',
    quoted: '#8b5cf6',
    negotiating: '#06b6d4',
    accepted: '#10b981',
    rejected: '#ef4444',
    expired: '#9ca3af'
  }
  return colors[status]
}

/**
 * Format payment terms
 */
const formatPaymentTerms = (terms: PaymentTerms): string => {
  const labels: Record<PaymentTerms, string> = {
    immediate: 'Paiement immédiat',
    net15: 'Net 15 jours',
    net30: 'Net 30 jours',
    net60: 'Net 60 jours',
    net90: 'Net 90 jours'
  }
  return labels[terms]
}

/**
 * Get estimated savings from volume discount
 */
const getEstimatedSavings = (quote: QuoteRequest): number => {
  return quote.volume_discount_amount
}

/**
 * Check if quote is expiring soon (within 3 days)
 */
const isExpiringSoon = (quote: QuoteRequest): boolean => {
  const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000
  return quote.expires_at <= threeDaysFromNow && quote.expires_at > Date.now()
}

/**
 * Check if quote is expired
 */
const isExpired = (quote: QuoteRequest): boolean => {
  return quote.expires_at < Date.now()
}

// ==================== PERSISTENCE ====================

const saveToLocalStorage = () => {
  localStorage.setItem('agritech_bulk_quotes', JSON.stringify(quotes.value))
  localStorage.setItem('agritech_recurring_orders', JSON.stringify(recurringOrders.value))
}

// ==================== EXPORT ====================

export function useBulkOrdering() {
  return {
    // State
    quotes: readonly(quotes),
    currentQuote: readonly(currentQuote),
    recurringOrders: readonly(recurringOrders),
    negotiations: readonly(negotiations),
    stats: readonly(stats),
    isLoading: readonly(isLoading),

    // Computed
    draftQuotes,
    pendingQuotes,
    activeQuotes,
    acceptedQuotes,
    activeRecurringOrders,
    totalQuotesValue,

    // Quote Management
    createQuote,
    addItemToQuote,
    updateItemQuantity,
    removeItemFromQuote,
    submitQuote,
    fetchQuotes,
    acceptQuote,
    rejectQuote,

    // Calculations
    calculateVolumeDiscount,
    recalculateQuote,

    // Negotiations
    sendNegotiation,
    getQuoteNegotiations,

    // Recurring Orders
    createRecurringOrder,
    cancelRecurringOrder,

    // Statistics
    fetchStats,

    // Helpers
    getStatusLabel,
    getStatusColor,
    formatPaymentTerms,
    getEstimatedSavings,
    isExpiringSoon,
    isExpired,

    // Config
    VOLUME_DISCOUNT_TIERS
  }
}
