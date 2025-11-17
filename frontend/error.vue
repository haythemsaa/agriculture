<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <span v-if="error.statusCode === 404" class="text-9xl">🔍</span>
        <span v-else-if="error.statusCode === 500" class="text-9xl">⚠️</span>
        <span v-else class="text-9xl">❌</span>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        {{ error.statusCode || 'Erreur' }}
      </h1>

      <!-- Error Message -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">
          {{ errorTitle }}
        </h2>
        <p class="text-gray-600 text-lg">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Additional Info (only in dev mode) -->
      <div v-if="isDev && error.stack" class="mb-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-64">
        <p class="text-sm text-gray-700 font-mono">{{ error.message }}</p>
        <pre class="text-xs text-gray-600 mt-2">{{ error.stack }}</pre>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="handleError"
          class="btn-primary px-8 py-3"
        >
          {{ error.statusCode === 404 ? 'Retour à l\'accueil' : 'Réessayer' }}
        </button>

        <NuxtLink
          v-if="error.statusCode === 404"
          to="/marketplace"
          class="btn-secondary px-8 py-3"
        >
          Voir le marketplace
        </NuxtLink>

        <NuxtLink
          v-else
          to="/"
          class="btn-secondary px-8 py-3"
        >
          Page d'accueil
        </NuxtLink>
      </div>

      <!-- Help Section -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">Besoin d'aide?</p>
        <div class="flex flex-wrap gap-4 justify-center text-sm">
          <NuxtLink to="/contact" class="text-primary-600 hover:text-primary-700 hover:underline">
            📧 Contactez-nous
          </NuxtLink>
          <NuxtLink to="/about" class="text-primary-600 hover:text-primary-700 hover:underline">
            ℹ️ À propos
          </NuxtLink>
          <NuxtLink to="/marketplace" class="text-primary-600 hover:text-primary-700 hover:underline">
            🛍️ Marketplace
          </NuxtLink>
        </div>
      </div>

      <!-- Suggestions for 404 -->
      <div v-if="error.statusCode === 404" class="mt-12">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Vous cherchez peut-être:</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink to="/marketplace" class="card hover:shadow-lg transition p-4">
            <span class="text-3xl mb-2 block">🛍️</span>
            <p class="font-medium">Marketplace</p>
            <p class="text-sm text-gray-600">Produits frais</p>
          </NuxtLink>

          <NuxtLink to="/dashboard" class="card hover:shadow-lg transition p-4">
            <span class="text-3xl mb-2 block">📊</span>
            <p class="font-medium">Dashboard</p>
            <p class="text-sm text-gray-600">Mon compte</p>
          </NuxtLink>

          <NuxtLink to="/weather" class="card hover:shadow-lg transition p-4">
            <span class="text-3xl mb-2 block">🌤️</span>
            <p class="font-medium">Météo</p>
            <p class="text-sm text-gray-600">Prévisions agricoles</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
    stack?: string
  }
}>()

const router = useRouter()
const config = useRuntimeConfig()

const isDev = config.public.env === 'development'

const errorTitle = computed(() => {
  const code = props.error.statusCode

  const titles = {
    404: 'Page introuvable',
    500: 'Erreur serveur',
    403: 'Accès refusé',
    401: 'Non autorisé',
    400: 'Requête invalide',
  }

  return titles[code] || 'Une erreur est survenue'
})

const errorMessage = computed(() => {
  const code = props.error.statusCode

  const messages = {
    404: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
    500: 'Une erreur s\'est produite sur nos serveurs. Nos équipes ont été notifiées et travaillent à résoudre le problème.',
    403: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
    401: 'Vous devez vous connecter pour accéder à cette page.',
    400: 'La requête envoyée est invalide. Veuillez vérifier vos informations.',
  }

  return props.error.statusMessage || messages[code] || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
})

const handleError = () => {
  if (props.error.statusCode === 404) {
    router.push('/')
  } else {
    // Try to go back, or go home if no history
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }
}

useHead({
  title: `Erreur ${props.error.statusCode || ''} - AgriTech Tunisia`,
})
</script>
