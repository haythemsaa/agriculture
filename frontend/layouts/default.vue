<template>
  <ErrorBoundary>
    <SkipNavigation />

    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50 mobile-header safe-top" role="banner">
        <nav id="main-navigation" class="container mx-auto px-4 py-4" role="navigation" aria-label="Navigation principale">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2">
            <span class="text-2xl">🌱</span>
            <span class="text-xl font-bold text-primary-600">AgriTech Tunisia</span>
          </NuxtLink>

          <!-- Navigation -->
          <div class="hidden md:flex items-center space-x-6" role="menubar">
            <NuxtLink
              to="/marketplace"
              class="hover:text-primary-600 transition"
              role="menuitem"
              aria-label="Accéder au marketplace"
            >
              Marketplace
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="hover:text-primary-600 transition"
              role="menuitem"
              aria-label="À propos de nous"
            >
              À propos
            </NuxtLink>
            <NuxtLink
              to="/weather"
              class="hover:text-primary-600 transition"
              role="menuitem"
              aria-label="Consulter la météo"
            >
              Météo
            </NuxtLink>
          </div>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <!-- Favorites -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/favorites"
              class="relative hover:text-primary-600 transition touchable"
              aria-label="Mes favoris"
              :aria-description="favoritesStore.favoritesCount > 0 ? `${favoritesStore.favoritesCount} produits favoris` : 'Aucun favori'"
            >
              <span class="text-2xl" aria-hidden="true">❤️</span>
              <span
                v-if="favoritesStore.favoritesCount > 0"
                class="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                aria-hidden="true"
              >
                {{ favoritesStore.favoritesCount }}
              </span>
            </NuxtLink>

            <!-- Cart -->
            <NuxtLink
              to="/cart"
              class="relative touchable"
              aria-label="Panier"
              :aria-description="cartStore.itemCount > 0 ? `${cartStore.itemCount} articles dans le panier` : 'Panier vide'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span
                v-if="cartStore.itemCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                aria-hidden="true"
              >
                {{ cartStore.itemCount }}
              </span>
            </NuxtLink>

            <!-- User menu -->
            <div v-if="authStore.isAuthenticated" class="relative">
              <button class="flex items-center space-x-2">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-8 h-8 rounded-full" />
                <div v-else class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {{ authStore.user?.first_name?.charAt(0) }}
                </div>
              </button>
            </div>

            <!-- Login/Register -->
            <div v-else class="flex items-center space-x-2">
              <NuxtLink to="/login" class="btn-secondary">
                Connexion
              </NuxtLink>
              <NuxtLink to="/register" class="btn-primary">
                S'inscrire
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </header>

      <!-- Main Content -->
      <main id="main-content" class="flex-grow with-bottom-nav safe-bottom" role="main" tabindex="-1">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-12" role="contentinfo">
        <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4">AgriTech Tunisia</h3>
            <p class="text-gray-400">Connectons agriculteurs et acheteurs directement</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Liens rapides</h4>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/marketplace" class="hover:text-white">Marketplace</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white">À propos</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Pour les agriculteurs</h4>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/register?role=agriculteur" class="hover:text-white">Devenir vendeur</NuxtLink></li>
              <li><NuxtLink to="/dashboard" class="hover:text-white">Dashboard</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
              <li>Email: contact@agritech.tn</li>
              <li>Tél: +216 XX XXX XXX</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 AgriTech Tunisia. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

      <!-- Toast Notifications -->
      <Toast ref="toastRef" />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import { useToast } from '~/composables/useToast'
import { usePerformance } from '~/composables/usePerformance'

const authStore = useAuthStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { setToastInstance } = useToast()
const { measurePageLoad } = usePerformance()
const toastRef = ref(null)

// Initialize stores
onMounted(() => {
  authStore.initAuth()
  cartStore.loadCart()

  // Load favorites if user is authenticated
  if (authStore.isAuthenticated) {
    favoritesStore.fetchFavorites()
  }

  // Initialize toast
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }

  // Start performance monitoring
  measurePageLoad()
})
</script>
