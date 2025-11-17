/**
 * Composable for advanced filtering and sorting
 * Provides comprehensive filtering options for marketplace
 */

export interface FilterOptions {
  categories?: number[]
  priceRange?: { min: number; max: number }
  regions?: string[]
  availability?: 'in_stock' | 'out_of_stock' | 'all'
  rating?: number
  certifications?: string[]
  organic?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'rating' | 'popular'
  search?: string
}

export interface FilterPreset {
  id: string
  name: string
  filters: FilterOptions
}

export const useAdvancedFilters = () => {
  const filters = ref<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 10000 },
    regions: [],
    availability: 'all',
    rating: 0,
    certifications: [],
    organic: false,
    sortBy: 'newest',
    search: '',
  })

  const activeFiltersCount = computed(() => {
    let count = 0

    if (filters.value.categories && filters.value.categories.length > 0) count++
    if (filters.value.priceRange && (filters.value.priceRange.min > 0 || filters.value.priceRange.max < 10000)) count++
    if (filters.value.regions && filters.value.regions.length > 0) count++
    if (filters.value.availability !== 'all') count++
    if (filters.value.rating && filters.value.rating > 0) count++
    if (filters.value.certifications && filters.value.certifications.length > 0) count++
    if (filters.value.organic) count++
    if (filters.value.search && filters.value.search.trim() !== '') count++

    return count
  })

  /**
   * Available filter presets
   */
  const presets = ref<FilterPreset[]>([
    {
      id: 'popular',
      name: 'Les plus populaires',
      filters: {
        sortBy: 'popular',
        availability: 'in_stock',
      },
    },
    {
      id: 'best-price',
      name: 'Meilleur prix',
      filters: {
        sortBy: 'price_asc',
        availability: 'in_stock',
      },
    },
    {
      id: 'organic',
      name: 'Bio uniquement',
      filters: {
        organic: true,
        availability: 'in_stock',
      },
    },
    {
      id: 'high-rated',
      name: 'Mieux notés',
      filters: {
        sortBy: 'rating',
        rating: 4,
      },
    },
    {
      id: 'new',
      name: 'Nouveautés',
      filters: {
        sortBy: 'newest',
        availability: 'in_stock',
      },
    },
  ])

  /**
   * Apply a filter preset
   */
  const applyPreset = (presetId: string) => {
    const preset = presets.value.find((p) => p.id === presetId)
    if (preset) {
      filters.value = { ...filters.value, ...preset.filters }
    }
  }

  /**
   * Update a specific filter
   */
  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    filters.value[key] = value
  }

  /**
   * Toggle category filter
   */
  const toggleCategory = (categoryId: number) => {
    if (!filters.value.categories) {
      filters.value.categories = []
    }

    const index = filters.value.categories.indexOf(categoryId)
    if (index > -1) {
      filters.value.categories.splice(index, 1)
    } else {
      filters.value.categories.push(categoryId)
    }
  }

  /**
   * Toggle region filter
   */
  const toggleRegion = (region: string) => {
    if (!filters.value.regions) {
      filters.value.regions = []
    }

    const index = filters.value.regions.indexOf(region)
    if (index > -1) {
      filters.value.regions.splice(index, 1)
    } else {
      filters.value.regions.push(region)
    }
  }

  /**
   * Toggle certification filter
   */
  const toggleCertification = (certification: string) => {
    if (!filters.value.certifications) {
      filters.value.certifications = []
    }

    const index = filters.value.certifications.indexOf(certification)
    if (index > -1) {
      filters.value.certifications.splice(index, 1)
    } else {
      filters.value.certifications.push(certification)
    }
  }

  /**
   * Set price range
   */
  const setPriceRange = (min: number, max: number) => {
    filters.value.priceRange = { min, max }
  }

  /**
   * Set minimum rating
   */
  const setMinRating = (rating: number) => {
    filters.value.rating = rating
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      regions: [],
      availability: 'all',
      rating: 0,
      certifications: [],
      organic: false,
      sortBy: 'newest',
      search: '',
    }
  }

  /**
   * Clear specific filter
   */
  const clearFilter = (key: keyof FilterOptions) => {
    switch (key) {
      case 'categories':
        filters.value.categories = []
        break
      case 'priceRange':
        filters.value.priceRange = { min: 0, max: 10000 }
        break
      case 'regions':
        filters.value.regions = []
        break
      case 'availability':
        filters.value.availability = 'all'
        break
      case 'rating':
        filters.value.rating = 0
        break
      case 'certifications':
        filters.value.certifications = []
        break
      case 'organic':
        filters.value.organic = false
        break
      case 'search':
        filters.value.search = ''
        break
    }
  }

  /**
   * Build query params from filters
   */
  const buildQueryParams = (): Record<string, any> => {
    const params: Record<string, any> = {}

    if (filters.value.categories && filters.value.categories.length > 0) {
      params.categories = filters.value.categories.join(',')
    }

    if (filters.value.priceRange) {
      if (filters.value.priceRange.min > 0) {
        params.min_price = filters.value.priceRange.min
      }
      if (filters.value.priceRange.max < 10000) {
        params.max_price = filters.value.priceRange.max
      }
    }

    if (filters.value.regions && filters.value.regions.length > 0) {
      params.regions = filters.value.regions.join(',')
    }

    if (filters.value.availability && filters.value.availability !== 'all') {
      params.availability = filters.value.availability
    }

    if (filters.value.rating && filters.value.rating > 0) {
      params.min_rating = filters.value.rating
    }

    if (filters.value.certifications && filters.value.certifications.length > 0) {
      params.certifications = filters.value.certifications.join(',')
    }

    if (filters.value.organic) {
      params.organic = 1
    }

    if (filters.value.sortBy) {
      params.sort_by = filters.value.sortBy
    }

    if (filters.value.search && filters.value.search.trim() !== '') {
      params.search = filters.value.search.trim()
    }

    return params
  }

  /**
   * Save filters to localStorage
   */
  const saveFiltersToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem('marketplace_filters', JSON.stringify(filters.value))
    } catch (error) {
      console.error('Failed to save filters:', error)
    }
  }

  /**
   * Load filters from localStorage
   */
  const loadFiltersFromStorage = () => {
    if (!process.client) return

    try {
      const saved = localStorage.getItem('marketplace_filters')
      if (saved) {
        filters.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load filters:', error)
    }
  }

  /**
   * Create custom preset from current filters
   */
  const createCustomPreset = (name: string): FilterPreset => {
    const customPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters: { ...filters.value },
    }

    presets.value.push(customPreset)
    savePresetsToStorage()

    return customPreset
  }

  /**
   * Delete custom preset
   */
  const deletePreset = (presetId: string) => {
    const index = presets.value.findIndex((p) => p.id === presetId)
    if (index > -1 && presetId.startsWith('custom-')) {
      presets.value.splice(index, 1)
      savePresetsToStorage()
    }
  }

  /**
   * Save presets to localStorage
   */
  const savePresetsToStorage = () => {
    if (!process.client) return

    try {
      const customPresets = presets.value.filter((p) => p.id.startsWith('custom-'))
      localStorage.setItem('marketplace_presets', JSON.stringify(customPresets))
    } catch (error) {
      console.error('Failed to save presets:', error)
    }
  }

  /**
   * Load presets from localStorage
   */
  const loadPresetsFromStorage = () => {
    if (!process.client) return

    try {
      const saved = localStorage.getItem('marketplace_presets')
      if (saved) {
        const customPresets: FilterPreset[] = JSON.parse(saved)
        // Add custom presets to the default ones
        presets.value = [...presets.value.filter((p) => !p.id.startsWith('custom-')), ...customPresets]
      }
    } catch (error) {
      console.error('Failed to load presets:', error)
    }
  }

  /**
   * Get active filter labels
   */
  const getActiveFilterLabels = (): string[] => {
    const labels: string[] = []

    if (filters.value.categories && filters.value.categories.length > 0) {
      labels.push(`${filters.value.categories.length} catégorie(s)`)
    }

    if (filters.value.priceRange && (filters.value.priceRange.min > 0 || filters.value.priceRange.max < 10000)) {
      labels.push(`${filters.value.priceRange.min} - ${filters.value.priceRange.max} TND`)
    }

    if (filters.value.regions && filters.value.regions.length > 0) {
      labels.push(`${filters.value.regions.length} région(s)`)
    }

    if (filters.value.availability !== 'all') {
      labels.push(filters.value.availability === 'in_stock' ? 'En stock' : 'Rupture')
    }

    if (filters.value.rating && filters.value.rating > 0) {
      labels.push(`${filters.value.rating}+ étoiles`)
    }

    if (filters.value.organic) {
      labels.push('Bio')
    }

    return labels
  }

  // Load saved filters on mount
  onMounted(() => {
    loadFiltersFromStorage()
    loadPresetsFromStorage()
  })

  // Watch filters and save to storage
  watch(
    filters,
    () => {
      saveFiltersToStorage()
    },
    { deep: true }
  )

  return {
    filters: readonly(filters),
    activeFiltersCount,
    presets: readonly(presets),
    applyPreset,
    updateFilter,
    toggleCategory,
    toggleRegion,
    toggleCertification,
    setPriceRange,
    setMinRating,
    clearFilters,
    clearFilter,
    buildQueryParams,
    createCustomPreset,
    deletePreset,
    getActiveFilterLabels,
  }
}
