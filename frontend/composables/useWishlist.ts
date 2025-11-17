/**
 * Composable for advanced wishlist management
 * Supports multiple lists, sharing, and smart organization
 */

export interface WishlistItem {
  id: string
  product_id: number
  product_name: string
  product_price: number
  product_image: string
  added_at: number
  priority: 'low' | 'medium' | 'high'
  notes?: string
}

export interface Wishlist {
  id: string
  name: string
  description?: string
  items: WishlistItem[]
  created_at: number
  updated_at: number
  is_public: boolean
  color?: string
  icon?: string
}

const STORAGE_KEY = 'user_wishlists'
const DEFAULT_LIST_ID = 'default'

export const useWishlist = () => {
  const wishlists = ref<Wishlist[]>([])

  /**
   * Initialize with default wishlist
   */
  const initializeDefaultList = () => {
    if (wishlists.value.length === 0) {
      wishlists.value.push({
        id: DEFAULT_LIST_ID,
        name: 'Ma liste de souhaits',
        description: 'Liste principale',
        items: [],
        created_at: Date.now(),
        updated_at: Date.now(),
        is_public: false,
        color: '#059669',
        icon: '❤️',
      })
      saveToStorage()
    }
  }

  /**
   * Get wishlist by ID
   */
  const getWishlist = (listId: string): Wishlist | undefined => {
    return wishlists.value.find(list => list.id === listId)
  }

  /**
   * Get default wishlist
   */
  const getDefaultWishlist = (): Wishlist => {
    let list = getWishlist(DEFAULT_LIST_ID)
    if (!list) {
      initializeDefaultList()
      list = getWishlist(DEFAULT_LIST_ID)!
    }
    return list
  }

  /**
   * Create new wishlist
   */
  const createWishlist = (
    name: string,
    options: Partial<Omit<Wishlist, 'id' | 'items' | 'created_at' | 'updated_at'>> = {}
  ): Wishlist => {
    const newList: Wishlist = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description,
      items: [],
      created_at: Date.now(),
      updated_at: Date.now(),
      is_public: options.is_public || false,
      color: options.color || '#059669',
      icon: options.icon || '📋',
    }

    wishlists.value.push(newList)
    saveToStorage()

    return newList
  }

  /**
   * Update wishlist
   */
  const updateWishlist = (
    listId: string,
    updates: Partial<Omit<Wishlist, 'id' | 'items' | 'created_at'>>
  ) => {
    const list = getWishlist(listId)
    if (list) {
      Object.assign(list, updates, { updated_at: Date.now() })
      saveToStorage()
    }
  }

  /**
   * Delete wishlist
   */
  const deleteWishlist = (listId: string) => {
    if (listId === DEFAULT_LIST_ID) {
      throw new Error('Cannot delete default wishlist')
    }

    wishlists.value = wishlists.value.filter(list => list.id !== listId)
    saveToStorage()
  }

  /**
   * Add product to wishlist
   */
  const addToWishlist = (
    product: {
      id: number
      name_fr: string
      price_per_unit: number
      images: string[]
    },
    listId: string = DEFAULT_LIST_ID,
    options: Partial<Pick<WishlistItem, 'priority' | 'notes'>> = {}
  ): boolean => {
    const list = getWishlist(listId)
    if (!list) return false

    // Check if already in list
    if (list.items.some(item => item.product_id === product.id)) {
      return false
    }

    const item: WishlistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_id: product.id,
      product_name: product.name_fr,
      product_price: product.price_per_unit,
      product_image: product.images?.[0] || '',
      added_at: Date.now(),
      priority: options.priority || 'medium',
      notes: options.notes,
    }

    list.items.unshift(item)
    list.updated_at = Date.now()
    saveToStorage()

    return true
  }

  /**
   * Remove from wishlist
   */
  const removeFromWishlist = (productId: number, listId: string = DEFAULT_LIST_ID) => {
    const list = getWishlist(listId)
    if (list) {
      list.items = list.items.filter(item => item.product_id !== productId)
      list.updated_at = Date.now()
      saveToStorage()
    }
  }

  /**
   * Move item between wishlists
   */
  const moveItem = (productId: number, fromListId: string, toListId: string): boolean => {
    const fromList = getWishlist(fromListId)
    const toList = getWishlist(toListId)

    if (!fromList || !toList) return false

    const item = fromList.items.find(i => i.product_id === productId)
    if (!item) return false

    // Check if already in target list
    if (toList.items.some(i => i.product_id === productId)) {
      return false
    }

    // Remove from source
    fromList.items = fromList.items.filter(i => i.product_id !== productId)
    fromList.updated_at = Date.now()

    // Add to target
    toList.items.unshift(item)
    toList.updated_at = Date.now()

    saveToStorage()
    return true
  }

  /**
   * Copy item between wishlists
   */
  const copyItem = (productId: number, fromListId: string, toListId: string): boolean => {
    const fromList = getWishlist(fromListId)
    const toList = getWishlist(toListId)

    if (!fromList || !toList) return false

    const item = fromList.items.find(i => i.product_id === productId)
    if (!item) return false

    // Check if already in target list
    if (toList.items.some(i => i.product_id === productId)) {
      return false
    }

    // Create copy
    const itemCopy = { ...item, id: `item-${Date.now()}`, added_at: Date.now() }
    toList.items.unshift(itemCopy)
    toList.updated_at = Date.now()

    saveToStorage()
    return true
  }

  /**
   * Update item
   */
  const updateItem = (
    productId: number,
    listId: string,
    updates: Partial<Pick<WishlistItem, 'priority' | 'notes'>>
  ) => {
    const list = getWishlist(listId)
    if (list) {
      const item = list.items.find(i => i.product_id === productId)
      if (item) {
        Object.assign(item, updates)
        list.updated_at = Date.now()
        saveToStorage()
      }
    }
  }

  /**
   * Check if product is in any wishlist
   */
  const isInAnyWishlist = (productId: number): boolean => {
    return wishlists.value.some(list =>
      list.items.some(item => item.product_id === productId)
    )
  }

  /**
   * Check if product is in specific wishlist
   */
  const isInWishlist = (productId: number, listId: string): boolean => {
    const list = getWishlist(listId)
    return list ? list.items.some(item => item.product_id === productId) : false
  }

  /**
   * Get all wishlists containing product
   */
  const getListsWithProduct = (productId: number): Wishlist[] => {
    return wishlists.value.filter(list =>
      list.items.some(item => item.product_id === productId)
    )
  }

  /**
   * Get total items count across all lists
   */
  const getTotalItemsCount = computed(() => {
    return wishlists.value.reduce((sum, list) => sum + list.items.length, 0)
  })

  /**
   * Get items count for specific list
   */
  const getListItemsCount = (listId: string): number => {
    const list = getWishlist(listId)
    return list ? list.items.length : 0
  }

  /**
   * Get items by priority across all lists
   */
  const getItemsByPriority = (priority: WishlistItem['priority']): WishlistItem[] => {
    const allItems: WishlistItem[] = []
    wishlists.value.forEach(list => {
      allItems.push(...list.items.filter(item => item.priority === priority))
    })
    return allItems
  }

  /**
   * Get high priority items
   */
  const getHighPriorityItems = (): WishlistItem[] => {
    return getItemsByPriority('high')
  }

  /**
   * Clear all items from wishlist
   */
  const clearWishlist = (listId: string) => {
    const list = getWishlist(listId)
    if (list) {
      list.items = []
      list.updated_at = Date.now()
      saveToStorage()
    }
  }

  /**
   * Export wishlist as JSON
   */
  const exportWishlist = (listId: string): string => {
    const list = getWishlist(listId)
    return list ? JSON.stringify(list, null, 2) : ''
  }

  /**
   * Export wishlist as CSV
   */
  const exportAsCSV = (listId: string): string => {
    const list = getWishlist(listId)
    if (!list) return ''

    const headers = ['Produit', 'Prix (TND)', 'Priorité', 'Notes', 'Date ajout']
    const rows = list.items.map(item => [
      item.product_name,
      item.product_price.toString(),
      item.priority,
      item.notes || '',
      new Date(item.added_at).toLocaleDateString('fr-FR'),
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  /**
   * Download wishlist as file
   */
  const downloadWishlist = (listId: string, format: 'json' | 'csv' = 'csv') => {
    if (!process.client) return

    const list = getWishlist(listId)
    if (!list) return

    const content = format === 'json' ? exportWishlist(listId) : exportAsCSV(listId)
    const mimeType = format === 'json' ? 'application/json' : 'text/csv'
    const extension = format

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${list.name.toLowerCase().replace(/\s+/g, '-')}.${extension}`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Generate shareable link (would need backend support)
   */
  const generateShareLink = (listId: string): string => {
    const list = getWishlist(listId)
    if (!list || !list.is_public) return ''

    // In production, this would generate a real shareable link via backend
    return `${window.location.origin}/wishlist/shared/${listId}`
  }

  /**
   * Calculate total price of wishlist
   */
  const calculateTotalPrice = (listId: string): number => {
    const list = getWishlist(listId)
    if (!list) return 0

    return list.items.reduce((sum, item) => sum + item.product_price, 0)
  }

  /**
   * Sort wishlist items
   */
  const sortItems = (
    listId: string,
    sortBy: 'date' | 'price' | 'name' | 'priority',
    order: 'asc' | 'desc' = 'asc'
  ) => {
    const list = getWishlist(listId)
    if (!list) return

    list.items.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = a.added_at - b.added_at
          break
        case 'price':
          comparison = a.product_price - b.product_price
          break
        case 'name':
          comparison = a.product_name.localeCompare(b.product_name)
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
      }

      return order === 'asc' ? comparison : -comparison
    })

    list.updated_at = Date.now()
    saveToStorage()
  }

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlists.value))
    } catch (error) {
      console.error('Failed to save wishlists:', error)
    }
  }

  /**
   * Load from localStorage
   */
  const loadFromStorage = () => {
    if (!process.client) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        wishlists.value = JSON.parse(saved)
      } else {
        initializeDefaultList()
      }
    } catch (error) {
      console.error('Failed to load wishlists:', error)
      initializeDefaultList()
    }
  }

  // Load on mount
  onMounted(() => {
    loadFromStorage()
  })

  return {
    wishlists: readonly(wishlists),
    getTotalItemsCount,
    getWishlist,
    getDefaultWishlist,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addToWishlist,
    removeFromWishlist,
    moveItem,
    copyItem,
    updateItem,
    isInAnyWishlist,
    isInWishlist,
    getListsWithProduct,
    getListItemsCount,
    getItemsByPriority,
    getHighPriorityItems,
    clearWishlist,
    exportWishlist,
    exportAsCSV,
    downloadWishlist,
    generateShareLink,
    calculateTotalPrice,
    sortItems,
  }
}
