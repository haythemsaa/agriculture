/**
 * Composable for product comparison
 * Allows users to compare multiple products side-by-side
 */

interface ComparisonProduct {
  id: number
  name_fr: string
  price_per_unit: number
  unit: string
  images: string[]
  category?: {
    id: number
    name_fr: string
  }
  stock_available: number
  average_rating?: number
  description_fr?: string
  is_organic?: boolean
  certifications?: string[]
}

const MAX_COMPARISON_PRODUCTS = 4
const STORAGE_KEY = 'product_comparison'

export const useProductComparison = () => {
  const products = ref<ComparisonProduct[]>([])
  const isComparisonOpen = ref(false)

  /**
   * Add product to comparison
   */
  const addProduct = (product: any): boolean => {
    // Check if already in comparison
    if (products.value.some((p) => p.id === product.id)) {
      return false
    }

    // Check max limit
    if (products.value.length >= MAX_COMPARISON_PRODUCTS) {
      return false
    }

    const comparisonProduct: ComparisonProduct = {
      id: product.id,
      name_fr: product.name_fr,
      price_per_unit: product.price_per_unit,
      unit: product.unit,
      images: product.images || [],
      category: product.category,
      stock_available: product.stock_available,
      average_rating: product.average_rating,
      description_fr: product.description_fr,
      is_organic: product.is_organic,
      certifications: product.certifications,
    }

    products.value.push(comparisonProduct)
    saveToStorage()

    return true
  }

  /**
   * Remove product from comparison
   */
  const removeProduct = (productId: number) => {
    products.value = products.value.filter((p) => p.id !== productId)
    saveToStorage()

    // Close comparison if empty
    if (products.value.length === 0) {
      isComparisonOpen.value = false
    }
  }

  /**
   * Clear all products from comparison
   */
  const clearAll = () => {
    products.value = []
    isComparisonOpen.value = false
    saveToStorage()
  }

  /**
   * Check if product is in comparison
   */
  const isInComparison = (productId: number): boolean => {
    return products.value.some((p) => p.id === productId)
  }

  /**
   * Get comparison count
   */
  const count = computed(() => products.value.length)

  /**
   * Check if can add more products
   */
  const canAddMore = computed(() => products.value.length < MAX_COMPARISON_PRODUCTS)

  /**
   * Toggle comparison panel
   */
  const toggleComparison = () => {
    isComparisonOpen.value = !isComparisonOpen.value
  }

  /**
   * Open comparison panel
   */
  const openComparison = () => {
    isComparisonOpen.value = true
  }

  /**
   * Close comparison panel
   */
  const closeComparison = () => {
    isComparisonOpen.value = false
  }

  /**
   * Get comparison statistics
   */
  const getStatistics = () => {
    if (products.value.length === 0) {
      return null
    }

    const prices = products.value.map((p) => p.price_per_unit)
    const ratings = products.value
      .filter((p) => p.average_rating)
      .map((p) => p.average_rating!)

    return {
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      bestRated: ratings.length > 0 ? Math.max(...ratings) : null,
      organicCount: products.value.filter((p) => p.is_organic).length,
      inStockCount: products.value.filter((p) => p.stock_available > 0).length,
    }
  }

  /**
   * Get best value product (best price/rating ratio)
   */
  const getBestValue = (): ComparisonProduct | null => {
    if (products.value.length === 0) return null

    const productsWithRating = products.value.filter((p) => p.average_rating && p.average_rating > 0)

    if (productsWithRating.length === 0) {
      // Just return cheapest if no ratings
      return products.value.reduce((best, current) =>
        current.price_per_unit < best.price_per_unit ? current : best
      )
    }

    // Calculate value score (higher rating / lower price = better value)
    const withScores = productsWithRating.map((p) => ({
      product: p,
      score: (p.average_rating! / p.price_per_unit) * 100,
    }))

    const best = withScores.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    return best.product
  }

  /**
   * Get cheapest product
   */
  const getCheapest = (): ComparisonProduct | null => {
    if (products.value.length === 0) return null

    return products.value.reduce((cheapest, current) =>
      current.price_per_unit < cheapest.price_per_unit ? current : cheapest
    )
  }

  /**
   * Get best rated product
   */
  const getBestRated = (): ComparisonProduct | null => {
    if (products.value.length === 0) return null

    const withRatings = products.value.filter((p) => p.average_rating)
    if (withRatings.length === 0) return null

    return withRatings.reduce((best, current) =>
      (current.average_rating || 0) > (best.average_rating || 0) ? current : best
    )
  }

  /**
   * Export comparison as CSV
   */
  const exportAsCSV = (): string => {
    const headers = ['Produit', 'Prix (TND)', 'Unité', 'Stock', 'Note', 'Bio', 'Catégorie']
    const rows = products.value.map((p) => [
      p.name_fr,
      p.price_per_unit.toString(),
      p.unit,
      p.stock_available.toString(),
      p.average_rating?.toString() || 'N/A',
      p.is_organic ? 'Oui' : 'Non',
      p.category?.name_fr || 'N/A',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')

    return csv
  }

  /**
   * Download comparison as CSV file
   */
  const downloadCSV = () => {
    if (!process.client) return

    const csv = exportAsCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `comparaison-produits-${Date.now()}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value))
    } catch (error) {
      console.error('Failed to save comparison:', error)
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
        products.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load comparison:', error)
    }
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    products: readonly(products),
    count,
    canAddMore,
    isComparisonOpen: readonly(isComparisonOpen),
    addProduct,
    removeProduct,
    clearAll,
    isInComparison,
    toggleComparison,
    openComparison,
    closeComparison,
    getStatistics,
    getBestValue,
    getCheapest,
    getBestRated,
    exportAsCSV,
    downloadCSV,
  }
}
