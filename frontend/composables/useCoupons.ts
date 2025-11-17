/**
 * Composable for coupons and promo codes
 * Advanced discount system with validation and auto-apply
 */

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo'
  value: number
  description: string
  min_purchase?: number
  max_discount?: number
  valid_from: number
  valid_until: number
  usage_limit?: number
  usage_count: number
  user_limit?: number
  first_time_only: boolean
  categories?: number[]
  products?: number[]
  is_active: boolean
}

export interface AppliedCoupon {
  coupon: Coupon
  discount_amount: number
  applied_at: number
}

const STORAGE_KEY = 'saved_coupons'

export const useCoupons = () => {
  const config = useRuntimeConfig()
  const savedCoupons = ref<Coupon[]>([])
  const appliedCoupon = ref<AppliedCoupon | null>(null)
  const loading = ref(false)

  /**
   * Validate and apply coupon code
   */
  const applyCoupon = async (
    code: string,
    cartTotal: number,
    cartItems: any[]
  ): Promise<{ success: boolean; message: string; discount?: number }> => {
    loading.value = true

    try {
      const response = await $fetch<{
        success: boolean
        message: string
        coupon?: Coupon
        discount_amount?: number
      }>(`${config.public.apiBase}/coupons/validate`, {
        method: 'POST',
        body: {
          code: code.toUpperCase(),
          cart_total: cartTotal,
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      })

      if (response.success && response.coupon && response.discount_amount) {
        appliedCoupon.value = {
          coupon: response.coupon,
          discount_amount: response.discount_amount,
          applied_at: Date.now(),
        }

        return {
          success: true,
          message: response.message,
          discount: response.discount_amount,
        }
      }

      return {
        success: false,
        message: response.message,
      }
    } catch (error: any) {
      console.error('Failed to apply coupon:', error)
      return {
        success: false,
        message: error.data?.message || 'Code invalide ou expiré',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove applied coupon
   */
  const removeCoupon = () => {
    appliedCoupon.value = null
  }

  /**
   * Get available coupons for user
   */
  const getAvailableCoupons = async (): Promise<Coupon[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ coupons: Coupon[] }>(
        `${config.public.apiBase}/coupons/available`
      )

      savedCoupons.value = response.coupons || []
      saveToStorage()

      return savedCoupons.value
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get auto-applicable coupons for cart
   */
  const getAutoApplyCoupons = async (
    cartTotal: number,
    cartItems: any[]
  ): Promise<Coupon[]> => {
    try {
      const response = await $fetch<{ coupons: Coupon[] }>(
        `${config.public.apiBase}/coupons/auto-apply`,
        {
          method: 'POST',
          body: {
            cart_total: cartTotal,
            cart_items: cartItems.map(item => ({
              product_id: item.product_id,
              category_id: item.category_id,
            })),
          },
        }
      )

      return response.coupons || []
    } catch (error) {
      console.error('Failed to get auto-apply coupons:', error)
      return []
    }
  }

  /**
   * Find best coupon automatically
   */
  const findBestCoupon = async (
    cartTotal: number,
    cartItems: any[]
  ): Promise<{ coupon: Coupon; savings: number } | null> => {
    const availableCoupons = await getAutoApplyCoupons(cartTotal, cartItems)

    if (availableCoupons.length === 0) return null

    let bestCoupon: Coupon | null = null
    let maxSavings = 0

    for (const coupon of availableCoupons) {
      const savings = calculateDiscount(coupon, cartTotal, cartItems)
      if (savings > maxSavings) {
        maxSavings = savings
        bestCoupon = coupon
      }
    }

    return bestCoupon ? { coupon: bestCoupon, savings: maxSavings } : null
  }

  /**
   * Calculate discount amount for a coupon
   */
  const calculateDiscount = (
    coupon: Coupon,
    cartTotal: number,
    cartItems: any[]
  ): number => {
    // Check minimum purchase
    if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
      return 0
    }

    let discount = 0

    switch (coupon.type) {
      case 'percentage':
        discount = (cartTotal * coupon.value) / 100
        if (coupon.max_discount) {
          discount = Math.min(discount, coupon.max_discount)
        }
        break

      case 'fixed':
        discount = coupon.value
        break

      case 'free_shipping':
        // Assuming shipping cost is passed
        discount = 0 // Would be shipping cost
        break

      case 'bogo':
        // Buy One Get One logic
        // Would need specific implementation
        discount = 0
        break
    }

    return Math.min(discount, cartTotal) // Can't discount more than total
  }

  /**
   * Check if coupon is valid
   */
  const isCouponValid = (coupon: Coupon): boolean => {
    const now = Date.now()

    // Check active
    if (!coupon.is_active) return false

    // Check dates
    if (now < coupon.valid_from || now > coupon.valid_until) return false

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return false

    return true
  }

  /**
   * Check if user can use coupon
   */
  const canUseCoupon = (coupon: Coupon, isFirstPurchase: boolean): boolean => {
    if (!isCouponValid(coupon)) return false

    // Check first-time only
    if (coupon.first_time_only && !isFirstPurchase) return false

    return true
  }

  /**
   * Get coupon expiry status
   */
  const getExpiryStatus = (coupon: Coupon): 'expired' | 'expiring_soon' | 'valid' => {
    const now = Date.now()
    const daysUntilExpiry = Math.floor((coupon.valid_until - now) / (24 * 60 * 60 * 1000))

    if (now > coupon.valid_until) return 'expired'
    if (daysUntilExpiry <= 3) return 'expiring_soon'
    return 'valid'
  }

  /**
   * Format expiry date
   */
  const formatExpiryDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Get days until expiry
   */
  const getDaysUntilExpiry = (coupon: Coupon): number => {
    const now = Date.now()
    return Math.floor((coupon.valid_until - now) / (24 * 60 * 60 * 1000))
  }

  /**
   * Format discount text
   */
  const formatDiscountText = (coupon: Coupon): string => {
    switch (coupon.type) {
      case 'percentage':
        return `-${coupon.value}%`
      case 'fixed':
        return `-${coupon.value} TND`
      case 'free_shipping':
        return 'Livraison gratuite'
      case 'bogo':
        return 'Achetez 1, obtenez 1 gratuit'
      default:
        return ''
    }
  }

  /**
   * Get minimum purchase text
   */
  const getMinPurchaseText = (coupon: Coupon): string => {
    if (!coupon.min_purchase) return ''
    return `Achat minimum: ${coupon.min_purchase} TND`
  }

  /**
   * Get usage limit text
   */
  const getUsageLimitText = (coupon: Coupon): string => {
    if (!coupon.usage_limit) return 'Utilisation illimitée'

    const remaining = coupon.usage_limit - coupon.usage_count
    if (remaining === 0) return 'Épuisé'
    if (remaining === 1) return 'Dernière utilisation'
    return `${remaining} utilisations restantes`
  }

  /**
   * Save coupon for later
   */
  const saveCouponForLater = (coupon: Coupon) => {
    if (!savedCoupons.value.find(c => c.id === coupon.id)) {
      savedCoupons.value.push(coupon)
      saveToStorage()
    }
  }

  /**
   * Remove saved coupon
   */
  const removeSavedCoupon = (couponId: string) => {
    savedCoupons.value = savedCoupons.value.filter(c => c.id !== couponId)
    saveToStorage()
  }

  /**
   * Get suggested coupons based on cart
   */
  const getSuggestedCoupons = (cartTotal: number): Coupon[] => {
    return savedCoupons.value.filter(coupon => {
      if (!isCouponValid(coupon)) return false
      if (coupon.min_purchase && cartTotal < coupon.min_purchase) return false
      return true
    })
  }

  /**
   * Get cart savings with best coupon
   */
  const getPotentialSavings = async (
    cartTotal: number,
    cartItems: any[]
  ): Promise<number> => {
    const best = await findBestCoupon(cartTotal, cartItems)
    return best ? best.savings : 0
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCoupons.value))
    } catch (error) {
      console.error('Failed to save coupons:', error)
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
        savedCoupons.value = JSON.parse(saved)

        // Filter out expired
        savedCoupons.value = savedCoupons.value.filter(c =>
          Date.now() < c.valid_until
        )

        if (savedCoupons.value.length > 0) {
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Failed to load coupons:', error)
    }
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    savedCoupons: readonly(savedCoupons),
    appliedCoupon: readonly(appliedCoupon),
    loading: readonly(loading),
    applyCoupon,
    removeCoupon,
    getAvailableCoupons,
    getAutoApplyCoupons,
    findBestCoupon,
    calculateDiscount,
    isCouponValid,
    canUseCoupon,
    getExpiryStatus,
    formatExpiryDate,
    getDaysUntilExpiry,
    formatDiscountText,
    getMinPurchaseText,
    getUsageLimitText,
    saveCouponForLater,
    removeSavedCoupon,
    getSuggestedCoupons,
    getPotentialSavings,
  }
}
