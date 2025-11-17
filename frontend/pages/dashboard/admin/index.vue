<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Dashboard Administrateur</h1>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Utilisateurs Totaux</p>
              <p class="text-3xl font-bold">{{ stats.total_users }}</p>
              <p class="text-sm text-blue-100 mt-1">+{{ stats.new_users_month }} ce mois</p>
            </div>
            <span class="text-5xl opacity-50">👥</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Revenus du Mois</p>
              <p class="text-3xl font-bold">{{ stats.revenue_month }} TND</p>
              <p class="text-sm text-green-100 mt-1">+{{ stats.growth }}% vs mois dernier</p>
            </div>
            <span class="text-5xl opacity-50">💰</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">Commandes Actives</p>
              <p class="text-3xl font-bold">{{ stats.active_orders }}</p>
              <p class="text-sm text-orange-100 mt-1">{{ stats.pending_verification }} à vérifier</p>
            </div>
            <span class="text-5xl opacity-50">📦</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Produits Actifs</p>
              <p class="text-3xl font-bold">{{ stats.active_products }}</p>
              <p class="text-sm text-purple-100 mt-1">{{ stats.out_of_stock }} en rupture</p>
            </div>
            <span class="text-5xl opacity-50">🛍️</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Revenue Chart -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Évolution des Revenus</h2>
          <div class="h-64 flex items-end justify-around space-x-2">
            <div v-for="(month, index) in revenueData" :key="index" class="flex-1 flex flex-col items-center">
              <div
                class="w-full bg-primary-500 rounded-t-lg hover:bg-primary-600 transition cursor-pointer"
                :style="{ height: `${(month.value / maxRevenue) * 100}%` }"
                :title="`${month.label}: ${month.value} TND`"
              ></div>
              <p class="text-xs text-gray-600 mt-2">{{ month.label }}</p>
            </div>
          </div>
        </div>

        <!-- Orders by Status -->
        <div class="card">
          <h2 class="text-xl font-bold mb-4">Commandes par Statut</h2>
          <div class="space-y-3">
            <div v-for="status in ordersByStatus" :key="status.label" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>{{ status.label }}</span>
                <span class="font-semibold">{{ status.count }} ({{ status.percentage }}%)</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="status.color"
                  :style="{ width: `${status.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Recent Orders -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Commandes Récentes</h2>
            <NuxtLink to="/dashboard/admin/orders" class="text-primary-600 text-sm">Voir tout →</NuxtLink>
          </div>
          <div class="space-y-3">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div class="flex-1">
                <p class="font-semibold text-sm">#{{ order.order_number }}</p>
                <p class="text-xs text-gray-600">{{ order.buyer_name }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-primary-600">{{ order.total }} TND</p>
                <span :class="`badge badge-sm ${getStatusBadge(order.status)}`">
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Produits Populaires</h2>
            <NuxtLink to="/dashboard/admin/products" class="text-primary-600 text-sm">Voir tout →</NuxtLink>
          </div>
          <div class="space-y-3">
            <div
              v-for="product in topProducts"
              :key="product.id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <img :src="product.image" :alt="product.name" class="w-12 h-12 object-cover rounded" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">{{ product.name }}</p>
                <p class="text-xs text-gray-600">{{ product.sales }} ventes</p>
              </div>
              <div class="flex items-center">
                <span class="text-yellow-500 mr-1">⭐</span>
                <span class="text-sm font-semibold">{{ product.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Actions -->
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Actions Requises</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-orange-900">Vérifications</h3>
              <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {{ stats.pending_verification }}
              </span>
            </div>
            <p class="text-sm text-orange-700 mb-3">Agriculteurs en attente de vérification</p>
            <button class="btn-secondary w-full text-sm">Vérifier →</button>
          </div>

          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-red-900">Litiges</h3>
              <span class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {{ stats.disputes }}
              </span>
            </div>
            <p class="text-sm text-red-700 mb-3">Commandes avec problèmes</p>
            <button class="btn-secondary w-full text-sm">Résoudre →</button>
          </div>

          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-blue-900">Signalements</h3>
              <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {{ stats.reports }}
              </span>
            </div>
            <p class="text-sm text-blue-700 mb-3">Produits ou utilisateurs signalés</p>
            <button class="btn-secondary w-full text-sm">Examiner →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// Mock data - Replace with real API calls
const stats = ref({
  total_users: 2850,
  new_users_month: 245,
  revenue_month: 45680,
  growth: 23,
  active_orders: 128,
  pending_verification: 12,
  active_products: 456,
  out_of_stock: 23,
  disputes: 5,
  reports: 8,
})

const revenueData = ref([
  { label: 'Jan', value: 25000 },
  { label: 'Fév', value: 28000 },
  { label: 'Mar', value: 32000 },
  { label: 'Avr', value: 35000 },
  { label: 'Mai', value: 38000 },
  { label: 'Jun', value: 42000 },
  { label: 'Jul', value: 45680 },
])

const maxRevenue = computed(() => Math.max(...revenueData.value.map(m => m.value)))

const ordersByStatus = ref([
  { label: 'Livrées', count: 892, percentage: 45, color: 'bg-green-500' },
  { label: 'En livraison', count: 234, percentage: 25, color: 'bg-blue-500' },
  { label: 'En préparation', count: 178, percentage: 18, color: 'bg-orange-500' },
  { label: 'En attente', count: 128, percentage: 12, color: 'bg-yellow-500' },
])

const recentOrders = ref([
  { id: 1, order_number: 'AGR-XYZ123', buyer_name: 'Sarah Gharbi', total: 45.50, status: 'pending' },
  { id: 2, order_number: 'AGR-ABC456', buyer_name: 'Riadh Mejri', total: 128.00, status: 'confirmed' },
  { id: 3, order_number: 'AGR-DEF789', buyer_name: 'Sonia Bouazizi', total: 67.80, status: 'in_delivery' },
  { id: 4, order_number: 'AGR-GHI012', buyer_name: 'Ahmed Trabelsi', total: 92.30, status: 'delivered' },
])

const topProducts = ref([
  { id: 1, name: 'Tomates Bio', image: 'https://via.placeholder.com/100', sales: 234, rating: 4.8 },
  { id: 2, name: 'Huile d\'Olive Extra Vierge', image: 'https://via.placeholder.com/100', sales: 189, rating: 5.0 },
  { id: 3, name: 'Dattes Deglet Nour', image: 'https://via.placeholder.com/100', sales: 167, rating: 4.9 },
  { id: 4, name: 'Oranges Fraîches', image: 'https://via.placeholder.com/100', sales: 156, rating: 4.8 },
])

const getStatusBadge = (status: string) => {
  const badges = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    in_delivery: 'badge-primary',
    delivered: 'badge-success',
  }
  return badges[status] || 'badge-secondary'
}

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/dashboard')
  }
})

useHead({
  title: 'Admin Dashboard',
})
</script>
