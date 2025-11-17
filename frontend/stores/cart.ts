import { defineStore } from 'pinia'

interface CartItem {
  product_id: number
  product: any
  quantity: number
  price: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: (state) => state.items.reduce((total, item) => total + (item.quantity * item.price), 0),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(product: any, quantity: number = 1) {
      const existingItem = this.items.find(item => item.product_id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          product_id: product.id,
          product: product,
          quantity: quantity,
          price: product.price_per_unit,
        })
      }

      this.saveCart()
    },

    removeItem(productId: number) {
      this.items = this.items.filter(item => item.product_id !== productId)
      this.saveCart()
    },

    updateQuantity(productId: number, quantity: number) {
      const item = this.items.find(item => item.product_id === productId)
      if (item) {
        item.quantity = quantity
        if (item.quantity <= 0) {
          this.removeItem(productId)
        } else {
          this.saveCart()
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveCart()
    },

    saveCart() {
      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    loadCart() {
      if (process.client) {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          this.items = JSON.parse(savedCart)
        }
      }
    },
  },
})
