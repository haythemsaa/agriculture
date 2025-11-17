import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as any[],
    categories: [] as any[],
    filters: {
      search: '',
      category_id: null,
      governorate: null,
      min_price: null,
      max_price: null,
      is_organic: false,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    },
    loading: false,
  }),

  actions: {
    async fetchProducts(page: number = 1) {
      const config = useRuntimeConfig()
      this.loading = true

      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('per_page', this.pagination.per_page.toString())

        // Add filters
        Object.entries(this.filters).forEach(([key, value]) => {
          if (value !== null && value !== '' && value !== false) {
            params.append(key, value.toString())
          }
        })

        const response = await $fetch(`${config.public.apiBase}/products?${params}`)

        this.products = response.data
        this.pagination = {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(`${config.public.apiBase}/categories`)
        this.categories = response.categories
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    },

    setFilter(key: string, value: any) {
      this.filters[key] = value
      this.fetchProducts(1)
    },

    resetFilters() {
      this.filters = {
        search: '',
        category_id: null,
        governorate: null,
        min_price: null,
        max_price: null,
        is_organic: false,
        sort_by: 'created_at',
        sort_order: 'desc',
      }
      this.fetchProducts(1)
    },
  },
})
