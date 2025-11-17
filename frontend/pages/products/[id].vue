<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Product Details -->
      <div v-else-if="product" class="space-y-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-600">
          <NuxtLink to="/" class="hover:text-primary-600">Accueil</NuxtLink>
          <span>/</span>
          <NuxtLink to="/marketplace" class="hover:text-primary-600">Marketplace</NuxtLink>
          <span>/</span>
          <span class="text-gray-900">{{ product.name_fr }}</span>
        </nav>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Images Gallery -->
          <div>
            <div class="card p-0 overflow-hidden">
              <img
                :src="selectedImage || product.images?.[0] || '/placeholder.jpg'"
                :alt="product.name_fr"
                class="w-full h-96 object-cover"
              />
            </div>

            <!-- Image Thumbnails -->
            <div v-if="product.images && product.images.length > 1" class="flex gap-2 mt-4">
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="selectedImage = image"
                :class="[
                  'w-20 h-20 border-2 rounded-lg overflow-hidden',
                  selectedImage === image ? 'border-primary-600' : 'border-gray-200'
                ]"
              >
                <img :src="image" :alt="`Image ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6">
            <!-- Title & Badges -->
            <div>
              <div class="flex flex-wrap gap-2 mb-3">
                <span v-if="product.is_organic" class="badge badge-success">🌱 Bio</span>
                <span v-if="product.certifications?.includes('aoc')" class="badge badge-info">AOC</span>
                <span v-if="product.certifications?.includes('halal')" class="badge badge-primary">Halal</span>
                <span class="badge badge-outline">📍 {{ product.origin }}</span>
              </div>

              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name_fr }}</h1>

              <!-- Rating -->
              <div v-if="product.rating_average > 0" class="flex items-center mb-4">
                <div class="flex items-center">
                  <span class="text-yellow-500 text-xl mr-1">⭐</span>
                  <span class="text-lg font-semibold">{{ product.rating_average.toFixed(1) }}</span>
                </div>
                <span class="text-gray-500 ml-2">({{ product.rating_count }} avis)</span>
                <span class="text-gray-400 mx-2">•</span>
                <span class="text-gray-500">{{ product.sales_count }} ventes</span>
              </div>
            </div>

            <!-- Agriculteur -->
            <div class="card bg-primary-50">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl mr-4">
                  👨‍🌾
                </div>
                <div>
                  <p class="text-sm text-gray-600">Vendu par</p>
                  <p class="font-semibold text-lg">{{ product.agriculteur?.user?.first_name }} {{ product.agriculteur?.user?.last_name }}</p>
                  <p class="text-sm text-gray-600">{{ product.agriculteur?.farm_name }}</p>
                  <div v-if="product.agriculteur?.rating_average > 0" class="flex items-center text-sm mt-1">
                    <span class="text-yellow-500 mr-1">⭐</span>
                    <span>{{ product.agriculteur.rating_average.toFixed(1) }}</span>
                    <span class="text-gray-400 mx-1">•</span>
                    <span class="text-gray-600">{{ product.agriculteur.total_orders }} commandes</span>
                  </div>
                </div>
              </div>
              <button class="btn-secondary w-full mt-4">
                📧 Contacter le vendeur
              </button>
            </div>

            <!-- Price & Stock -->
            <div class="card bg-white">
              <div class="flex items-baseline mb-4">
                <span class="text-4xl font-bold text-primary-600">{{ product.price_per_unit }}</span>
                <span class="text-xl text-gray-600 ml-2">TND / {{ product.unit }}</span>
              </div>

              <div class="space-y-2 text-sm mb-4">
                <div class="flex items-center text-gray-600">
                  <span class="mr-2">📦</span>
                  <span>Commande minimum: {{ product.minimum_order }} {{ product.unit }}</span>
                </div>
                <div class="flex items-center" :class="product.stock_available > 10 ? 'text-green-600' : 'text-orange-600'">
                  <span class="mr-2">✓</span>
                  <span>{{ product.stock_available }} {{ product.unit }} disponibles</span>
                </div>
                <div v-if="product.harvest_date" class="flex items-center text-gray-600">
                  <span class="mr-2">🗓️</span>
                  <span>Récolté le {{ new Date(product.harvest_date).toLocaleDateString('fr-FR') }}</span>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div class="flex items-center gap-4 mb-4">
                <label class="text-sm font-medium">Quantité:</label>
                <div class="flex items-center border rounded-lg">
                  <button
                    @click="quantity = Math.max(product.minimum_order, quantity - 1)"
                    class="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    :min="product.minimum_order"
                    :max="product.stock_available"
                    class="w-20 text-center border-x py-2"
                  />
                  <button
                    @click="quantity = Math.min(product.stock_available, quantity + 1)"
                    class="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span class="text-sm text-gray-600">{{ product.unit }}</span>
              </div>

              <!-- Total Price -->
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <span class="text-lg font-medium">Total:</span>
                <span class="text-2xl font-bold text-primary-600">
                  {{ (product.price_per_unit * quantity).toFixed(2) }} TND
                </span>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  @click="addToCart"
                  class="btn-primary flex-1"
                  :disabled="!product.stock_available"
                >
                  🛒 Ajouter au panier
                </button>
                <FavoriteButton
                  :product-id="product.id"
                  show-label
                  button-class="btn-secondary px-6"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Description & Details -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="card">
              <h2 class="text-2xl font-bold mb-4">Description</h2>
              <div class="prose max-w-none text-gray-600">
                {{ product.description_fr || 'Pas de description disponible.' }}
              </div>
            </div>

            <!-- Reviews -->
            <div class="card">
              <h2 class="text-2xl font-bold mb-4">Avis clients</h2>

              <div v-if="product.reviews && product.reviews.length > 0" class="space-y-4">
                <div
                  v-for="review in product.reviews"
                  :key="review.id"
                  class="border-b pb-4 last:border-0"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {{ review.reviewer?.first_name?.[0] }}
                      </div>
                      <div>
                        <p class="font-semibold">{{ review.reviewer?.first_name }} {{ review.reviewer?.last_name }}</p>
                        <p class="text-sm text-gray-500">{{ new Date(review.created_at).toLocaleDateString('fr-FR') }}</p>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <span class="text-yellow-500 mr-1">⭐</span>
                      <span class="font-semibold">{{ review.rating }}/5</span>
                    </div>
                  </div>
                  <p class="text-gray-600">{{ review.comment }}</p>
                </div>
              </div>

              <p v-else class="text-gray-500 text-center py-8">
                Aucun avis pour le moment. Soyez le premier à donner votre avis!
              </p>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Similar Products -->
            <div class="card">
              <h3 class="font-semibold text-lg mb-4">Produits similaires</h3>
              <div v-if="similarProducts.length > 0" class="space-y-3">
                <NuxtLink
                  v-for="similar in similarProducts"
                  :key="similar.id"
                  :to="`/products/${similar.id}`"
                  class="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <img
                    :src="similar.images?.[0] || '/placeholder.jpg'"
                    :alt="similar.name_fr"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm truncate">{{ similar.name_fr }}</p>
                    <p class="text-primary-600 font-semibold">{{ similar.price_per_unit }} TND</p>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Delivery Info -->
            <div class="card bg-blue-50">
              <h3 class="font-semibold text-lg mb-3">🚚 Livraison</h3>
              <div class="space-y-2 text-sm text-gray-700">
                <p>✓ Livraison à domicile disponible</p>
                <p>✓ Retrait à la ferme gratuit</p>
                <p>✓ Point relais disponible</p>
                <p class="text-xs text-gray-500 mt-3">
                  Les frais de livraison seront calculés lors du paiement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else class="text-center py-20">
        <p class="text-xl text-gray-600">Produit non trouvé</p>
        <NuxtLink to="/marketplace" class="btn-primary mt-4">
          Retour au Marketplace
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const config = useRuntimeConfig()
const cartStore = useCartStore()

const product = ref<any>(null)
const similarProducts = ref<any[]>([])
const loading = ref(true)
const selectedImage = ref<string | null>(null)
const quantity = ref(1)

// Fetch product
const fetchProduct = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/products/${route.params.id}`)
    product.value = response.product
    quantity.value = product.value.minimum_order || 1
    selectedImage.value = product.value.images?.[0] || null

    // Fetch similar products
    const similarResponse = await $fetch(`${config.public.apiBase}/products/${route.params.id}/similar`)
    similarProducts.value = similarResponse.products || []
  } catch (error) {
    console.error('Failed to fetch product:', error)
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value)
    alert(`${quantity.value} ${product.value.unit} de ${product.value.name_fr} ajouté(s) au panier!`)
  }
}

onMounted(() => {
  fetchProduct()
})

useHead({
  title: product.value?.name_fr || 'Produit',
})
</script>
