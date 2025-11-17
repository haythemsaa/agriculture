/**
 * Composable for product recommendations
 * Provides intelligent product suggestions based on user behavior
 */

interface Product {
  id: number
  name_fr: string
  price_per_unit: number
  unit: string
  images: string[]
  category?: {
    id: number
    name_fr: string
  }
  average_rating?: number
  stock_available: number
}

export const useRecommendations = () => {
  const config = useRuntimeConfig()
  const { recentProducts } = useRecentlyViewed()
  const cartStore = useCartStore()
  const favoritesStore = useFavoritesStore()

  /**
   * Get recommendations based on a product (similar products)
   */
  const getSimilarProducts = async (productId: number, limit: number = 6): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/products/${productId}/similar`,
        {
          params: { limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch similar products:', error)
      return []
    }
  }

  /**
   * Get recommendations based on user's cart
   */
  const getCartBasedRecommendations = async (limit: number = 6): Promise<Product[]> => {
    if (cartStore.items.length === 0) return []

    try {
      const productIds = cartStore.items.map(item => item.product_id)
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/recommendations/cart`,
        {
          method: 'POST',
          body: { product_ids: productIds, limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch cart recommendations:', error)
      return []
    }
  }

  /**
   * Get recommendations based on recently viewed products
   */
  const getViewBasedRecommendations = async (limit: number = 6): Promise<Product[]> => {
    if (recentProducts.value.length === 0) return []

    try {
      const productIds = recentProducts.value.map(p => p.id).slice(0, 5)
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/recommendations/viewed`,
        {
          method: 'POST',
          body: { product_ids: productIds, limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch view-based recommendations:', error)
      return []
    }
  }

  /**
   * Get recommendations based on favorites
   */
  const getFavoriteBasedRecommendations = async (limit: number = 6): Promise<Product[]> => {
    if (favoritesStore.favorites.length === 0) return []

    try {
      const productIds = favoritesStore.favorites.map(f => f.product_id)
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/recommendations/favorites`,
        {
          method: 'POST',
          body: { product_ids: productIds, limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch favorite-based recommendations:', error)
      return []
    }
  }

  /**
   * Get trending products
   */
  const getTrendingProducts = async (limit: number = 12): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: { data: Product[] } }>(
        `${config.public.apiBase}/products`,
        {
          params: {
            sort_by: 'popular',
            per_page: limit,
          },
        }
      )
      return response.products?.data || []
    } catch (error) {
      console.error('Failed to fetch trending products:', error)
      return []
    }
  }

  /**
   * Get new arrivals
   */
  const getNewArrivals = async (limit: number = 12): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: { data: Product[] } }>(
        `${config.public.apiBase}/products`,
        {
          params: {
            sort_by: 'newest',
            per_page: limit,
          },
        }
      )
      return response.products?.data || []
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error)
      return []
    }
  }

  /**
   * Get best sellers
   */
  const getBestSellers = async (limit: number = 12): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: { data: Product[] } }>(
        `${config.public.apiBase}/products`,
        {
          params: {
            sort_by: 'popular',
            per_page: limit,
          },
        }
      )
      return response.products?.data || []
    } catch (error) {
      console.error('Failed to fetch best sellers:', error)
      return []
    }
  }

  /**
   * Get seasonal products
   */
  const getSeasonalProducts = async (limit: number = 12): Promise<Product[]> => {
    try {
      const currentMonth = new Date().getMonth() + 1
      const response = await $fetch<{ products: { data: Product[] } }>(
        `${config.public.apiBase}/products/seasonal`,
        {
          params: {
            month: currentMonth,
            per_page: limit,
          },
        }
      )
      return response.products?.data || []
    } catch (error) {
      console.error('Failed to fetch seasonal products:', error)
      return []
    }
  }

  /**
   * Get personalized recommendations (combines multiple strategies)
   */
  const getPersonalizedRecommendations = async (limit: number = 12): Promise<Product[]> => {
    try {
      // Try to get recommendations based on user activity
      const strategies = [
        getCartBasedRecommendations(limit / 3),
        getViewBasedRecommendations(limit / 3),
        getFavoriteBasedRecommendations(limit / 3),
      ]

      const results = await Promise.all(strategies)
      const allProducts = results.flat()

      // Remove duplicates
      const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [p.id, p])).values()
      )

      // If not enough personalized recommendations, fill with trending
      if (uniqueProducts.length < limit) {
        const trending = await getTrendingProducts(limit - uniqueProducts.length)
        uniqueProducts.push(...trending)
      }

      return uniqueProducts.slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error)
      // Fallback to trending
      return getTrendingProducts(limit)
    }
  }

  /**
   * Get "Frequently Bought Together" recommendations
   */
  const getFrequentlyBoughtTogether = async (
    productId: number,
    limit: number = 3
  ): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/products/${productId}/bought-together`,
        {
          params: { limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch bought together products:', error)
      return []
    }
  }

  /**
   * Get "Customers Also Viewed" recommendations
   */
  const getCustomersAlsoViewed = async (
    productId: number,
    limit: number = 6
  ): Promise<Product[]> => {
    try {
      const response = await $fetch<{ products: Product[] }>(
        `${config.public.apiBase}/products/${productId}/also-viewed`,
        {
          params: { limit },
        }
      )
      return response.products || []
    } catch (error) {
      console.error('Failed to fetch also viewed products:', error)
      return []
    }
  }

  /**
   * Get recommendations for you (homepage)
   */
  const getForYou = async (limit: number = 12): Promise<Product[]> => {
    return getPersonalizedRecommendations(limit)
  }

  /**
   * Calculate recommendation score (for sorting/filtering)
   */
  const calculateScore = (product: Product, context: {
    userCategories?: number[]
    priceRange?: { min: number; max: number }
    onlyInStock?: boolean
  }): number => {
    let score = 0

    // Rating score (0-5 points)
    if (product.average_rating) {
      score += product.average_rating
    }

    // Category match (0-3 points)
    if (context.userCategories && product.category) {
      if (context.userCategories.includes(product.category.id)) {
        score += 3
      }
    }

    // Price range match (0-2 points)
    if (context.priceRange) {
      const { min, max } = context.priceRange
      if (product.price_per_unit >= min && product.price_per_unit <= max) {
        score += 2
      }
    }

    // Stock availability (0-1 points)
    if (context.onlyInStock && product.stock_available > 0) {
      score += 1
    }

    return score
  }

  return {
    getSimilarProducts,
    getCartBasedRecommendations,
    getViewBasedRecommendations,
    getFavoriteBasedRecommendations,
    getTrendingProducts,
    getNewArrivals,
    getBestSellers,
    getSeasonalProducts,
    getPersonalizedRecommendations,
    getFrequentlyBoughtTogether,
    getCustomersAlsoViewed,
    getForYou,
    calculateScore,
  }
}
