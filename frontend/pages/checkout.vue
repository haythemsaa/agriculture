<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">Finaliser la commande</h1>

      <!-- Redirect if cart empty -->
      <div v-if="cartStore.isEmpty" class="text-center py-20">
        <p class="text-xl text-gray-600 mb-4">Votre panier est vide</p>
        <NuxtLink to="/marketplace" class="btn-primary">
          Explorer le Marketplace
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Step 1: Livraison -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">1. Livraison</h2>
              <span class="badge badge-primary">Étape 1/3</span>
            </div>

            <div class="space-y-4">
              <!-- Delivery Type -->
              <div>
                <label class="block text-sm font-medium mb-2">Mode de livraison *</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    v-for="type in deliveryTypes"
                    :key="type.value"
                    :class="[
                      'border-2 rounded-lg p-4 cursor-pointer transition',
                      order.delivery_type === type.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    ]"
                  >
                    <input
                      v-model="order.delivery_type"
                      type="radio"
                      :value="type.value"
                      class="sr-only"
                    />
                    <div class="flex items-start">
                      <span class="text-2xl mr-3">{{ type.icon }}</span>
                      <div class="flex-1">
                        <p class="font-semibold">{{ type.label }}</p>
                        <p class="text-sm text-gray-600">{{ type.description }}</p>
                        <p class="text-sm font-semibold text-primary-600 mt-1">{{ type.price }}</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Address Form -->
              <div v-if="order.delivery_type === 'home_delivery' || order.delivery_type === 'shipping'">
                <h3 class="font-semibold mb-3">Adresse de livraison</h3>
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium mb-1">Rue *</label>
                    <input v-model="order.delivery_address.street" type="text" required class="input-field" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium mb-1">Ville *</label>
                      <input v-model="order.delivery_address.city" type="text" required class="input-field" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1">Code postal</label>
                      <input v-model="order.delivery_address.postal_code" type="text" class="input-field" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Gouvernorat *</label>
                    <select v-model="order.delivery_address.governorate" required class="input-field">
                      <option value="">Sélectionner</option>
                      <option value="Tunis">Tunis</option>
                      <option value="Ariana">Ariana</option>
                      <option value="Nabeul">Nabeul</option>
                      <option value="Sousse">Sousse</option>
                      <!-- Add more governorates -->
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Notes (optionnel)</label>
                    <textarea v-model="order.delivery_notes" rows="2" class="input-field"></textarea>
                  </div>
                </div>
              </div>

              <!-- Delivery Date -->
              <div>
                <label class="block text-sm font-medium mb-2">Date de livraison souhaitée</label>
                <input v-model="order.delivery_date" type="date" :min="minDate" class="input-field" />
              </div>
            </div>
          </div>

          <!-- Step 2: Paiement -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">2. Paiement</h2>
              <span class="badge badge-primary">Étape 2/3</span>
            </div>

            <div class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                :class="[
                  'border-2 rounded-lg p-4 cursor-pointer transition flex items-center',
                  order.payment_method === method.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                ]"
              >
                <input
                  v-model="order.payment_method"
                  type="radio"
                  :value="method.value"
                  class="mr-3"
                />
                <span class="text-2xl mr-3">{{ method.icon }}</span>
                <div class="flex-1">
                  <p class="font-semibold">{{ method.label }}</p>
                  <p class="text-sm text-gray-600">{{ method.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold">3. Confirmation</h2>
              <span class="badge badge-primary">Étape 3/3</span>
            </div>

            <div class="space-y-4">
              <!-- Terms -->
              <label class="flex items-start">
                <input v-model="acceptTerms" type="checkbox" required class="mt-1 mr-2" />
                <span class="text-sm text-gray-600">
                  J'accepte les <a href="#" class="text-primary-600 hover:underline">conditions générales de vente</a>
                  et la <a href="#" class="text-primary-600 hover:underline">politique de confidentialité</a>
                </span>
              </label>

              <!-- Newsletter -->
              <label class="flex items-start">
                <input v-model="acceptNewsletter" type="checkbox" class="mt-1 mr-2" />
                <span class="text-sm text-gray-600">
                  Je souhaite recevoir les offres et actualités d'AgriTech Tunisia
                </span>
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            @click="submitOrder"
            :disabled="!acceptTerms || loading"
            class="btn-primary w-full py-4 text-lg"
          >
            <span v-if="loading">Traitement en cours...</span>
            <span v-else>Confirmer et payer ({{ orderTotal.toFixed(2) }} TND)</span>
          </button>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="card sticky top-24">
            <h2 class="text-xl font-bold mb-4">Résumé</h2>

            <!-- Items -->
            <div class="space-y-3 mb-4 max-h-60 overflow-y-auto">
              <div
                v-for="item in cartStore.items"
                :key="item.product_id"
                class="flex gap-3 text-sm"
              >
                <img
                  :src="item.product.images?.[0] || '/placeholder.jpg'"
                  :alt="item.product.name_fr"
                  class="w-12 h-12 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ item.product.name_fr }}</p>
                  <p class="text-gray-600">{{ item.quantity }} × {{ item.price }} TND</p>
                </div>
                <p class="font-semibold">{{ (item.quantity * item.price).toFixed(2) }} TND</p>
              </div>
            </div>

            <!-- Totals -->
            <div class="border-t pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{{ cartStore.subtotal.toFixed(2) }} TND</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Livraison</span>
                <span>{{ deliveryFee.toFixed(2) }} TND</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Commission ({{ commissionRate * 100 }}%)</span>
                <span>{{ commission.toFixed(2) }} TND</span>
              </div>
              <div class="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span class="text-primary-600">{{ orderTotal.toFixed(2) }} TND</span>
              </div>
            </div>

            <!-- Security -->
            <div class="mt-6 pt-6 border-t">
              <p class="flex items-center text-sm text-gray-600 mb-2">
                <span class="mr-2">🔒</span>
                Paiement 100% sécurisé
              </p>
              <p class="flex items-center text-sm text-gray-600">
                <span class="mr-2">✓</span>
                Garantie satisfaction
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
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const deliveryTypes = [
  { value: 'pickup', label: 'Retrait à la ferme', description: 'Récupérez vos produits directement', icon: '🚜', price: 'Gratuit' },
  { value: 'home_delivery', label: 'Livraison à domicile', description: 'Livré chez vous', icon: '🚚', price: '5-10 TND' },
  { value: 'relay_point', label: 'Point relais', description: 'Dans un point relais proche', icon: '📍', price: '3 TND' },
  { value: 'shipping', label: 'Expédition', description: 'Livraison nationale', icon: '📦', price: '15 TND' },
]

const paymentMethods = [
  { value: 'card', label: 'Carte bancaire', description: 'Visa, Mastercard', icon: '💳' },
  { value: 'flouci', label: 'Flouci', description: 'Paiement mobile', icon: '📱' },
  { value: 'd17', label: 'D17', description: 'Paiement mobile', icon: '📱' },
  { value: 'cod', label: 'Paiement à la livraison', description: 'Payer en espèces', icon: '💵' },
]

const order = reactive({
  delivery_type: 'home_delivery',
  delivery_address: {
    street: '',
    city: '',
    postal_code: '',
    governorate: '',
  },
  delivery_date: '',
  delivery_notes: '',
  payment_method: 'card',
})

const acceptTerms = ref(false)
const acceptNewsletter = ref(false)
const loading = ref(false)
const error = ref('')

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const deliveryFee = computed(() => {
  if (order.delivery_type === 'pickup') return 0
  if (order.delivery_type === 'relay_point') return 3
  if (order.delivery_type === 'home_delivery') return cartStore.subtotal > 50 ? 5 : 10
  return 15
})

const commissionRate = computed(() => {
  if (cartStore.subtotal < 50) return 0.12
  if (cartStore.subtotal > 200) return 0.08
  return 0.10
})

const commission = computed(() => cartStore.subtotal * commissionRate.value)

const orderTotal = computed(() => cartStore.subtotal + deliveryFee.value)

const submitOrder = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }

  if (!acceptTerms.value) {
    error.value = 'Vous devez accepter les conditions générales'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_type === 'home_delivery' || order.delivery_type === 'shipping'
        ? order.delivery_address
        : null,
      delivery_date: order.delivery_date || null,
      delivery_notes: order.delivery_notes,
      payment_method: order.payment_method,
    }

    const response = await $fetch(`${config.public.apiBase}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: orderData,
    })

    // Clear cart
    cartStore.clearCart()

    // Redirect to order confirmation
    router.push(`/orders/${response.order.id}?success=true`)
  } catch (err: any) {
    console.error('Order creation failed:', err)
    error.value = err.response?.data?.error || 'Erreur lors de la création de la commande'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
  }

  if (cartStore.isEmpty) {
    router.push('/cart')
  }
})

useHead({
  title: 'Finaliser la commande',
})
</script>
