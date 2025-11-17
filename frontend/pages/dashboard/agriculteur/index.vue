<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Tableau de Bord Agriculteur</h1>
          <p class="text-gray-600">Gérez vos produits et commandes</p>
        </div>
        <NuxtLink to="/dashboard/agriculteur/products/new" class="btn-primary">
          ➕ Ajouter un produit
        </NuxtLink>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Produits actifs</p>
              <p class="text-3xl font-bold">{{ stats.active_products }}</p>
            </div>
            <span class="text-5xl opacity-50">📦</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Ventes du mois</p>
              <p class="text-3xl font-bold">{{ stats.monthly_sales }} TND</p>
            </div>
            <span class="text-5xl opacity-50">💰</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">Commandes en attente</p>
              <p class="text-3xl font-bold">{{ stats.pending_orders }}</p>
            </div>
            <span class="text-5xl opacity-50">⏳</span>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Note moyenne</p>
              <p class="text-3xl font-bold">{{ stats.rating_average }}/5</p>
            </div>
            <span class="text-5xl opacity-50">⭐</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8">
            <button
              @click="activeTab = 'products'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Mes Produits
            </button>
            <button
              @click="activeTab = 'orders'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Commandes
            </button>
            <button
              @click="activeTab = 'reviews'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Avis
            </button>
          </nav>
        </div>
      </div>

      <!-- Products Tab -->
      <div v-if="activeTab === 'products'">
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">Mes Produits</h2>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un produit..."
              class="input-field w-64"
            />
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="filteredProducts.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <img
                        :src="product.images?.[0] || '/placeholder.jpg'"
                        :alt="product.name_fr"
                        class="h-10 w-10 rounded object-cover"
                      />
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ product.name_fr }}</div>
                        <div class="text-sm text-gray-500">{{ product.category?.name_fr }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.price_per_unit }} TND/{{ product.unit }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div :class="[
                      'text-sm font-medium',
                      product.stock_available > 10 ? 'text-green-600' : 'text-orange-600'
                    ]">
                      {{ product.stock_available }} {{ product.unit }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ product.sales_count || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusBadge(product.status)">
                      {{ getStatusLabel(product.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <NuxtLink :to="`/products/${product.id}`" class="text-primary-600 hover:text-primary-900">
                      Voir
                    </NuxtLink>
                    <NuxtLink :to="`/dashboard/agriculteur/products/${product.id}/edit`" class="text-blue-600 hover:text-blue-900">
                      Modifier
                    </NuxtLink>
                    <button @click="toggleProductStatus(product)" class="text-gray-600 hover:text-gray-900">
                      {{ product.status === 'active' ? 'Désactiver' : 'Activer' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">📦</div>
            <p class="text-gray-500 mb-4">Aucun produit trouvé</p>
            <NuxtLink to="/dashboard/agriculteur/products/new" class="btn-primary">
              Ajouter votre premier produit
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'">
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Commandes Reçues</h2>

          <div v-if="orders.length > 0" class="space-y-4">
            <div
              v-for="order in orders"
              :key="order.id"
              class="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="font-semibold text-lg">Commande #{{ order.order_number }}</p>
                  <p class="text-sm text-gray-600">
                    {{ new Date(order.created_at).toLocaleDateString('fr-FR') }}
                  </p>
                </div>
                <span :class="`badge ${getStatusBadge(order.status)}`">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-600">Client</p>
                  <p class="font-medium">{{ order.buyer?.first_name }} {{ order.buyer?.last_name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Montant total</p>
                  <p class="font-bold text-primary-600 text-lg">{{ order.total_amount }} TND</p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t">
                <p class="text-sm text-gray-600">{{ order.items?.length || 0 }} article(s)</p>
                <div class="space-x-2">
                  <NuxtLink :to="`/orders/${order.id}`" class="btn-secondary">
                    Détails
                  </NuxtLink>
                  <button
                    v-if="order.status === 'pending'"
                    @click="confirmOrder(order.id)"
                    class="btn-primary"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-gray-500">Aucune commande pour le moment</p>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-if="activeTab === 'reviews'">
        <div class="card">
          <h2 class="text-xl font-bold mb-6">Avis Clients</h2>
          <div class="text-center py-12 text-gray-500">
            Fonctionnalité à venir
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
const config = useRuntimeConfig()

const activeTab = ref('products')
const searchQuery = ref('')
const loading = ref(true)
const products = ref<any[]>([])
const orders = ref<any[]>([])

const stats = ref({
  active_products: 0,
  monthly_sales: 0,
  pending_orders: 0,
  rating_average: 0,
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(p =>
    p.name_fr.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchDashboardData = async () => {
  if (!authStore.token) return

  try {
    // Fetch products
    const productsResponse = await $fetch(`${config.public.apiBase}/products?agriculteur_id=${authStore.user?.agriculteur?.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    products.value = productsResponse.data || []

    // Fetch orders
    const ordersResponse = await $fetch(`${config.public.apiBase}/orders`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    orders.value = ordersResponse.data || []

    // Calculate stats
    stats.value.active_products = products.value.filter(p => p.status === 'active').length
    stats.value.pending_orders = orders.value.filter(o => o.status === 'pending').length
    stats.value.monthly_sales = authStore.user?.agriculteur?.total_sales || 0
    stats.value.rating_average = authStore.user?.agriculteur?.rating_average || 0
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const getStatusBadge = (status: string) => {
  const badges = {
    active: 'badge badge-success',
    inactive: 'badge badge-secondary',
    out_of_stock: 'badge badge-warning',
    pending: 'badge badge-warning',
    confirmed: 'badge badge-info',
    delivered: 'badge badge-success',
    cancelled: 'badge badge-error',
  }
  return badges[status] || 'badge badge-secondary'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: 'Actif',
    inactive: 'Inactif',
    out_of_stock: 'Rupture de stock',
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

const toggleProductStatus = async (product: any) => {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  try {
    await $fetch(`${config.public.apiBase}/products/${product.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { status: newStatus },
    })
    product.status = newStatus
  } catch (error) {
    console.error('Failed to update product status:', error)
  }
}

const confirmOrder = async (orderId: number) => {
  try {
    await $fetch(`${config.public.apiBase}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { status: 'confirmed' },
    })
    await fetchDashboardData()
  } catch (error) {
    console.error('Failed to confirm order:', error)
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAgriculteur) {
    router.push('/login')
    return
  }

  await fetchDashboardData()
})

useHead({
  title: 'Dashboard Agriculteur',
})
</script>
