<template>
  <div class="space-y-6">
    <!-- Rating Summary -->
    <div v-if="stats" class="card bg-gray-50">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Overall Rating -->
        <div class="text-center md:text-left">
          <div class="flex items-baseline justify-center md:justify-start mb-2">
            <span class="text-5xl font-bold text-primary-600">{{ stats.average || 0 }}</span>
            <span class="text-2xl text-gray-600 ml-2">/ 5</span>
          </div>
          <div class="flex items-center justify-center md:justify-start mb-2">
            <div class="flex">
              <span v-for="star in 5" :key="star" class="text-2xl">
                {{ star <= Math.round(stats.average) ? '⭐' : '☆' }}
              </span>
            </div>
          </div>
          <p class="text-gray-600">Basé sur {{ stats.total }} avis</p>
        </div>

        <!-- Rating Distribution -->
        <div v-if="stats.distribution" class="space-y-2">
          <div v-for="(count, rating) in stats.distribution" :key="rating" class="flex items-center gap-3">
            <span class="text-sm font-medium w-12">{{ rating }} ⭐</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div
                class="bg-yellow-500 h-2 rounded-full transition-all"
                :style="{ width: `${(count / stats.total) * 100}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-4">
      <h3 class="text-xl font-bold">Avis des clients</h3>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!reviews || reviews.length === 0" class="text-center py-10">
        <div class="text-5xl mb-3">💬</div>
        <p class="text-gray-600">Aucun avis pour le moment</p>
        <p class="text-sm text-gray-500 mt-2">Soyez le premier à donner votre avis!</p>
      </div>

      <!-- Reviews -->
      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="card border border-gray-200"
        >
          <!-- Reviewer Info -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-600">
                {{ review.reviewer?.first_name?.charAt(0) }}{{ review.reviewer?.last_name?.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold">
                  {{ review.reviewer?.first_name }} {{ review.reviewer?.last_name?.charAt(0) }}.
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(review.created_at) }}
                  <span v-if="review.is_verified_purchase" class="text-green-600 ml-2">✓ Achat vérifié</span>
                </p>
              </div>
            </div>

            <!-- Rating Stars -->
            <div class="flex">
              <span v-for="star in review.rating" :key="star" class="text-yellow-500">⭐</span>
              <span v-for="star in (5 - review.rating)" :key="'empty-' + star" class="text-gray-300">⭐</span>
            </div>
          </div>

          <!-- Comment -->
          <div v-if="review.comment" class="mb-3">
            <p class="text-gray-700">{{ review.comment }}</p>
          </div>

          <!-- Images (if any) -->
          <div v-if="review.images && review.images.length > 0" class="flex gap-2 mb-3">
            <img
              v-for="(image, index) in review.images.slice(0, 4)"
              :key="index"
              :src="image"
              class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
              @click="openImage(image)"
            />
          </div>

          <!-- Product (if shown) -->
          <div v-if="review.product && showProduct" class="text-sm text-gray-600 mb-3">
            Produit: <span class="font-medium">{{ review.product.name_fr }}</span>
          </div>

          <!-- Agriculteur Response -->
          <div v-if="review.response" class="mt-3 pt-3 border-t border-gray-200 bg-blue-50 -mx-6 px-6 py-3">
            <div class="flex items-start gap-3">
              <span class="text-2xl">👨‍🌾</span>
              <div class="flex-1">
                <p class="text-sm font-semibold text-blue-900 mb-1">Réponse du vendeur</p>
                <p class="text-sm text-gray-700">{{ review.response }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(review.responded_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  reviews: any[]
  stats?: {
    average: number
    total: number
    distribution: Record<number, number>
  }
  loading?: boolean
  showProduct?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showProduct: false,
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const openImage = (imageUrl: string) => {
  // Open image in a modal or new tab (implement later)
  window.open(imageUrl, '_blank')
}
</script>
