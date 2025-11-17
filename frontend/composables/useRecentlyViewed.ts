/**
 * Composable for tracking recently viewed products
 * Stores in localStorage and provides easy access
 */

interface RecentlyViewedProduct {
  id: number
  name_fr: string
  price_per_unit: number
  unit: string
  images: string[]
  category?: {
    id: number
    name_fr: string
  }
  viewedAt: number
}

const MAX_RECENT_PRODUCTS = 12
const STORAGE_KEY = 'recently_viewed_products'

export const useRecentlyViewed = () => {
  const recentProducts = ref<RecentlyViewedProduct[]>([])

  /**
   * Add product to recently viewed
   */
  const addProduct = (product: any) => {
    if (!process.client) return

    // Remove if already exists
    const filtered = recentProducts.value.filter((p) => p.id !== product.id)

    // Add to beginning with timestamp
    const recentProduct: RecentlyViewedProduct = {
      id: product.id,
      name_fr: product.name_fr,
      price_per_unit: product.price_per_unit,
      unit: product.unit,
      images: product.images || [],
      category: product.category,
      viewedAt: Date.now(),
    }

    recentProducts.value = [recentProduct, ...filtered].slice(0, MAX_RECENT_PRODUCTS)

    // Save to localStorage
    saveToStorage()
  }

  /**
   * Remove product from recently viewed
   */
  const removeProduct = (productId: number) => {
    recentProducts.value = recentProducts.value.filter((p) => p.id !== productId)
    saveToStorage()
  }

  /**
   * Clear all recently viewed products
   */
  const clearAll = () => {
    recentProducts.value = []
    saveToStorage()
  }

  /**
   * Get recently viewed products count
   */
  const count = computed(() => recentProducts.value.length)

  /**
   * Check if product was recently viewed
   */
  const hasViewed = (productId: number): boolean => {
    return recentProducts.value.some((p) => p.id === productId)
  }

  /**
   * Get recently viewed products excluding current
   */
  const getExcluding = (productId: number): RecentlyViewedProduct[] => {
    return recentProducts.value.filter((p) => p.id !== productId)
  }

  /**
   * Get recently viewed products by category
   */
  const getByCategory = (categoryId: number): RecentlyViewedProduct[] => {
    return recentProducts.value.filter((p) => p.category?.id === categoryId)
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentProducts.value))
    } catch (error) {
      console.error('Failed to save recently viewed:', error)
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
        // Filter out products older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        recentProducts.value = parsed.filter(
          (p: RecentlyViewedProduct) => p.viewedAt > thirtyDaysAgo
        )

        // Save back if we filtered anything
        if (recentProducts.value.length !== parsed.length) {
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error)
    }
  }

  /**
   * Get formatted time since viewed
   */
  const getTimeSinceViewed = (productId: number): string => {
    const product = recentProducts.value.find((p) => p.id === productId)
    if (!product) return ''

    const diff = Date.now() - product.viewedAt
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    return `à l'instant`
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    recentProducts: readonly(recentProducts),
    count,
    addProduct,
    removeProduct,
    clearAll,
    hasViewed,
    getExcluding,
    getByCategory,
    getTimeSinceViewed,
  }
}
