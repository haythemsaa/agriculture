<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && product"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

        <!-- Modal -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
            aria-label="Fermer la vue rapide"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Content -->
          <div class="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
            <!-- Image Gallery -->
            <div class="space-y-4">
              <!-- Main Image -->
              <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <LazyImage
                  :src="selectedImage || product.images?.[0] || '/placeholder-product.jpg'"
                  :alt="product.name_fr"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Thumbnail Gallery -->
              <div v-if="product.images && product.images.length > 1" class="flex gap-2 overflow-x-auto">
                <button
                  v-for="(image, index) in product.images"
                  :key="index"
                  @click="selectedImage = image"
                  :class="[
                    'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition',
                    selectedImage === image || (!selectedImage && index === 0)
                      ? 'border-primary-600'
                      : 'border-gray-200 hover:border-gray-300',
                  ]"
                >
                  <img :src="image" :alt="`${product.name_fr} - ${index + 1}`" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <!-- Product Info -->
            <div class="space-y-6">
              <!-- Title & Category -->
              <div>
                <div v-if="product.category" class="text-sm text-primary-600 font-medium mb-2">
                  {{ product.category.name_fr }}
                </div>
                <h2 id="quick-view-title" class="text-3xl font-bold text-gray-900 mb-2">
                  {{ product.name_fr }}
                </h2>
                <div v-if="product.average_rating" class="flex items-center gap-2">
                  <div class="flex items-center">
                    <span v-for="i in 5" :key="i" class="text-xl">
                      {{ i <= Math.round(product.average_rating) ? '⭐' : '☆' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-600">
                    ({{ product.reviews_count || 0 }} avis)
                  </span>
                </div>
              </div>

              <!-- Price -->
              <div class="flex items-baseline gap-3">
                <span class="text-4xl font-bold text-primary-600">
                  {{ product.price_per_unit }} TND
                </span>
                <span class="text-lg text-gray-500">
                  / {{ product.unit }}
                </span>
              </div>

              <!-- Description -->
              <div v-if="product.description_fr" class="prose prose-sm">
                <p class="text-gray-700 line-clamp-4">
                  {{ product.description_fr }}
                </p>
              </div>

              <!-- Stock & Availability -->
              <div class="flex items-center gap-4">
                <div
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    product.stock_available > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ product.stock_available > 0 ? '✓ En stock' : '✗ Rupture de stock' }}
                </div>
                <div v-if="product.stock_available > 0" class="text-sm text-gray-600">
                  {{ product.stock_available }} {{ product.unit }} disponibles
                </div>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <span v-if="product.is_organic" class="badge badge-success">
                  🌿 Bio
                </span>
                <span v-if="product.certifications" class="badge badge-info">
                  ✓ Certifié
                </span>
                <span v-if="product.is_new" class="badge badge-primary">
                  ✨ Nouveau
                </span>
              </div>

              <!-- Quantity Selector -->
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700">Quantité:</label>
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button
                    @click="decrementQuantity"
                    class="px-4 py-2 hover:bg-gray-100 transition"
                    :disabled="quantity <= minQuantity"
                  >
                    −
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    :min="minQuantity"
                    :max="product.stock_available"
                    class="w-20 text-center border-x border-gray-300 py-2"
                  />
                  <button
                    @click="incrementQuantity"
                    class="px-4 py-2 hover:bg-gray-100 transition"
                    :disabled="quantity >= product.stock_available"
                  >
                    +
                  </button>
                </div>
                <span class="text-sm text-gray-600">{{ product.unit }}</span>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  @click="handleAddToCart"
                  :disabled="product.stock_available === 0"
                  class="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ajouter au panier
                </button>
                <button
                  @click="handleToggleFavorite"
                  class="px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                  aria-label="Ajouter aux favoris"
                >
                  <span class="text-2xl">{{ isFavorite ? '❤️' : '🤍' }}</span>
                </button>
              </div>

              <!-- View Full Details -->
              <NuxtLink
                :to="`/products/${product.id}`"
                class="block text-center py-3 text-primary-600 font-medium hover:underline"
                @click="close"
              >
                Voir tous les détails →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useToast } from '~/composables/useToast'

interface Props {
  product: any | null
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { toast } = useToast()

const selectedImage = ref<string | null>(null)
const quantity = ref(1)

const minQuantity = computed(() => props.product?.minimum_order || 1)

const isFavorite = computed(() => {
  if (!props.product) return false
  return favoritesStore.isFavorite(props.product.id)
})

const incrementQuantity = () => {
  if (props.product && quantity.value < props.product.stock_available) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > minQuantity.value) {
    quantity.value--
  }
}

const handleAddToCart = () => {
  if (!props.product) return

  cartStore.addItem(props.product, quantity.value)
  toast.success(
    `${props.product.name_fr} ajouté au panier`,
    `${quantity.value} ${props.product.unit}`
  )
}

const handleToggleFavorite = async () => {
  if (!props.product) return

  if (isFavorite.value) {
    await favoritesStore.removeFavorite(props.product.id)
    toast.info('Retiré des favoris', props.product.name_fr)
  } else {
    await favoritesStore.addFavorite(props.product.id)
    toast.success('Ajouté aux favoris', props.product.name_fr)
  }
}

const close = () => {
  emit('close')
}

// Reset when product changes
watch(() => props.product, () => {
  selectedImage.value = null
  quantity.value = minQuantity.value
})

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.badge-success {
  @apply bg-green-100 text-green-800;
}

.badge-info {
  @apply bg-blue-100 text-blue-800;
}

.badge-primary {
  @apply bg-primary-100 text-primary-800;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
