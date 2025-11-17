<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Mon Panier</h1>

      <!-- Empty Cart -->
      <div v-if="cartStore.isEmpty" class="text-center py-20">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
        <p class="text-gray-600 mb-6">Découvrez nos produits frais et locaux</p>
        <NuxtLink to="/marketplace" class="btn-primary">
          Explorer le Marketplace
        </NuxtLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Items List -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.product_id"
            class="card flex gap-4"
          >
            <!-- Image -->
            <NuxtLink :to="`/products/${item.product_id}`" class="flex-shrink-0">
              <img
                :src="item.product.images?.[0] || '/placeholder.jpg'"
                :alt="item.product.name_fr"
                class="w-24 h-24 object-cover rounded-lg"
              />
            </NuxtLink>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <NuxtLink :to="`/products/${item.product_id}`" class="hover:text-primary-600">
                <h3 class="font-semibold text-lg truncate">{{ item.product.name_fr }}</h3>
              </NuxtLink>

              <div class="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span>👨‍🌾 {{ item.product.agriculteur?.user?.first_name }}</span>
                <span>•</span>
                <span>📍 {{ item.product.origin }}</span>
              </div>

              <div class="flex gap-2 mt-2">
                <span v-if="item.product.is_organic" class="badge badge-sm badge-success">Bio</span>
                <span v-if="item.product.certifications?.includes('aoc')" class="badge badge-sm badge-info">AOC</span>
              </div>

              <!-- Quantity & Price -->
              <div class="flex items-center justify-between mt-4">
                <!-- Quantity Selector -->
                <div class="flex items-center border rounded-lg">
                  <button
                    @click="cartStore.updateQuantity(item.product_id, item.quantity - 1)"
                    class="px-3 py-1 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span class="px-4 py-1 border-x">{{ item.quantity }}</span>
                  <button
                    @click="cartStore.updateQuantity(item.product_id, item.quantity + 1)"
                    class="px-3 py-1 hover:bg-gray-100"
                    :disabled="item.quantity >= item.product.stock_available"
                  >
                    +
                  </button>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <p class="text-sm text-gray-600">{{ item.price }} TND/{{ item.product.unit }}</p>
                  <p class="text-xl font-bold text-primary-600">
                    {{ (item.quantity * item.price).toFixed(2) }} TND
                  </p>
                </div>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              @click="cartStore.removeItem(item.product_id)"
              class="text-red-500 hover:text-red-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="card sticky top-24">
            <h2 class="text-xl font-bold mb-4">Résumé de la commande</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-600">
                <span>Sous-total ({{ cartStore.itemCount }} articles)</span>
                <span>{{ cartStore.subtotal.toFixed(2) }} TND</span>
              </div>

              <div class="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span>{{ deliveryFee.toFixed(2) }} TND</span>
              </div>

              <div v-if="discount > 0" class="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{{ discount.toFixed(2) }} TND</span>
              </div>

              <div class="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span class="text-primary-600">{{ total.toFixed(2) }} TND</span>
              </div>
            </div>

            <!-- Promo Code -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Code promo</label>
              <div class="flex gap-2">
                <input
                  v-model="promoCode"
                  type="text"
                  placeholder="Entrez votre code"
                  class="input-field flex-1"
                />
                <button class="btn-secondary">Appliquer</button>
              </div>
            </div>

            <!-- Checkout Button -->
            <NuxtLink
              to="/checkout"
              class="btn-primary w-full text-center block"
            >
              Passer la commande
            </NuxtLink>

            <button
              @click="navigateTo('/marketplace')"
              class="btn-secondary w-full mt-2"
            >
              Continuer mes achats
            </button>

            <!-- Security Info -->
            <div class="mt-6 pt-6 border-t text-xs text-gray-500 space-y-2">
              <p class="flex items-center">
                <span class="mr-2">🔒</span>
                Paiement sécurisé
              </p>
              <p class="flex items-center">
                <span class="mr-2">✓</span>
                Livraison rapide
              </p>
              <p class="flex items-center">
                <span class="mr-2">↩️</span>
                Retour sous 7 jours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

const promoCode = ref('')
const discount = ref(0)

const deliveryFee = computed(() => {
  if (cartStore.subtotal > 50) return 5
  if (cartStore.subtotal > 0) return 10
  return 0
})

const total = computed(() => {
  return cartStore.subtotal + deliveryFee.value - discount.value
})

onMounted(() => {
  cartStore.loadCart()
})

useHead({
  title: 'Panier',
})
</script>
