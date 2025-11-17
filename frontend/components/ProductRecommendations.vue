<template>
  <div v-if="products.length > 0" class="recommendations-section">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {{ icon }}
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-sm text-gray-600 mt-1">
          {{ subtitle }}
        </p>
      </div>

      <NuxtLink
        v-if="viewAllLink"
        :to="viewAllLink"
        class="text-primary-600 hover:underline text-sm font-medium flex items-center gap-1"
      >
        Voir tout
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>

    <!-- Products Grid -->
    <div
      :class="[
        'grid gap-6',
        layout === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : '',
        layout === 'scroll' ? 'grid-flow-col auto-cols-[280px] overflow-x-auto hide-scrollbar scroll-snap-x' : '',
      ]"
    >
      <div
        v-for="product in displayedProducts"
        :key="product.id"
        class="product-card group"
        :class="layout === 'scroll' && 'scroll-snap-start'"
      >
        <!-- Product Image -->
        <div class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
          <LazyImage
            :src="product.images?.[0] || '/placeholder-product.jpg'"
            :alt="product.name_fr"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          <!-- Quick Actions -->
          <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              @click="handleQuickView(product)"
              class="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
              aria-label="Vue rapide"
              title="Vue rapide"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <button
              @click="handleToggleFavorite(product)"
              class="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
              :aria-label="isFavorite(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            >
              <span class="text-xl">{{ isFavorite(product.id) ? '❤️' : '🤍' }}</span>
            </button>
          </div>

          <!-- Badges -->
          <div class="absolute top-2 left-2 flex flex-col gap-1">
            <span v-if="product.is_organic" class="badge badge-success">
              🌿 Bio
            </span>
            <span v-if="product.is_new" class="badge badge-primary">
              ✨ Nouveau
            </span>
            <span v-if="showRecommendationReason && recommendationReason" class="badge badge-info text-xs">
              {{ recommendationReason }}
            </span>
          </div>

          <!-- Stock Status -->
          <div
            v-if="product.stock_available === 0"
            class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <span class="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
              Rupture de stock
            </span>
          </div>
        </div>

        <!-- Product Info -->
        <NuxtLink :to="`/products/${product.id}`" class="block">
          <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition">
            {{ product.name_fr }}
          </h3>

          <div v-if="product.category" class="text-xs text-gray-500 mb-2">
            {{ product.category.name_fr }}
          </div>

          <!-- Rating -->
          <div v-if="product.average_rating" class="flex items-center gap-1 mb-2">
            <div class="flex">
              <span v-for="i in 5" :key="i" class="text-sm">
                {{ i <= Math.round(product.average_rating) ? '⭐' : '☆' }}
              </span>
            </div>
            <span class="text-xs text-gray-600">
              ({{ product.reviews_count || 0 }})
            </span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-bold text-primary-600">
              {{ product.price_per_unit }} TND
            </span>
            <span class="text-sm text-gray-500">
              / {{ product.unit }}
            </span>
          </div>
        </NuxtLink>

        <!-- Add to Cart Button -->
        <button
          @click="handleAddToCart(product)"
          :disabled="product.stock_available === 0"
          class="mt-3 w-full btn-primary text-sm py-2"
        >
          <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Ajouter au panier
        </button>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="showLoadMore && products.length > limit" class="text-center mt-6">
      <button
        @click="loadMore"
        class="btn-secondary"
      >
        Afficher plus
        <svg class="w-5 h-5 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Quick View Modal -->
    <ProductQuickView
      :product="quickViewProduct"
      :is-open="isQuickViewOpen"
      @close="closeQuickView"
    />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useToast } from '~/composables/useToast'

interface Props {
  products: any[]
  title: string
  subtitle?: string
  icon?: string
  layout?: 'grid' | 'scroll'
  limit?: number
  showLoadMore?: boolean
  viewAllLink?: string
  showRecommendationReason?: boolean
  recommendationReason?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '⭐',
  layout: 'grid',
  limit: 8,
  showLoadMore: false,
  showRecommendationReason: false,
})

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { toast } = useToast()

const displayLimit = ref(props.limit)
const quickViewProduct = ref(null)
const isQuickViewOpen = ref(false)

const displayedProducts = computed(() => {
  return props.products.slice(0, displayLimit.value)
})

const isFavorite = (productId: number): boolean => {
  return favoritesStore.isFavorite(productId)
}

const handleAddToCart = (product: any) => {
  const quantity = product.minimum_order || 1
  cartStore.addItem(product, quantity)
  toast.success(
    `${product.name_fr} ajouté au panier`,
    `${quantity} ${product.unit}`
  )
}

const handleToggleFavorite = async (product: any) => {
  if (isFavorite(product.id)) {
    await favoritesStore.removeFavorite(product.id)
    toast.info('Retiré des favoris', product.name_fr)
  } else {
    await favoritesStore.addFavorite(product.id)
    toast.success('Ajouté aux favoris', product.name_fr)
  }
}

const handleQuickView = (product: any) => {
  quickViewProduct.value = product
  isQuickViewOpen.value = true
}

const closeQuickView = () => {
  isQuickViewOpen.value = false
  quickViewProduct.value = null
}

const loadMore = () => {
  displayLimit.value += props.limit
}
</script>

<style scoped>
.badge {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.badge-success {
  @apply bg-green-100 text-green-800;
}

.badge-primary {
  @apply bg-primary-100 text-primary-800;
}

.badge-info {
  @apply bg-blue-100 text-blue-800;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.scroll-snap-x {
  scroll-snap-type: x mandatory;
}

.scroll-snap-start {
  scroll-snap-align: start;
}
</style>
