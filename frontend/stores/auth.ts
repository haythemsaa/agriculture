import { defineStore } from 'pinia'

interface User {
  id: number
  role: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar?: string
  agriculteur?: any
  acheteur?: any
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),

  getters: {
    isAgriculteur: (state) => state.user?.role === 'agriculteur',
    isAcheteur: (state) => state.user?.role === 'acheteur',
    isAdmin: (state) => state.user?.role === 'admin',
    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
  },

  actions: {
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { email, password },
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Store token in localStorage
        if (process.client) {
          localStorage.setItem('token', response.token)
        }

        return response
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    async register(userData: any) {
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          body: userData,
        })

        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        // Store token in localStorage
        if (process.client) {
          localStorage.setItem('token', response.token)
        }

        return response
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },

    async logout() {
      const config = useRuntimeConfig()
      try {
        if (this.token) {
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false

        if (process.client) {
          localStorage.removeItem('token')
        }
      }
    },

    async fetchUser() {
      const config = useRuntimeConfig()
      if (!this.token) return

      try {
        const response = await $fetch(`${config.public.apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        this.user = response.user
        this.isAuthenticated = true
      } catch (error) {
        console.error('Failed to fetch user:', error)
        this.logout()
      }
    },

    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('token')
        if (token) {
          this.token = token
          this.fetchUser()
        }
      }
    },
  },
})
