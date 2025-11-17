<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Mes Commandes</h1>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4">
          <select v-model="filterStatus" class="input-field">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="preparing">En préparation</option>
            <option value="in_delivery">En livraison</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>

          <select v-model="sortBy" class="input-field">
            <option value="recent">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="amount_high">Montant décroissant</option>
            <option value="amount_low">Montant croissant</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Orders List -->
      <div v-else-if="filteredOrders.length > 0" class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="card hover:shadow-lg transition cursor-pointer"
          @click="navigateTo(`/orders/${order.id}`)"
        >
          <!-- Order Header -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg">Commande #{{ order.order_number }}</h3>
              <p class="text-sm text-gray-600">
                {{ new Date(order.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }}
              </p>
            </div>
            <span :class="`badge badge-lg ${getStatusBadge(order.status)}`">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <!-- Order Items Preview -->
          <div class="mb-4">
            <div class="flex items-center gap-3 overflow-x-auto">
              <img
                v-for="(item, index) in order.items?.slice(0, 4)"
                :key="index"
                :src="item.product?.images?.[0] || '/placeholder.jpg'"
                :alt="item.product_name"
                class="w-16 h-16 object-cover rounded-lg"
              />
              <div v-if="order.items?.length > 4" class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-gray-600 font-semibold">+{{ order.items.length - 4 }}</span>
              </div>
            </div>
          </div>

          <!-- Order Footer -->
          <div class="flex items-center justify-between pt-4 border-t">
            <div>
              <p class="text-sm text-gray-600">
                {{ order.items?.length || 0 }} article(s)
              </p>
              <p v-if="order.agriculteur" class="text-sm text-gray-600">
                Vendu par {{ order.agriculteur.first_name }} {{ order.agriculteur.last_name }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Total</p>
              <p class="font-bold text-primary-600 text-xl">{{ order.total_amount }} TND</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex gap-2 mt-4 pt-4 border-t">
            <button
              v-if="order.status === 'delivered' && !order.has_review"
              @click.stop="leaveReview(order.id)"
              class="btn-secondary flex-1"
            >
              ⭐ Laisser un avis
            </button>
            <button
              v-if="canCancelOrder(order)"
              @click.stop="cancelOrder(order.id)"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button class="btn-primary flex-1">
              Voir les détails →
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">📦</div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Aucune commande</h2>
        <p class="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
        <NuxtLink to="/marketplace" class="btn-primary">
          Explorer le Marketplace
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const orders = ref<any[]>([])
const loading = ref(true)
const filterStatus = ref('')
const sortBy = ref('recent')

const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(o => o.status === filterStatus.value)
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount_high':
        return b.total_amount - a.total_amount
      case 'amount_low':
        return a.total_amount - b.total_amount
      default:
        return 0
    }
  })

  return filtered
})

const fetchOrders = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/orders`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    orders.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
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

const canCancelOrder = (order: any) => {
  return ['pending', 'confirmed'].includes(order.status)
}

const cancelOrder = async (orderId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette commande?')) return

  try {
    await $fetch(`${config.public.apiBase}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        reason: 'Annulé par le client',
      },
    })

    await fetchOrders()
  } catch (error) {
    console.error('Failed to cancel order:', error)
  }
}

const leaveReview = (orderId: number) => {
  router.push(`/orders/${orderId}?review=true`)
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/orders')
    return
  }

  await fetchOrders()
})

useHead({
  title: 'Mes Commandes',
})
</script>
