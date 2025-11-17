/**
 * Composable for price drop alerts and tracking
 * Monitors product prices and notifies users when prices drop
 */

export interface PriceAlert {
  id: string
  product_id: number
  product_name: string
  product_image: string
  current_price: number
  target_price: number
  created_at: number
  last_checked: number
  triggered: boolean
  triggered_at?: number
  triggered_price?: number
}

const STORAGE_KEY = 'price_alerts'
const CHECK_INTERVAL = 60 * 60 * 1000 // 1 hour

export const usePriceAlerts = () => {
  const config = useRuntimeConfig()
  const alerts = ref<PriceAlert[]>([])
  const { notifyPriceDrop } = useNotifications()

  /**
   * Create price alert
   */
  const createAlert = (product: {
    id: number
    name_fr: string
    price_per_unit: number
    images: string[]
  }, targetPrice: number): PriceAlert => {
    // Check if alert already exists
    const existing = alerts.value.find(a => a.product_id === product.id && !a.triggered)
    if (existing) {
      // Update existing alert
      existing.target_price = targetPrice
      existing.last_checked = Date.now()
      saveToStorage()
      return existing
    }

    const alert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_id: product.id,
      product_name: product.name_fr,
      product_image: product.images?.[0] || '',
      current_price: product.price_per_unit,
      target_price: targetPrice,
      created_at: Date.now(),
      last_checked: Date.now(),
      triggered: false,
    }

    alerts.value.push(alert)
    saveToStorage()

    return alert
  }

  /**
   * Remove alert
   */
  const removeAlert = (alertId: string) => {
    alerts.value = alerts.value.filter(a => a.id !== alertId)
    saveToStorage()
  }

  /**
   * Remove alert by product ID
   */
  const removeAlertByProduct = (productId: number) => {
    alerts.value = alerts.value.filter(a => a.product_id !== productId)
    saveToStorage()
  }

  /**
   * Get alert by product ID
   */
  const getAlertByProduct = (productId: number): PriceAlert | undefined => {
    return alerts.value.find(a => a.product_id === productId && !a.triggered)
  }

  /**
   * Check if product has active alert
   */
  const hasActiveAlert = (productId: number): boolean => {
    return alerts.value.some(a => a.product_id === productId && !a.triggered)
  }

  /**
   * Get active alerts count
   */
  const activeAlertsCount = computed(() => {
    return alerts.value.filter(a => !a.triggered).length
  })

  /**
   * Get triggered alerts count
   */
  const triggeredAlertsCount = computed(() => {
    return alerts.value.filter(a => a.triggered).length
  })

  /**
   * Check single product price
   */
  const checkProductPrice = async (alert: PriceAlert): Promise<boolean> => {
    try {
      const response = await $fetch<{ product: { price_per_unit: number } }>(
        `${config.public.apiBase}/products/${alert.product_id}`
      )

      const currentPrice = response.product.price_per_unit
      alert.last_checked = Date.now()

      // Check if price dropped below target
      if (currentPrice <= alert.target_price && !alert.triggered) {
        alert.triggered = true
        alert.triggered_at = Date.now()
        alert.triggered_price = currentPrice

        // Send notification
        notifyPriceDrop(
          alert.product_name,
          alert.current_price,
          currentPrice,
          alert.product_id
        )

        saveToStorage()
        return true
      }

      // Update current price
      alert.current_price = currentPrice
      saveToStorage()

      return false
    } catch (error) {
      console.error(`Failed to check price for product ${alert.product_id}:`, error)
      return false
    }
  }

  /**
   * Check all active alerts
   */
  const checkAllPrices = async (): Promise<number> => {
    const activeAlerts = alerts.value.filter(a => !a.triggered)
    let triggeredCount = 0

    for (const alert of activeAlerts) {
      const wasTriggered = await checkProductPrice(alert)
      if (wasTriggered) {
        triggeredCount++
      }

      // Small delay to avoid overwhelming API
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return triggeredCount
  }

  /**
   * Start automatic price checking
   */
  const startAutoCheck = () => {
    if (!process.client) return

    // Check immediately
    checkAllPrices()

    // Then check periodically
    const intervalId = setInterval(() => {
      checkAllPrices()
    }, CHECK_INTERVAL)

    // Clear on unmount
    onUnmounted(() => {
      clearInterval(intervalId)
    })

    return intervalId
  }

  /**
   * Clear triggered alerts
   */
  const clearTriggered = () => {
    alerts.value = alerts.value.filter(a => !a.triggered)
    saveToStorage()
  }

  /**
   * Clear all alerts
   */
  const clearAll = () => {
    alerts.value = []
    saveToStorage()
  }

  /**
   * Get price drop percentage
   */
  const getPriceDropPercentage = (alert: PriceAlert): number => {
    if (!alert.triggered || !alert.triggered_price) return 0

    const drop = alert.current_price - alert.triggered_price
    return Math.round((drop / alert.current_price) * 100)
  }

  /**
   * Calculate savings
   */
  const calculateSavings = (alert: PriceAlert): number => {
    if (!alert.triggered || !alert.triggered_price) return 0
    return alert.current_price - alert.triggered_price
  }

  /**
   * Get triggered alerts
   */
  const getTriggeredAlerts = (): PriceAlert[] => {
    return alerts.value.filter(a => a.triggered)
  }

  /**
   * Get active alerts
   */
  const getActiveAlerts = (): PriceAlert[] => {
    return alerts.value.filter(a => !a.triggered)
  }

  /**
   * Sort alerts
   */
  const sortAlerts = (
    sortBy: 'date' | 'price' | 'name' | 'savings',
    order: 'asc' | 'desc' = 'asc'
  ): PriceAlert[] => {
    const sorted = [...alerts.value].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = a.created_at - b.created_at
          break
        case 'price':
          comparison = a.current_price - b.current_price
          break
        case 'name':
          comparison = a.product_name.localeCompare(b.product_name)
          break
        case 'savings':
          const savingsA = calculateSavings(a)
          const savingsB = calculateSavings(b)
          comparison = savingsA - savingsB
          break
      }

      return order === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  /**
   * Export alerts as CSV
   */
  const exportAsCSV = (): string => {
    const headers = [
      'Produit',
      'Prix actuel (TND)',
      'Prix cible (TND)',
      'Statut',
      'Date création',
      'Prix déclenché (TND)',
      'Économie (TND)',
    ]

    const rows = alerts.value.map(alert => [
      alert.product_name,
      alert.current_price.toString(),
      alert.target_price.toString(),
      alert.triggered ? 'Déclenché' : 'Actif',
      new Date(alert.created_at).toLocaleDateString('fr-FR'),
      alert.triggered_price?.toString() || '',
      alert.triggered ? calculateSavings(alert).toString() : '',
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  /**
   * Download alerts as CSV
   */
  const downloadCSV = () => {
    if (!process.client) return

    const csv = exportAsCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `alertes-prix-${Date.now()}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Get total potential savings
   */
  const getTotalSavings = (): number => {
    return alerts.value
      .filter(a => a.triggered)
      .reduce((sum, alert) => sum + calculateSavings(alert), 0)
  }

  /**
   * Format time since creation
   */
  const formatTimeSince = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const minutes = Math.floor(diff / (60 * 1000))

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    return 'à l'instant'
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.value))
    } catch (error) {
      console.error('Failed to save price alerts:', error)
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
        alerts.value = JSON.parse(saved)

        // Clean up old alerts (> 90 days)
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
        alerts.value = alerts.value.filter(a => a.created_at > ninetyDaysAgo)

        if (alerts.value.length > 0) {
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Failed to load price alerts:', error)
    }
  }

  // Load on mount and start auto-check
  onMounted(() => {
    loadFromStorage()
    startAutoCheck()
  })

  return {
    alerts: readonly(alerts),
    activeAlertsCount,
    triggeredAlertsCount,
    createAlert,
    removeAlert,
    removeAlertByProduct,
    getAlertByProduct,
    hasActiveAlert,
    checkProductPrice,
    checkAllPrices,
    startAutoCheck,
    clearTriggered,
    clearAll,
    getPriceDropPercentage,
    calculateSavings,
    getTriggeredAlerts,
    getActiveAlerts,
    sortAlerts,
    exportAsCSV,
    downloadCSV,
    getTotalSavings,
    formatTimeSince,
  }
}
