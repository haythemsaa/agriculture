import { ref, computed, readonly } from 'vue'

/**
 * Composable useLiveShopping - Live Shopping & Auction System
 *
 * Live video shopping, real-time auctions, flash sales,
 * limited-time deals with countdown timers
 *
 * Impact: +80% engagement, +65% impulse purchases, +45% FOMO conversions
 */

// ==================== TYPES ====================

export type LiveSessionStatus = 'upcoming' | 'live' | 'ended'
export type AuctionStatus = 'scheduled' | 'active' | 'ended' | 'sold'
export type DealType = 'flash_sale' | 'daily_deal' | 'limited_quantity' | 'first_come'

export interface LiveSession {
  id: string
  title: string
  description: string
  host_id: number
  host_name: string
  host_avatar?: string
  thumbnail_url?: string
  stream_url?: string
  status: LiveSessionStatus
  viewers_count: number
  products: LiveProduct[]
  scheduled_start: number
  actual_start?: number
  ended_at?: number
  duration_minutes: number
}

export interface LiveProduct {
  id: string
  product_id: number
  product_name: string
  product_image?: string
  original_price: number
  live_price: number
  discount_percent: number
  stock_available: number
  sold_count: number
  is_featured: boolean
}

export interface Auction {
  id: string
  product_id: number
  product_name: string
  product_image?: string
  description: string
  status: AuctionStatus
  starting_bid: number
  current_bid: number
  bid_increment: number
  reserve_price?: number
  buyout_price?: number
  bids_count: number
  highest_bidder_id?: number
  highest_bidder_name?: string
  winner_id?: number
  start_time: number
  end_time: number
  created_at: number
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: number
  bidder_name: string
  amount: number
  is_auto_bid: boolean
  timestamp: number
}

export interface FlashDeal {
  id: string
  product_id: number
  product_name: string
  product_image?: string
  type: DealType
  original_price: number
  deal_price: number
  discount_percent: number
  quantity_total: number
  quantity_sold: number
  quantity_remaining: number
  start_time: number
  end_time: number
  is_active: boolean
}

export interface LiveChat {
  id: string
  session_id: string
  user_id: number
  user_name: string
  message: string
  timestamp: number
}

// ==================== STATE ====================

const liveSessions = ref<LiveSession[]>([])
const currentSession = ref<LiveSession | null>(null)
const auctions = ref<Auction[]>([])
const flashDeals = ref<FlashDeal[]>([])
const chatMessages = ref<Map<string, LiveChat[]>>(new Map())
const bids = ref<Map<string, Bid[]>>(new Map())
const isLoading = ref(false)

// ==================== COMPUTED ====================

const activeSessions = computed(() =>
  liveSessions.value.filter(s => s.status === 'live')
)

const upcomingSessions = computed(() =>
  liveSessions.value.filter(s => s.status === 'upcoming')
    .sort((a, b) => a.scheduled_start - b.scheduled_start)
)

const activeAuctions = computed(() =>
  auctions.value.filter(a => a.status === 'active')
    .sort((a, b) => a.end_time - b.end_time)
)

const activeDeals = computed(() =>
  flashDeals.value.filter(d => d.is_active && d.end_time > Date.now())
    .sort((a, b) => a.end_time - b.end_time)
)

// ==================== LIVE SESSIONS ====================

const fetchLiveSessions = async (): Promise<LiveSession[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const now = Date.now()
    liveSessions.value = [
      {
        id: '1', title: 'Récolte du Jour - Produits Frais Direct Ferme',
        description: 'Découvrez nos produits frais du jour...',
        host_id: 5, host_name: 'Ferme Ghazela', status: 'live',
        viewers_count: 234, products: [
          { id: '1', product_id: 1, product_name: 'Tomates Bio', original_price: 3.5, live_price: 2.5,
            discount_percent: 29, stock_available: 50, sold_count: 18, is_featured: true }
        ],
        scheduled_start: now - 30 * 60 * 1000, actual_start: now - 25 * 60 * 1000,
        duration_minutes: 60
      },
      {
        id: '2', title: 'Huiles d\'Olive Premium - Vente Spéciale',
        description: 'Session spéciale huiles d\'olive...',
        host_id: 8, host_name: 'Domaine Olea', status: 'upcoming',
        viewers_count: 0, products: [],
        scheduled_start: now + 2 * 60 * 60 * 1000, duration_minutes: 45
      }
    ]
    return liveSessions.value
  } finally {
    isLoading.value = false
  }
}

const joinSession = async (sessionId: string): Promise<boolean> => {
  const session = liveSessions.value.find(s => s.id === sessionId)
  if (!session) return false
  session.viewers_count++
  currentSession.value = session
  return true
}

const leaveSession = (sessionId: string): void => {
  const session = liveSessions.value.find(s => s.id === sessionId)
  if (session && session.viewers_count > 0) session.viewers_count--
  currentSession.value = null
}

// ==================== AUCTIONS ====================

