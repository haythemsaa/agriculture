<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <button @click="router.back()" class="text-gray-600 hover:text-gray-900">
            ← Retour
          </button>
          <NuxtLink to="/orders" class="text-primary-600 hover:text-primary-700 text-sm">
            Voir toutes mes commandes
          </NuxtLink>
        </div>

        <!-- Success Message -->
        <div v-if="route.query.success" class="card bg-green-50 border border-green-200">
          <div class="flex items-center">
            <span class="text-4xl mr-4">✅</span>
            <div>
              <h3 class="text-lg font-semibold text-green-900">Commande confirmée!</h3>
              <p class="text-green-700">Votre commande a été créée avec succès.</p>
            </div>
          </div>
        </div>

        <!-- Order Header -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold">Commande #{{ order.order_number }}</h1>
              <p class="text-gray-600">Passée le {{ new Date(order.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              }) }}</p>
            </div>
            <span :class="`badge badge-lg ${getStatusBadge(order.status)}`">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <!-- Status Timeline -->
          <div class="mt-6 pt-6 border-t">
            <h3 class="font-semibold mb-4">Suivi de la commande</h3>
            <div class="space-y-3">
              <div
                v-for="(statusItem, index) in statusTimeline"
                :key="index"
                class="flex items-center"
              >
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center mr-4',
                  statusItem.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                ]">
                  {{ statusItem.completed ? '✓' : index + 1 }}
                </div>
                <div class="flex-1">
                  <p :class="['font-medium', statusItem.completed ? 'text-gray-900' : 'text-gray-500']">
                    {{ statusItem.label }}
                  </p>
                  <p v-if="statusItem.date" class="text-sm text-gray-500">
                    {{ new Date(statusItem.date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Items & Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Items -->
            <div class="card">
              <h2 class="font-semibold text-lg mb-4">Articles</h2>
              <div class="space-y-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex gap-4 pb-4 border-b last:border-0"
                >
                  <img
                    :src="item.product?.images?.[0] || '/placeholder.jpg'"
                    :alt="item.product_name"
                    class="w-20 h-20 object-cover rounded-lg"
                  />
                  <div class="flex-1">
                    <h3 class="font-medium">{{ item.product_name }}</h3>
                    <p class="text-sm text-gray-600">
                      {{ item.quantity }} {{ item.unit }} × {{ item.unit_price }} TND
                    </p>
                    <div class="flex gap-2 mt-1">
                      <span v-if="item.product?.is_organic" class="badge badge-sm badge-success">Bio</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-lg">{{ item.total_price }} TND</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delivery Info -->
            <div class="card">
              <h2 class="font-semibold text-lg mb-4">Informations de livraison</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600">Mode de livraison</p>
                  <p class="font-medium">{{ getDeliveryTypeLabel(order.delivery_type) }}</p>
                </div>
                <div v-if="order.delivery_address">
                  <p class="text-sm text-gray-600">Adresse</p>
                  <p class="font-medium">
                    {{ order.delivery_address.street }}<br>
                    {{ order.delivery_address.city }}, {{ order.delivery_address.governorate }}
                    {{ order.delivery_address.postal_code }}
                  </p>
                </div>
                <div v-if="order.delivery_date">
                  <p class="text-sm text-gray-600">Date de livraison souhaitée</p>
                  <p class="font-medium">{{ new Date(order.delivery_date).toLocaleDateString('fr-FR') }}</p>
                </div>
                <div v-if="order.delivery_notes">
                  <p class="text-sm text-gray-600">Notes</p>
                  <p class="font-medium">{{ order.delivery_notes }}</p>
                </div>
              </div>
            </div>

            <!-- Seller Info -->
            <div class="card bg-primary-50">
              <h2 class="font-semibold text-lg mb-4">Vendeur</h2>
              <div class="flex items-center">
                <div class="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl mr-4">
                  👨‍🌾
                </div>
                <div>
                  <p class="font-semibold text-lg">
                    {{ order.agriculteur?.first_name }} {{ order.agriculteur?.last_name }}
                  </p>
                  <p class="text-sm text-gray-600">{{ order.agriculteur?.agriculteur?.farm_name }}</p>
                  <p class="text-sm text-gray-600">📍 {{ order.agriculteur?.agriculteur?.governorate }}</p>
                </div>
              </div>
              <button class="btn-secondary w-full mt-4">
                💬 Contacter le vendeur
              </button>
            </div>
          </div>

          <!-- Summary Sidebar -->
          <div class="space-y-6">
            <!-- Price Summary -->
            <div class="card">
              <h2 class="font-semibold text-lg mb-4">Résumé</h2>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Sous-total</span>
                  <span>{{ order.subtotal }} TND</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Livraison</span>
                  <span>{{ order.delivery_fee }} TND</span>
                </div>
                <div v-if="order.discount > 0" class="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{{ order.discount }} TND</span>
                </div>
                <div class="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span class="text-primary-600">{{ order.total_amount }} TND</span>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="card">
              <h2 class="font-semibold text-lg mb-4">Paiement</h2>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Méthode</span>
                  <span class="font-medium">{{ getPaymentMethodLabel(order.payment_method) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Statut</span>
                  <span :class="[
                    'font-medium',
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                  ]">
                    {{ order.payment_status === 'paid' ? 'Payé' : 'En attente' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card">
              <h2 class="font-semibold text-lg mb-4">Actions</h2>
              <div class="space-y-2">
                <button
                  v-if="order.status === 'delivered' && !order.has_review"
                  class="btn-primary w-full"
                >
                  ⭐ Laisser un avis
                </button>
                <button
                  v-if="canCancelOrder"
                  @click="cancelOrder"
                  class="btn-secondary w-full"
                >
                  ❌ Annuler la commande
                </button>
                <button class="btn-secondary w-full">
                  📄 Télécharger la facture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-20">
        <p class="text-xl text-gray-600 mb-4">Commande introuvable</p>
        <NuxtLink to="/orders" class="btn-primary">
          Voir mes commandes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const order = ref<any>(null)
const loading = ref(true)

const statusTimeline = computed(() => {
  if (!order.value) return []

  const statuses = [
    { key: 'pending', label: 'Commande reçue' },
    { key: 'confirmed', label: 'Confirmée par le vendeur' },
    { key: 'preparing', label: 'En préparation' },
    { key: 'in_delivery', label: 'En cours de livraison' },
    { key: 'delivered', label: 'Livrée' },
  ]

  const currentIndex = statuses.findIndex(s => s.key === order.value.status)

  return statuses.map((status, index) => ({
    ...status,
    completed: index <= currentIndex,
    date: order.value.status_history?.find((h: any) => h.status === status.key)?.timestamp,
  }))
})

const canCancelOrder = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})

const fetchOrder = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/orders/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    order.value = response.order
  } catch (error) {
    console.error('Failed to fetch order:', error)
  } finally {
    loading.value = false
  }
}

const getStatusBadge = (status: string) => {
  const badges = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    preparing: 'badge-info',
    ready: 'badge-info',
    in_delivery: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  }
  return badges[status] || 'badge-secondary'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    in_delivery: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  }
  return labels[status] || status
}

const getDeliveryTypeLabel = (type: string) => {
  const labels = {
    pickup: 'Retrait à la ferme',
    home_delivery: 'Livraison à domicile',
    relay_point: 'Point relais',
    shipping: 'Expédition',
  }
  return labels[type] || type
}

const getPaymentMethodLabel = (method: string) => {
  const labels = {
    card: 'Carte bancaire',
    flouci: 'Flouci',
    d17: 'D17',
    bank_transfer: 'Virement bancaire',
    cod: 'Paiement à la livraison',
  }
  return labels[method] || method
}

const cancelOrder = async () => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette commande?')) return

  try {
    await $fetch(`${config.public.apiBase}/orders/${route.params.id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        reason: 'Annulé par le client',
      },
    })

    await fetchOrder()
  } catch (error) {
    console.error('Failed to cancel order:', error)
    alert('Impossible d\'annuler la commande')
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=' + route.fullPath)
    return
  }

  await fetchOrder()
})

useHead({
  title: `Commande #${order.value?.order_number || ''}`,
})
</script>
