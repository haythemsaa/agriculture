/**
 * Composable for product reviews and ratings
 * Complete review system with photos, verified purchases, and voting
 */

export interface Review {
  id: string
  product_id: number
  user_id: number
  user_name: string
  user_avatar?: string
  rating: number
  title: string
  comment: string
  photos?: string[]
  verified_purchase: boolean
  helpful_count: number
  not_helpful_count: number
  created_at: number
  updated_at?: number
  seller_response?: {
    message: string
    created_at: number
  }
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  verified_percentage: number
  with_photos_percentage: number
}

const STORAGE_KEY = 'user_reviews'

export const useReviews = () => {
  const config = useRuntimeConfig()
  const reviews = ref<Review[]>([])
  const loading = ref(false)

  /**
   * Fetch reviews for a product
   */
  const fetchProductReviews = async (
    productId: number,
    options: {
      sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'
      filter?: 'all' | 'verified' | 'with_photos' | '5_star' | '4_star' | '3_star' | '2_star' | '1_star'
      page?: number
      perPage?: number
    } = {}
  ): Promise<Review[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ reviews: Review[] }>(
        `${config.public.apiBase}/products/${productId}/reviews`,
        {
          params: {
            sort: options.sort || 'recent',
            filter: options.filter || 'all',
            page: options.page || 1,
            per_page: options.perPage || 10,
          },
        }
      )

      reviews.value = response.reviews || []
      return reviews.value
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get review statistics for a product
   */
  const getReviewStats = async (productId: number): Promise<ReviewStats | null> => {
    try {
      const response = await $fetch<{ stats: ReviewStats }>(
        `${config.public.apiBase}/products/${productId}/reviews/stats`
      )
      return response.stats
    } catch (error) {
      console.error('Failed to fetch review stats:', error)
      return null
    }
  }

  /**
   * Submit a new review
   */
  const submitReview = async (
    productId: number,
    reviewData: {
      rating: number
      title: string
      comment: string
      photos?: File[]
    }
  ): Promise<Review | null> => {
    loading.value = true

    try {
      const formData = new FormData()
      formData.append('product_id', productId.toString())
      formData.append('rating', reviewData.rating.toString())
      formData.append('title', reviewData.title)
      formData.append('comment', reviewData.comment)

      // Add photos
      if (reviewData.photos) {
        reviewData.photos.forEach((photo, index) => {
          formData.append(`photos[${index}]`, photo)
        })
      }

      const response = await $fetch<{ review: Review }>(
        `${config.public.apiBase}/reviews`,
        {
          method: 'POST',
          body: formData,
        }
      )

      return response.review
    } catch (error) {
      console.error('Failed to submit review:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing review
   */
  const updateReview = async (
    reviewId: string,
    updates: Partial<Pick<Review, 'rating' | 'title' | 'comment'>>
  ): Promise<boolean> => {
    loading.value = true

    try {
      await $fetch(`${config.public.apiBase}/reviews/${reviewId}`, {
        method: 'PATCH',
        body: updates,
      })

      // Update local review
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        Object.assign(review, updates, { updated_at: Date.now() })
      }

      return true
    } catch (error) {
      console.error('Failed to update review:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a review
   */
  const deleteReview = async (reviewId: string): Promise<boolean> => {
    loading.value = true

    try {
      await $fetch(`${config.public.apiBase}/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      reviews.value = reviews.value.filter(r => r.id !== reviewId)
      return true
    } catch (error) {
      console.error('Failed to delete review:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark review as helpful
   */
  const markHelpful = async (reviewId: string, helpful: boolean): Promise<boolean> => {
    try {
      await $fetch(`${config.public.apiBase}/reviews/${reviewId}/vote`, {
        method: 'POST',
        body: { helpful },
      })

      // Update local counts
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        if (helpful) {
          review.helpful_count++
        } else {
          review.not_helpful_count++
        }
      }

      return true
    } catch (error) {
      console.error('Failed to vote on review:', error)
      return false
    }
  }

  /**
   * Report a review
   */
  const reportReview = async (reviewId: string, reason: string): Promise<boolean> => {
    try {
      await $fetch(`${config.public.apiBase}/reviews/${reviewId}/report`, {
        method: 'POST',
        body: { reason },
      })
      return true
    } catch (error) {
      console.error('Failed to report review:', error)
      return false
    }
  }

  /**
   * Get user's review for a product
   */
  const getUserReview = async (productId: number): Promise<Review | null> => {
    try {
      const response = await $fetch<{ review: Review | null }>(
        `${config.public.apiBase}/products/${productId}/my-review`
      )
      return response.review
    } catch (error) {
      console.error('Failed to fetch user review:', error)
      return null
    }
  }

  /**
   * Check if user can review product (purchased)
   */
  const canReview = async (productId: number): Promise<boolean> => {
    try {
      const response = await $fetch<{ can_review: boolean }>(
        `${config.public.apiBase}/products/${productId}/can-review`
      )
      return response.can_review
    } catch (error) {
      console.error('Failed to check review eligibility:', error)
      return false
    }
  }

  /**
   * Calculate helpful percentage
   */
  const getHelpfulPercentage = (review: Review): number => {
    const total = review.helpful_count + review.not_helpful_count
    if (total === 0) return 0
    return Math.round((review.helpful_count / total) * 100)
  }

  /**
   * Format relative time
   */
  const formatReviewDate = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `il y a ${years} an${years > 1 ? 's' : ''}`
    if (months > 0) return `il y a ${months} mois`
    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`
    return 'Aujourd\'hui'
  }

  /**
   * Get star distribution percentage
   */
  const getStarPercentage = (stats: ReviewStats, star: number): number => {
    if (stats.total_reviews === 0) return 0
    return Math.round((stats.rating_distribution[star as keyof typeof stats.rating_distribution] / stats.total_reviews) * 100)
  }

  /**
   * Get reviews summary text
   */
  const getReviewsSummary = (stats: ReviewStats): string => {
    if (stats.total_reviews === 0) return 'Aucun avis'

    const avg = stats.average_rating.toFixed(1)
    const total = stats.total_reviews
    const plural = total > 1 ? 's' : ''

    return `${avg} sur 5 (${total} avis${plural})`
  }

  /**
   * Filter reviews by rating
   */
  const filterByRating = (rating: number): Review[] => {
    return reviews.value.filter(r => r.rating === rating)
  }

  /**
   * Filter verified reviews only
   */
  const getVerifiedReviews = (): Review[] => {
    return reviews.value.filter(r => r.verified_purchase)
  }

  /**
   * Filter reviews with photos
   */
  const getReviewsWithPhotos = (): Review[] => {
    return reviews.value.filter(r => r.photos && r.photos.length > 0)
  }

  /**
   * Get most helpful reviews
   */
  const getMostHelpful = (limit: number = 5): Review[] => {
    return [...reviews.value]
      .sort((a, b) => b.helpful_count - a.helpful_count)
      .slice(0, limit)
  }

  /**
   * Get recent reviews
   */
  const getRecent = (limit: number = 5): Review[] => {
    return [...reviews.value]
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit)
  }

  /**
   * Calculate review sentiment (positive/negative)
   */
  const getSentiment = (rating: number): 'positive' | 'neutral' | 'negative' => {
    if (rating >= 4) return 'positive'
    if (rating >= 3) return 'neutral'
    return 'negative'
  }

  return {
    reviews: readonly(reviews),
    loading: readonly(loading),
    fetchProductReviews,
    getReviewStats,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
    reportReview,
    getUserReview,
    canReview,
    getHelpfulPercentage,
    formatReviewDate,
    getStarPercentage,
    getReviewsSummary,
    filterByRating,
    getVerifiedReviews,
    getReviewsWithPhotos,
    getMostHelpful,
    getRecent,
    getSentiment,
  }
}
