<template>
  <div class="card hover:shadow-xl transition cursor-pointer" @click="navigateTo(`/products/${product.id}`)">
    <!-- Image -->
    <div class="relative h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden">
      <img
        v-if="product.images && product.images[0]"
        :src="product.images[0]"
        :alt="product.name_fr"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl">
        🌾
      </div>

      <!-- Badges -->
      <div class="absolute top-2 left-2 flex gap-2">
        <span v-if="product.is_organic" class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Bio
        </span>
        <span v-if="product.certifications?.includes('aoc')" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          AOC
        </span>
      </div>

      <!-- Favorite Button -->
      <div class="absolute top-2 right-2" @click.stop>
        <FavoriteButton :product-id="product.id" />
      </div>
    </div>

    <!-- Content -->
    <div>
      <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ product.name_fr }}</h3>

      <!-- Agriculteur -->
      <div class="flex items-center text-sm text-gray-600 mb-2">
        <span class="mr-1">👨‍🌾</span>
        <span>{{ product.agriculteur?.user?.first_name }} {{ product.agriculteur?.user?.last_name }}</span>
      </div>

      <!-- Location -->
      <div class="flex items-center text-sm text-gray-600 mb-3">
        <span class="mr-1">📍</span>
        <span>{{ product.origin }}</span>
      </div>

      <!-- Rating -->
      <div v-if="product.rating_average > 0" class="flex items-center mb-3">
        <span class="text-yellow-500 mr-1">⭐</span>
        <span class="text-sm font-medium">{{ product.rating_average.toFixed(1) }}</span>
        <span class="text-sm text-gray-500 ml-1">({{ product.rating_count }})</span>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between">
        <div>
          <span class="text-2xl font-bold text-primary-600">{{ product.price_per_unit }}</span>
          <span class="text-sm text-gray-600"> TND/{{ product.unit }}</span>
        </div>

        <!-- Add to cart -->
        <button
          @click.stop="addToCart"
          class="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      <!-- Stock warning -->
      <div v-if="product.stock_available < 10 && product.stock_available > 0" class="mt-2 text-xs text-orange-600">
        ⚠️ Stock limité ({{ product.stock_available }} {{ product.unit }})
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  product: any
}>()

const cartStore = useCartStore()
const { toast } = useToast()

const addToCart = () => {
  const quantity = props.product.minimum_order || 1
  cartStore.addItem(props.product, quantity)
  toast.success(`${props.product.name_fr} ajouté au panier!`, `${quantity} ${props.product.unit}`)
}
</script>
