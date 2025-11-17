<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="card text-center">
        <!-- Error Icon -->
        <div class="mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 text-4xl">
            ⚠️
          </div>
        </div>

        <!-- Error Message -->
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ errorTitle }}
        </h1>
        <p class="text-gray-600 mb-6">
          {{ errorMessage }}
        </p>

        <!-- Error Details (Development Only) -->
        <div v-if="showDetails && isDevelopment" class="mb-6">
          <details class="text-left bg-gray-50 rounded-lg p-4">
            <summary class="cursor-pointer font-medium text-sm text-gray-700 mb-2">
              Détails techniques
            </summary>
            <div class="text-xs text-gray-600 font-mono mt-2 overflow-auto max-h-48">
              <p class="mb-2"><strong>Message:</strong> {{ error.message }}</p>
              <p class="mb-2"><strong>Stack:</strong></p>
              <pre class="whitespace-pre-wrap">{{ error.stack }}</pre>
            </div>
          </details>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="retry"
            class="btn-primary"
          >
            🔄 Réessayer
          </button>
          <button
            @click="goHome"
            class="btn-secondary"
          >
            🏠 Retour à l'accueil
          </button>
        </div>

        <!-- Support Info -->
        <div class="mt-6 pt-6 border-t text-sm text-gray-500">
          <p>
            Le problème persiste ?
            <a href="mailto:support@agritech.tn" class="text-primary-600 hover:underline">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal Content -->
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  errorTitle?: string
  errorMessage?: string
  showDetails?: boolean
  onRetry?: () => void
  fallback?: 'component' | 'page'
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: 'Une erreur est survenue',
  errorMessage: 'Nous rencontrons un problème technique. Veuillez réessayer dans quelques instants.',
  showDetails: true,
  fallback: 'component',
})

const router = useRouter()
const error = ref<Error | null>(null)

// Check if we're in development mode
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' ||
         import.meta.env.DEV
})

// Capture errors
const captureError = (err: Error) => {
  error.value = err
  console.error('ErrorBoundary caught error:', err)

  // Log to error tracking service in production
  if (!isDevelopment.value) {
    logErrorToService(err)
  }
}

// Log error to external service (placeholder)
const logErrorToService = (err: Error) => {
  // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
  console.log('Would log to error service:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  })
}

// Retry action
const retry = () => {
  error.value = null

  if (props.onRetry) {
    props.onRetry()
  } else {
    // Default retry: reload the page
    window.location.reload()
  }
}

// Go home
const goHome = () => {
  error.value = null
  router.push('/')
}

// Error handler
onErrorCaptured((err: Error, instance, info) => {
  captureError(err)
  // Return false to prevent error from propagating further
  return false
})

// Global error handler for unhandled errors
if (process.client) {
  window.addEventListener('error', (event) => {
    captureError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    captureError(new Error(event.reason))
  })
}

// Expose reset method
defineExpose({
  reset: () => {
    error.value = null
  },
  captureError,
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-lg p-8;
}

.btn-primary {
  @apply px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition;
}
</style>
