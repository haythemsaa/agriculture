<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2">Mes Favoris</h1>
            <p class="text-gray-600">{{ favoritesStore.favoritesCount }} produit(s) sauvegardé(s)</p>
          </div>
          <NuxtLink to="/marketplace" class="btn-secondary">
            ← Retour au marché
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="card bg-red-50 border border-red-200">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="favoritesStore.favorites.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">❤️</div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-2">Aucun favori pour le moment</h2>
          <p class="text-gray-600 mb-8">Parcourez le marché et ajoutez vos produits préférés</p>
          <NuxtLink to="/marketplace" class="btn-primary">
            Découvrir les produits
          </NuxtLink>
        </div>

        <!-- Favorites Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in favoritesStore.favorites"
            :key="product.id"
            class="card group relative hover:shadow-lg transition-shadow"
          >
            <!-- Remove from Favorites Button -->
            <button
              @click="removeFromFavorites(product.id)"
              class="absolute top-3 right-3 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition shadow-lg"
              title="Retirer des favoris"
            >
              <span class="text-xl">×</span>
            </button>

            <!-- Product Image -->
            <NuxtLink :to="`/products/${product.id}`" class="block">
              <div class="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  v-if="product.images && product.images.length > 0"
                  :src="product.images[0]"
                  :alt="product.name_fr"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="flex items-center justify-center h-full text-6xl">
                  🌾
                </div>

                <!-- Organic Badge -->
                <div v-if="product.is_organic" class="absolute top-2 left-2">
                  <span class="badge badge-sm bg-green-500 text-white">🌱 Bio</span>
                </div>
              </div>
            </NuxtLink>

            <!-- Product Info -->
            <div class="p-4">
              <NuxtLink :to="`/products/${product.id}`">
                <h3 class="font-semibold text-lg mb-1 group-hover:text-primary-600 transition line-clamp-1">
                  {{ product.name_fr }}
                </h3>
              </NuxtLink>

              <!-- Category -->
              <p v-if="product.category" class="text-sm text-gray-500 mb-2">
                {{ product.category.name_fr }}
              </p>

              <!-- Price -->
              <div class="mb-3">
                <span class="text-2xl font-bold text-primary-600">
                  {{ product.price_per_unit }} TND
                </span>
                <span class="text-gray-600 text-sm">/ {{ product.unit }}</span>
              </div>

              <!-- Seller Info -->
              <div v-if="product.agriculteur" class="flex items-center text-sm text-gray-600 mb-3">
                <span class="mr-2">👨‍🌾</span>
                <span class="truncate">{{ product.agriculteur.farm_name }}</span>
              </div>

              <!-- Rating -->
              <div v-if="product.agriculteur?.rating_average" class="flex items-center mb-3">
                <span class="text-yellow-500 mr-1">⭐</span>
                <span class="text-sm font-semibold">{{ product.agriculteur.rating_average.toFixed(1) }}</span>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <NuxtLink :to="`/products/${product.id}`" class="btn-primary flex-1 text-center">
                  Voir le produit
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)

// Redirect if not authenticated
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await loadFavorites()
})

const loadFavorites = async () => {
  loading.value = true
  error.value = null

  try {
    await favoritesStore.fetchFavorites()
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des favoris'
  } finally {
    loading.value = false
  }
}

const removeFromFavorites = async (productId: number) => {
  try {
    await favoritesStore.removeFavorite(productId)
  } catch (err: any) {
    error.value = err.message
  }
}

useHead({
  title: 'Mes Favoris',
})
</script>
