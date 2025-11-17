<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Marketplace Agricole</h1>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="card sticky top-24">
            <h2 class="font-semibold text-lg mb-4">Filtres</h2>

            <!-- Search -->
            <div class="mb-4">
              <input
                v-model="productsStore.filters.search"
                @input="productsStore.fetchProducts(1)"
                type="text"
                placeholder="Rechercher..."
                class="input-field"
              />
            </div>

            <!-- Category -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Catégorie</label>
              <select
                v-model="productsStore.filters.category_id"
                @change="productsStore.fetchProducts(1)"
                class="input-field"
              >
                <option :value="null">Toutes</option>
                <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name_fr }}
                </option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Prix (TND)</label>
              <div class="flex gap-2">
                <input
                  v-model.number="productsStore.filters.min_price"
                  @change="productsStore.fetchProducts(1)"
                  type="number"
                  placeholder="Min"
                  class="input-field"
                />
                <input
                  v-model.number="productsStore.filters.max_price"
                  @change="productsStore.fetchProducts(1)"
                  type="number"
                  placeholder="Max"
                  class="input-field"
                />
              </div>
            </div>

            <!-- Organic -->
            <div class="mb-4">
              <label class="flex items-center">
                <input
                  v-model="productsStore.filters.is_organic"
                  @change="productsStore.fetchProducts(1)"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Bio uniquement</span>
              </label>
            </div>

            <!-- Reset -->
            <button @click="productsStore.resetFilters()" class="btn-secondary w-full">
              Réinitialiser
            </button>
          </div>
        </aside>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Sort -->
          <div class="flex justify-between items-center mb-6">
            <p class="text-gray-600">
              {{ productsStore.pagination.total }} produits
            </p>
            <select
              v-model="productsStore.filters.sort_by"
              @change="productsStore.fetchProducts(1)"
              class="input-field w-48"
            >
              <option value="created_at">Plus récents</option>
              <option value="price">Prix</option>
              <option value="rating">Note</option>
              <option value="popularity">Popularité</option>
            </select>
          </div>

          <!-- Loading -->
          <div v-if="productsStore.loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>

          <!-- Products -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              v-for="product in productsStore.products"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Pagination -->
          <div v-if="productsStore.pagination.last_page > 1" class="mt-8 flex justify-center gap-2">
            <button
              v-for="page in productsStore.pagination.last_page"
              :key="page"
              @click="productsStore.fetchProducts(page)"
              :class="[
                'px-4 py-2 rounded-lg',
                page === productsStore.pagination.current_page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white hover:bg-gray-100'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductsStore } from '~/stores/products'

const productsStore = useProductsStore()

onMounted(async () => {
  await productsStore.fetchCategories()
  await productsStore.fetchProducts()
})

useHead({
  title: 'Marketplace',
})
</script>
