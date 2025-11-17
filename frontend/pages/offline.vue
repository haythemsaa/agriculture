<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Offline Icon -->
      <div class="mb-8 animate-bounce">
        <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-200">
          <svg class="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
      </div>

      <!-- Title & Message -->
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Vous êtes hors ligne
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Pas de connexion Internet détectée. Certaines fonctionnalités peuvent être limitées.
      </p>

      <!-- Status -->
      <div class="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">État de la connexion</span>
          <span
            :class="[
              'flex items-center gap-2 text-sm font-semibold',
              isOnline ? 'text-green-600' : 'text-red-600',
            ]"
          >
            <span
              :class="[
                'w-2 h-2 rounded-full',
                isOnline ? 'bg-green-600 animate-pulse' : 'bg-red-600',
              ]"
            />
            {{ isOnline ? 'En ligne' : 'Hors ligne' }}
          </span>
        </div>

        <div v-if="!isOnline" class="text-xs text-gray-500 mt-2">
          <p>Vérification automatique de la connexion...</p>
          <div class="mt-2 bg-gray-200 h-1 rounded-full overflow-hidden">
            <div class="h-full bg-primary-600 animate-shimmer" />
          </div>
        </div>
      </div>

      <!-- What you can do offline -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 text-left">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ce que vous pouvez faire hors ligne
        </h2>
        <ul class="space-y-3 text-sm text-gray-600">
          <li class="flex items-start gap-3">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>Consulter votre panier et vos favoris</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>Voir les produits récemment consultés</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>Parcourir les pages mises en cache</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-red-600 mt-0.5">✗</span>
            <span>Effectuer des achats (nécessite une connexion)</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-red-600 mt-0.5">✗</span>
            <span>Voir les nouveaux produits</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          @click="retryConnection"
          :disabled="isRetrying"
          class="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          <svg
            v-if="isRetrying"
            class="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isRetrying ? 'Vérification...' : 'Réessayer' }}
        </button>

        <NuxtLink
          to="/"
          class="block w-full py-3 text-center text-primary-600 font-medium hover:underline"
        >
          Retour à l'accueil
        </NuxtLink>
      </div>

      <!-- Tips -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
        <h3 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Conseils
        </h3>
        <ul class="text-xs text-blue-800 space-y-1">
          <li>• Vérifiez votre connexion Wi-Fi ou données mobiles</li>
          <li>• Essayez de désactiver puis réactiver le mode avion</li>
          <li>• Assurez-vous que votre forfait data n'est pas épuisé</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSEO } from '~/composables/useSEO'

const { setMeta } = useSEO()

const isOnline = ref(false)
const isRetrying = ref(false)

// Check online status
const checkOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Retry connection
const retryConnection = async () => {
  isRetrying.value = true

  // Try to fetch a simple resource to check connectivity
  try {
    await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-cache',
    })

    isOnline.value = true

    // Redirect to previous page or home
    if (window.history.length > 1) {
      window.history.back()
    } else {
      await navigateTo('/')
    }
  } catch (error) {
    isOnline.value = false
  } finally {
    isRetrying.value = false
  }
}

// Setup event listeners
onMounted(() => {
  checkOnlineStatus()

  window.addEventListener('online', () => {
    isOnline.value = true

    // Auto-redirect when back online
    setTimeout(() => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        navigateTo('/')
      }
    }, 1000)
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
  })

  // Check periodically
  setInterval(checkOnlineStatus, 5000)
})

// SEO
setMeta({
  title: 'Hors ligne',
  description: 'Vous êtes actuellement hors ligne. Vérifiez votre connexion Internet.',
  robots: 'noindex,nofollow',
})
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
