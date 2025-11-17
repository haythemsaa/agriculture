import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface FavoriteProduct {
  id: number
  name_fr: string
  name_ar: string
  name_en: string
  description_fr: string
  price_per_unit: number
  unit: string
  images: string[]
  is_organic: boolean
  category?: {
    id: number
    name_fr: string
  }
  agriculteur?: {
    farm_name: string
    governorate: string
    rating_average: number
    user: {
      first_name: string
      last_name: string
    }
  }
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [] as FavoriteProduct[],
    favoriteIds: new Set<number>(),
    loading: false,
    error: null as string | null,
  }),

  getters: {
    favoritesCount: (state) => state.favorites.length,
    isFavorite: (state) => (productId: number) => state.favoriteIds.has(productId),
  },

  actions: {
    async fetchFavorites() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.loading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/favorites`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        if (response.success) {
          this.favorites = response.favorites.data || []
          this.favoriteIds = new Set(this.favorites.map(f => f.id))
        }
      } catch (error: any) {
        this.error = error.data?.message || 'Erreur lors du chargement des favoris'
        console.error('Failed to fetch favorites:', error)
      } finally {
        this.loading = false
      }
    },

    async toggleFavorite(productId: number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour ajouter des favoris')
      }

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/favorites/${productId}/toggle`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        if (response.success) {
          if (response.is_favorited) {
            this.favoriteIds.add(productId)
          } else {
            this.favoriteIds.delete(productId)
            this.favorites = this.favorites.filter(f => f.id !== productId)
          }
        }

        return response
      } catch (error: any) {
        throw new Error(error.data?.message || 'Erreur lors de la modification des favoris')
      }
    },

    async addFavorite(productId: number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour ajouter des favoris')
      }

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/favorites/${productId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        if (response.success) {
          this.favoriteIds.add(productId)
          await this.fetchFavorites()
        }

        return response
      } catch (error: any) {
        throw new Error(error.data?.message || 'Erreur lors de l\'ajout aux favoris')
      }
    },

    async removeFavorite(productId: number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/favorites/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        if (response.success) {
          this.favoriteIds.delete(productId)
          this.favorites = this.favorites.filter(f => f.id !== productId)
        }

        return response
      } catch (error: any) {
        throw new Error(error.data?.message || 'Erreur lors de la suppression des favoris')
      }
    },

    async checkFavorite(productId: number) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return false

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/favorites/${productId}/check`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })

        return response.is_favorited
      } catch (error) {
        console.error('Failed to check favorite status:', error)
        return false
      }
    },
  },
})
