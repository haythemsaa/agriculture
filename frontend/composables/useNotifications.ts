/**
 * Composable for real-time notifications
 * Manages in-app notifications with different types and priorities
 */

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'order' | 'price_drop' | 'stock'
  title: string
  message: string
  icon?: string
  image?: string
  link?: string
  timestamp: number
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actionLabel?: string
  actionCallback?: () => void
}

const STORAGE_KEY = 'user_notifications'
const MAX_NOTIFICATIONS = 50

export const useNotifications = () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  /**
   * Add a notification
   */
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    }

    // Add to beginning
    notifications.value.unshift(newNotification)

    // Limit to max
    if (notifications.value.length > MAX_NOTIFICATIONS) {
      notifications.value = notifications.value.slice(0, MAX_NOTIFICATIONS)
    }

    saveToStorage()

    return id
  }

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      saveToStorage()
    }
  }

  /**
   * Mark all as read
   */
  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true
    })
    saveToStorage()
  }

  /**
   * Remove notification
   */
  const removeNotification = (notificationId: string) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
    saveToStorage()
  }

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    notifications.value = []
    saveToStorage()
  }

  /**
   * Clear read notifications
   */
  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read)
    saveToStorage()
  }

  /**
   * Get notifications by type
   */
  const getByType = (type: Notification['type']): Notification[] => {
    return notifications.value.filter(n => n.type === type)
  }

  /**
   * Get unread notifications
   */
  const getUnread = (): Notification[] => {
    return notifications.value.filter(n => !n.read)
  }

  /**
   * Get notifications by priority
   */
  const getByPriority = (priority: Notification['priority']): Notification[] => {
    return notifications.value.filter(n => n.priority === priority)
  }

  /**
   * Get recent notifications (last 24 hours)
   */
  const getRecent = (): Notification[] => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return notifications.value.filter(n => n.timestamp > oneDayAgo)
  }

  /**
   * Format time ago
   */
  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    if (seconds > 10) return `il y a ${seconds} secondes`
    return 'à l'instant'
  }

  /**
   * Get notification icon
   */
  const getNotificationIcon = (type: Notification['type']): string => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      promotion: '🎁',
      order: '📦',
      price_drop: '💰',
      stock: '📊',
    }
    return icons[type] || 'ℹ️'
  }

  /**
   * Quick notification helpers
   */
  const notifyOrderUpdate = (orderId: string, status: string, message: string) => {
    return addNotification({
      type: 'order',
      title: `Commande #${orderId}`,
      message,
      priority: 'high',
      link: `/orders/${orderId}`,
      icon: '📦',
    })
  }

  const notifyPriceDrop = (productName: string, oldPrice: number, newPrice: number, productId: number) => {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)
    return addNotification({
      type: 'price_drop',
      title: 'Baisse de prix !',
      message: `${productName} est maintenant à ${newPrice} TND (-${discount}%)`,
      priority: 'high',
      link: `/products/${productId}`,
      icon: '💰',
      actionLabel: 'Voir',
    })
  }

  const notifyStockAlert = (productName: string, productId: number) => {
    return addNotification({
      type: 'stock',
      title: 'De nouveau en stock !',
      message: `${productName} est de nouveau disponible`,
      priority: 'medium',
      link: `/products/${productId}`,
      icon: '📊',
      actionLabel: 'Acheter',
    })
  }

  const notifyPromotion = (title: string, message: string, link?: string) => {
    return addNotification({
      type: 'promotion',
      title,
      message,
      priority: 'medium',
      link,
      icon: '🎁',
    })
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (error) {
      console.error('Failed to save notifications:', error)
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
        const parsed = JSON.parse(saved)
        // Filter out notifications older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        notifications.value = parsed.filter(
          (n: Notification) => n.timestamp > thirtyDaysAgo
        )

        if (notifications.value.length !== parsed.length) {
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  /**
   * Request browser notification permission
   */
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!process.client || !('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  /**
   * Show browser notification
   */
  const showBrowserNotification = (notification: Notification) => {
    if (!process.client || !('Notification' in window)) return

    if (Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: notification.image || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
      })

      browserNotif.onclick = () => {
        window.focus()
        if (notification.link) {
          navigateTo(notification.link)
        }
        browserNotif.close()
      }
    }
  }

  /**
   * Simulate real-time notifications (for demo)
   */
  const startSimulation = () => {
    if (!process.client) return

    // Simulate notifications every 30 seconds (for demo purposes)
    const simulationInterval = setInterval(() => {
      const random = Math.random()

      if (random < 0.3) {
        notifyPriceDrop('Tomates fraîches', 3.5, 2.8, 1)
      } else if (random < 0.5) {
        notifyStockAlert('Huile d\'olive premium', 2)
      } else if (random < 0.7) {
        notifyOrderUpdate('12345', 'shipped', 'Votre commande a été expédiée')
      } else {
        notifyPromotion(
          '🎉 Promotion flash !',
          'Jusqu\'à -30% sur les produits bio',
          '/marketplace?filter=organic'
        )
      }
    }, 30000)

    // Clear on unmount
    onUnmounted(() => {
      clearInterval(simulationInterval)
    })
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    notifications: readonly(notifications),
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    getByType,
    getUnread,
    getByPriority,
    getRecent,
    formatTimeAgo,
    getNotificationIcon,
    notifyOrderUpdate,
    notifyPriceDrop,
    notifyStockAlert,
    notifyPromotion,
    requestPermission,
    showBrowserNotification,
    startSimulation,
  }
}
