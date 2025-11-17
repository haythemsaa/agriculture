<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
        <p class="text-gray-600">Bienvenue, {{ authStore.user?.first_name }}!</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-primary-100 text-sm">Commandes</p>
              <p class="text-3xl font-bold">{{ stats.orders }}</p>
            </div>
            <span class="text-5xl opacity-50">📦</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Montant total</p>
              <p class="text-3xl font-bold">{{ stats.total_spent }} TND</p>
            </div>
            <span class="text-5xl opacity-50">💰</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Points fidélité</p>
              <p class="text-3xl font-bold">{{ stats.loyalty_points }}</p>
            </div>
            <span class="text-5xl opacity-50">⭐</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">Avis donnés</p>
              <p class="text-3xl font-bold">{{ stats.reviews }}</p>
            </div>
            <span class="text-5xl opacity-50">⭐</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NuxtLink
          v-if="authStore.isAgriculteur"
          to="/dashboard/products/new"
          class="card hover:shadow-lg transition text-center py-8"
        >
          <span class="text-5xl mb-3 block">➕</span>
          <h3 class="font-semibold text-lg">Ajouter un produit</h3>
          <p class="text-gray-600 text-sm mt-1">Publier un nouveau produit</p>
        </NuxtLink>

        <NuxtLink to="/marketplace" class="card hover:shadow-lg transition text-center py-8">
          <span class="text-5xl mb-3 block">🛒</span>
          <h3 class="font-semibold text-lg">Explorer</h3>
          <p class="text-gray-600 text-sm mt-1">Découvrir les produits</p>
        </NuxtLink>

        <NuxtLink to="/orders" class="card hover:shadow-lg transition text-center py-8">
          <span class="text-5xl mb-3 block">📋</span>
          <h3 class="font-semibold text-lg">Mes commandes</h3>
          <p class="text-gray-600 text-sm mt-1">Suivre mes commandes</p>
        </NuxtLink>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Commandes récentes</h2>
          <NuxtLink to="/orders" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tout →
          </NuxtLink>
        </div>

        <div v-if="recentOrders.length > 0" class="space-y-4">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="border rounded-lg p-4 hover:shadow-md transition"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-semibold">Commande #{{ order.order_number }}</p>
                <p class="text-sm text-gray-600">
                  {{ new Date(order.created_at).toLocaleDateString('fr-FR') }}
                </p>
              </div>
              <span :class="`badge ${getStatusBadge(order.status)}`">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">{{ order.items.length }} article(s)</p>
              <p class="font-bold text-primary-600">{{ order.total_amount }} TND</p>
            </div>
          </div>
        </div>

        <p v-else class="text-center text-gray-500 py-8">
          Aucune commande pour le moment
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

const stats = ref({
  orders: 0,
  total_spent: 0,
  loyalty_points: 0,
  reviews: 0,
})

const recentOrders = ref<any[]>([])

const fetchDashboardData = async () => {
  if (!authStore.token) return

  try {
    const response = await $fetch(`${config.public.apiBase}/orders?per_page=5`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    recentOrders.value = response.data || []

    // Calculate stats
    if (authStore.user?.acheteur) {
      stats.value.orders = authStore.user.acheteur.total_orders || 0
      stats.value.total_spent = authStore.user.acheteur.total_spent || 0
      stats.value.loyalty_points = authStore.user.acheteur.loyalty_points || 0
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
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

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await fetchDashboardData()
})

useHead({
  title: 'Dashboard',
})
</script>
