<template>
  <div class="relative" v-click-outside="closeResults">
    <div class="relative">
      <input
        v-model="query"
        @input="handleInput"
        @focus="showResults = true"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectResult"
        @keydown.esc="closeResults"
        type="text"
        :placeholder="placeholder"
        class="input-field pl-10"
      />

      <!-- Search Icon -->
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Clear Button -->
      <button
        v-if="query"
        @click="clearSearch"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        type="button"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Results Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="showResults && (products.length > 0 || suggestions.length > 0 || loading)"
        class="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
      >
        <!-- Loading -->
        <div v-if="loading" class="p-4 text-center text-gray-500">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <p class="text-sm mt-2">Recherche en cours...</p>
        </div>

        <template v-else>
          <!-- Suggestions -->
          <div v-if="suggestions.length > 0" class="border-b border-gray-200">
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
            <button
              v-for="(suggestion, index) in suggestions"
              :key="'suggestion-' + index"
              @click="applySuggestion(suggestion)"
              :class="[
                'w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition',
                selectedIndex === index && 'bg-primary-50'
              ]"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="text-sm">{{ suggestion }}</span>
            </button>
          </div>

          <!-- Products -->
          <div v-if="products.length > 0">
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Produits</div>
            <NuxtLink
              v-for="(product, index) in products"
              :key="product.id"
              :to="`/products/${product.id}`"
              @click="closeResults"
              :class="[
                'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition',
                selectedIndex === suggestions.length + index && 'bg-primary-50'
              ]"
            >
              <img
                v-if="product.images?.[0]"
                :src="product.images[0]"
                :alt="product.name_fr"
                class="w-12 h-12 object-cover rounded"
              />
              <div v-else class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                🌾
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ product.name_fr }}</p>
                <p class="text-xs text-gray-500">{{ product.category?.name_fr }}</p>
              </div>

              <div class="text-right">
                <p class="font-semibold text-primary-600">{{ product.price_per_unit }} TND</p>
                <p class="text-xs text-gray-500">/ {{ product.unit }}</p>
              </div>
            </NuxtLink>
          </div>

          <!-- No Results -->
          <div v-if="!loading && products.length === 0 && suggestions.length === 0 && query.length > 0" class="p-8 text-center">
            <div class="text-4xl mb-2">🔍</div>
            <p class="text-gray-600">Aucun résultat pour "{{ query }}"</p>
            <p class="text-sm text-gray-500 mt-1">Essayez avec d'autres mots-clés</p>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  minChars?: number
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Rechercher des produits...',
  minChars: 2,
  debounceMs: 300,
})

const config = useRuntimeConfig()
const router = useRouter()

const query = ref('')
const products = ref<any[]>([])
const suggestions = ref<string[]>([])
const loading = ref(false)
const showResults = ref(false)
const selectedIndex = ref(-1)

let debounceTimer: NodeJS.Timeout | null = null

// Common search suggestions
const commonSuggestions = [
  'Tomates bio',
  'Huile d\'olive',
  'Dattes Deglet Nour',
  'Oranges Maltaises',
  'Fraises',
  'Miel',
  'Fromage artisanal',
  'Légumes bio',
]

const handleInput = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (query.value.length < props.minChars) {
    products.value = []
    suggestions.value = []
    return
  }

  debounceTimer = setTimeout(() => {
    searchProducts()
  }, props.debounceMs)
}

const searchProducts = async () => {
  loading.value = true
  showResults.value = true
  selectedIndex.value = -1

  try {
    // Generate suggestions based on query
    suggestions.value = commonSuggestions
      .filter(s => s.toLowerCase().includes(query.value.toLowerCase()))
      .slice(0, 3)

    // Search products
    const response = await $fetch(`${config.public.apiBase}/products`, {
      params: {
        search: query.value,
        per_page: 5,
      },
    })

    products.value = response.products?.data || []
  } catch (error) {
    console.error('Search error:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const applySuggestion = (suggestion: string) => {
  query.value = suggestion
  showResults.value = false
  router.push(`/marketplace?search=${encodeURIComponent(suggestion)}`)
}

const clearSearch = () => {
  query.value = ''
  products.value = []
  suggestions.value = []
  showResults.value = false
}

const closeResults = () => {
  showResults.value = false
  selectedIndex.value = -1
}

const navigateDown = () => {
  const maxIndex = suggestions.value.length + products.value.length - 1
  if (selectedIndex.value < maxIndex) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const selectResult = () => {
  if (selectedIndex.value === -1) {
    if (query.value) {
      router.push(`/marketplace?search=${encodeURIComponent(query.value)}`)
      closeResults()
    }
    return
  }

  if (selectedIndex.value < suggestions.value.length) {
    applySuggestion(suggestions.value[selectedIndex.value])
  } else {
    const productIndex = selectedIndex.value - suggestions.value.length
    const product = products.value[productIndex]
    if (product) {
      router.push(`/products/${product.id}`)
      closeResults()
    }
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