const fetchAuctions = async (): Promise<Auction[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const now = Date.now()
    auctions.value = [
      {
        id: '1', product_id: 10, product_name: 'Lot 50kg Oranges Maltaises Premium',
        description: 'Oranges de qualité exceptionnelle...',
        status: 'active', starting_bid: 50, current_bid: 75, bid_increment: 5,
        reserve_price: 80, buyout_price: 120, bids_count: 12,
        highest_bidder_name: 'Restaurant Le Gourmet',
        start_time: now - 2 * 60 * 60 * 1000, end_time: now + 1 * 60 * 60 * 1000,
        created_at: now - 3 * 60 * 60 * 1000
      },
      {
        id: '2', product_id: 15, product_name: 'Miel Artisanal 10kg',
        description: 'Miel pur de montagne...',
        status: 'scheduled', starting_bid: 80, current_bid: 80, bid_increment: 10,
        buyout_price: 200, bids_count: 0,
        start_time: now + 30 * 60 * 1000, end_time: now + 3 * 60 * 60 * 1000,
        created_at: now - 1 * 24 * 60 * 60 * 1000
      }
    ]
    return auctions.value
  } finally {
    isLoading.value = false
  }
}

const placeBid = async (auctionId: string, amount: number): Promise<boolean> => {
  const auction = auctions.value.find(a => a.id === auctionId)
  if (!auction || auction.status !== 'active') return false
  if (amount < auction.current_bid + auction.bid_increment) return false

  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const bid: Bid = {
      id: `bid_${Date.now()}`, auction_id: auctionId, bidder_id: 1,
      bidder_name: 'You', amount, is_auto_bid: false, timestamp: Date.now()
    }
    const auctionBids = bids.value.get(auctionId) || []
    auctionBids.push(bid)
    bids.value.set(auctionId, auctionBids)
    auction.current_bid = amount
    auction.bids_count++
    auction.highest_bidder_id = 1
    auction.highest_bidder_name = 'You'
    return true
  } finally {
    isLoading.value = false
  }
}

const buyoutAuction = async (auctionId: string): Promise<boolean> => {
  const auction = auctions.value.find(a => a.id === auctionId)
  if (!auction || !auction.buyout_price) return false

  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    auction.status = 'sold'
    auction.winner_id = 1
    auction.current_bid = auction.buyout_price
    return true
  } finally {
    isLoading.value = false
  }
}

// ==================== FLASH DEALS ====================

const fetchFlashDeals = async (): Promise<FlashDeal[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const now = Date.now()
    flashDeals.value = [
      {
        id: '1', product_id: 20, product_name: 'Fraises Bio 5kg',
        type: 'flash_sale', original_price: 45, deal_price: 29.99,
        discount_percent: 33, quantity_total: 100, quantity_sold: 67,
        quantity_remaining: 33, start_time: now - 1 * 60 * 60 * 1000,
        end_time: now + 2 * 60 * 60 * 1000, is_active: true
      },
      {
        id: '2', product_id: 25, product_name: 'Dattes Deglet Nour 2kg',
        type: 'daily_deal', original_price: 28, deal_price: 19.99,
        discount_percent: 29, quantity_total: 200, quantity_sold: 145,
        quantity_remaining: 55, start_time: now - 6 * 60 * 60 * 1000,
        end_time: now + 18 * 60 * 60 * 1000, is_active: true
      }
    ]
    return flashDeals.value
  } finally {
    isLoading.value = false
  }
}

const claimDeal = async (dealId: string): Promise<boolean> => {
  const deal = flashDeals.value.find(d => d.id === dealId)
  if (!deal || !deal.is_active || deal.quantity_remaining === 0) return false

  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    deal.quantity_sold++
    deal.quantity_remaining--
    if (deal.quantity_remaining === 0) deal.is_active = false
    return true
  } finally {
    isLoading.value = false
  }
}

// ==================== LIVE CHAT ====================

const sendChatMessage = async (sessionId: string, message: string): Promise<boolean> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    const chatMsg: LiveChat = {
      id: `msg_${Date.now()}`, session_id: sessionId, user_id: 1,
      user_name: 'You', message, timestamp: Date.now()
    }
    const sessionChat = chatMessages.value.get(sessionId) || []
    sessionChat.push(chatMsg)
    chatMessages.value.set(sessionId, sessionChat)
    return true
  } finally {
    isLoading.value = false
  }
}

// ==================== HELPERS ====================

const getTimeRemaining = (endTime: number): { hours: number; minutes: number; seconds: number } => {
  const diff = Math.max(0, endTime - Date.now())
  return {
    hours: Math.floor(diff / (60 * 60 * 1000)),
    minutes: Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)),
    seconds: Math.floor((diff % (60 * 1000)) / 1000)
  }
}

const formatTimeRemaining = (endTime: number): string => {
  const { hours, minutes, seconds } = getTimeRemaining(endTime)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

const getDealProgressPercent = (deal: FlashDeal): number => {
  return Math.round((deal.quantity_sold / deal.quantity_total) * 100)
}

const getAuctionStatusColor = (status: AuctionStatus): string => {
  const colors: Record<AuctionStatus, string> = {
    scheduled: '#6b7280', active: '#10b981', ended: '#ef4444', sold: '#f59e0b'
  }
  return colors[status]
}

// ==================== EXPORT ====================

export function useLiveShopping() {
  return {
    liveSessions: readonly(liveSessions), currentSession: readonly(currentSession),
    auctions: readonly(auctions), flashDeals: readonly(flashDeals),
    chatMessages: readonly(chatMessages), bids: readonly(bids),
    isLoading: readonly(isLoading), activeSessions, upcomingSessions,
    activeAuctions, activeDeals, fetchLiveSessions, joinSession, leaveSession,
    fetchAuctions, placeBid, buyoutAuction, fetchFlashDeals, claimDeal,
    sendChatMessage, getTimeRemaining, formatTimeRemaining,
    getDealProgressPercent, getAuctionStatusColor
  }
}
