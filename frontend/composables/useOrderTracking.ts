/**
 * Composable for detailed order tracking
 * Real-time order status and delivery tracking
 */

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
  label: string
  description: string
  timestamp: number
  location?: string
}

export interface DeliveryUpdate {
  id: string
  status: string
  message: string
  location: string
  timestamp: number
  photo_url?: string
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus['status']
  created_at: number
  estimated_delivery: number
  actual_delivery?: number
  tracking_number?: string
  carrier?: string
  carrier_url?: string
  items: {
    product_id: number
    product_name: string
    product_image: string
    quantity: number
    price: number
  }[]
  shipping_address: {
    name: string
    address: string
    city: string
    postal_code: string
    phone: string
  }
  total_amount: number
  shipping_cost: number
  discount: number
  status_history: OrderStatus[]
  delivery_updates: DeliveryUpdate[]
  delivery_person?: {
    name: string
    phone: string
    photo?: string
    rating?: number
  }
  gps_tracking?: {
    lat: number
    lng: number
    last_updated: number
  }
}

export const useOrderTracking = () => {
  const config = useRuntimeConfig()
  const orders = ref<Order[]>([])
  const activeOrder = ref<Order | null>(null)
  const loading = ref(false)

  /**
   * Fetch all user orders
   */
  const fetchOrders = async (options: {
    status?: Order['status']
    page?: number
    limit?: number
  } = {}): Promise<Order[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ orders: Order[] }>(
        `${config.public.apiBase}/orders`,
        {
          params: {
            status: options.status,
            page: options.page || 1,
            per_page: options.limit || 10,
          },
        }
      )

      orders.value = response.orders || []
      return orders.value
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single order details
   */
  const fetchOrderDetails = async (orderId: string): Promise<Order | null> => {
    loading.value = true

    try {
      const response = await $fetch<{ order: Order }>(
        `${config.public.apiBase}/orders/${orderId}`
      )

      activeOrder.value = response.order
      return activeOrder.value
    } catch (error) {
      console.error('Failed to fetch order details:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Track order by tracking number
   */
  const trackByNumber = async (trackingNumber: string): Promise<Order | null> => {
    loading.value = true

    try {
      const response = await $fetch<{ order: Order }>(
        `${config.public.apiBase}/orders/track/${trackingNumber}`
      )

      return response.order
    } catch (error) {
      console.error('Failed to track order:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get real-time GPS location
   */
  const getGPSLocation = async (orderId: string): Promise<Order['gps_tracking'] | null> => {
    try {
      const response = await $fetch<{ location: Order['gps_tracking'] }>(
        `${config.public.apiBase}/orders/${orderId}/gps`
      )

      return response.location || null
    } catch (error) {
      console.error('Failed to fetch GPS location:', error)
      return null
    }
  }

  /**
   * Cancel order
   */
  const cancelOrder = async (orderId: string, reason: string): Promise<boolean> => {
    loading.value = true

    try {
      await $fetch(`${config.public.apiBase}/orders/${orderId}/cancel`, {
        method: 'POST',
        body: { reason },
      })

      // Update local order
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = 'cancelled'
        order.status_history.push({
          status: 'cancelled',
          label: 'Annulée',
          description: `Commande annulée: ${reason}`,
          timestamp: Date.now(),
        })
      }

      return true
    } catch (error) {
      console.error('Failed to cancel order:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Confirm delivery received
   */
  const confirmDelivery = async (orderId: string): Promise<boolean> => {
    loading.value = true

    try {
      await $fetch(`${config.public.apiBase}/orders/${orderId}/confirm-delivery`, {
        method: 'POST',
      })

      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = 'delivered'
        order.actual_delivery = Date.now()
      }

      return true
    } catch (error) {
      console.error('Failed to confirm delivery:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get status progress percentage
   */
  const getStatusProgress = (order: Order): number => {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)

    if (order.status === 'cancelled') return 0
    if (currentIndex === -1) return 0

    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: OrderStatus['status']): string => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '📦',
      shipped: '🚚',
      out_for_delivery: '🚙',
      delivered: '✅',
      cancelled: '❌',
    }
    return icons[status] || '📦'
  }

  /**
   * Get status color
   */
  const getStatusColor = (status: OrderStatus['status']): string => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      preparing: 'text-indigo-600 bg-indigo-50',
      shipped: 'text-purple-600 bg-purple-50',
      out_for_delivery: 'text-orange-600 bg-orange-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
  }

  /**
   * Format estimated delivery
   */
  const formatDeliveryDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain'
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    }
  }

  /**
   * Calculate days until delivery
   */
  const getDaysUntilDelivery = (order: Order): number => {
    const now = Date.now()
    const diff = order.estimated_delivery - now
    return Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  /**
   * Check if order can be cancelled
   */
  const canCancel = (order: Order): boolean => {
    return ['pending', 'confirmed'].includes(order.status)
  }

  /**
   * Check if order can be tracked
   */
  const canTrack = (order: Order): boolean => {
    return ['shipped', 'out_for_delivery'].includes(order.status)
  }

  /**
   * Get active orders (not delivered/cancelled)
   */
  const getActiveOrders = (): Order[] => {
    return orders.value.filter(o =>
      !['delivered', 'cancelled'].includes(o.status)
    )
  }

  /**
   * Get past orders (delivered/cancelled)
   */
  const getPastOrders = (): Order[] => {
    return orders.value.filter(o =>
      ['delivered', 'cancelled'].includes(o.status)
    )
  }

  /**
   * Format status update time
   */
  const formatUpdateTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const days = Math.floor(hours / 24)

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    return 'Il y a quelques instants'
  }

  /**
   * Get next status
   */
  const getNextStatus = (order: Order): string => {
    const statusFlow = {
      pending: 'Confirmation',
      confirmed: 'Préparation',
      preparing: 'Expédition',
      shipped: 'En cours de livraison',
      out_for_delivery: 'Livraison',
      delivered: 'Terminé',
      cancelled: 'Annulée',
    }
    return statusFlow[order.status] || 'Mise à jour'
  }

  /**
   * Subscribe to real-time updates
   */
  const subscribeToUpdates = (orderId: string, callback: (update: DeliveryUpdate) => void) => {
    // In production, use WebSocket or polling
    // For now, simulate with interval
    const interval = setInterval(async () => {
      const order = await fetchOrderDetails(orderId)
      if (order && order.delivery_updates.length > 0) {
        const latestUpdate = order.delivery_updates[order.delivery_updates.length - 1]
        callback(latestUpdate)
      }
    }, 30000) // Check every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval)
  }

  /**
   * Get estimated time of arrival
   */
  const getETA = (order: Order): string => {
    if (order.status === 'delivered') return 'Livré'
    if (order.status === 'cancelled') return 'Annulé'

    const days = getDaysUntilDelivery(order)
    if (days === 0) return 'Livraison aujourd\'hui'
    if (days === 1) return 'Livraison demain'
    if (days > 0) return `Livraison dans ${days} jours`
    return 'Livraison en retard'
  }

  /**
   * Request delivery photo
   */
  const requestDeliveryPhoto = async (orderId: string): Promise<string | null> => {
    try {
      const response = await $fetch<{ photo_url: string }>(
        `${config.public.apiBase}/orders/${orderId}/delivery-photo`
      )
      return response.photo_url
    } catch (error) {
      console.error('Failed to get delivery photo:', error)
      return null
    }
  }

  return {
    orders: readonly(orders),
    activeOrder,
    loading: readonly(loading),
    fetchOrders,
    fetchOrderDetails,
    trackByNumber,
    getGPSLocation,
    cancelOrder,
    confirmDelivery,
    getStatusProgress,
    getStatusIcon,
    getStatusColor,
    formatDeliveryDate,
    getDaysUntilDelivery,
    canCancel,
    canTrack,
    getActiveOrders,
    getPastOrders,
    formatUpdateTime,
    getNextStatus,
    subscribeToUpdates,
    getETA,
    requestDeliveryPhoto,
  }
}
