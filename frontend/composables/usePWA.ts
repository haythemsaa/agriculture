/**
 * Composable for PWA functionality
 * Handles service worker registration, install prompt, and offline detection
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWA = () => {
  const isOnline = ref(true)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null)
  const swRegistration = ref<ServiceWorkerRegistration | null>(null)
  const updateAvailable = ref(false)

  /**
   * Register service worker
   */
  const registerServiceWorker = async () => {
    if (!process.client || !('serviceWorker' in navigator)) {
      console.log('[PWA] Service workers not supported')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      swRegistration.value = registration
      console.log('[PWA] Service worker registered:', registration.scope)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateAvailable.value = true
            console.log('[PWA] Update available')
          }
        })
      })

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)

      return registration
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
    }
  }

  /**
   * Activate waiting service worker
   */
  const activateUpdate = () => {
    if (!swRegistration.value?.waiting) return

    swRegistration.value.waiting.postMessage({ action: 'skipWaiting' })

    // Reload page after activation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }

  /**
   * Show install prompt
   */
  const showInstallPrompt = async () => {
    if (!installPromptEvent.value) {
      console.log('[PWA] No install prompt event available')
      return false
    }

    try {
      // Show the install prompt
      await installPromptEvent.value.prompt()

      // Wait for user choice
      const { outcome } = await installPromptEvent.value.userChoice
      console.log('[PWA] Install prompt outcome:', outcome)

      if (outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        installPromptEvent.value = null
        return true
      }

      return false
    } catch (error) {
      console.error('[PWA] Install prompt error:', error)
      return false
    }
  }

  /**
   * Check if app is installed
   */
  const checkIfInstalled = () => {
    if (!process.client) return false

    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://')

    isInstalled.value = isStandalone
    return isStandalone
  }

  /**
   * Setup online/offline detection
   */
  const setupNetworkDetection = () => {
    if (!process.client) return

    isOnline.value = navigator.onLine

    window.addEventListener('online', () => {
      isOnline.value = true
      console.log('[PWA] Back online')
    })

    window.addEventListener('offline', () => {
      isOnline.value = false
      console.log('[PWA] Gone offline')
    })
  }

  /**
   * Setup install prompt listener
   */
  const setupInstallPromptListener = () => {
    if (!process.client) return

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      installPromptEvent.value = e as BeforeInstallPromptEvent
      isInstallable.value = true
      console.log('[PWA] Install prompt available')
    })

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      installPromptEvent.value = null
      console.log('[PWA] App installed')
    })
  }

  /**
   * Request notification permission
   */
  const requestNotificationPermission = async () => {
    if (!process.client || !('Notification' in window)) {
      console.log('[PWA] Notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  /**
   * Subscribe to push notifications
   */
  const subscribeToPushNotifications = async () => {
    if (!swRegistration.value) {
      console.log('[PWA] No service worker registration')
      return null
    }

    try {
      const permission = await requestNotificationPermission()
      if (permission !== 'granted') {
        console.log('[PWA] Notification permission not granted')
        return null
      }

      // Get push subscription
      const subscription = await swRegistration.value.pushManager.subscribe({
        userVisibleOnly: true,
        // You would need to generate VAPID keys for production
        applicationServerKey: urlBase64ToUint8Array(
          'YOUR_PUBLIC_VAPID_KEY_HERE'
        ),
      })

      console.log('[PWA] Push subscription created:', subscription)

      // Send subscription to server
      // await $fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   body: subscription,
      // })

      return subscription
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error)
      return null
    }
  }

  /**
   * Clear all caches
   */
  const clearCaches = async () => {
    if (!process.client || !('caches' in window)) return

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map((name) => caches.delete(name))
      )
      console.log('[PWA] All caches cleared')
    } catch (error) {
      console.error('[PWA] Clear caches failed:', error)
    }
  }

  /**
   * Get cache size
   */
  const getCacheSize = async () => {
    if (!process.client || !('caches' in window)) return 0

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0

      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const keys = await cache.keys()

        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.blob()
            totalSize += blob.size
          }
        }
      }

      return totalSize
    } catch (error) {
      console.error('[PWA] Get cache size failed:', error)
      return 0
    }
  }

  /**
   * Format bytes to human readable
   */
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Initialize on mount
  onMounted(() => {
    checkIfInstalled()
    setupNetworkDetection()
    setupInstallPromptListener()
    registerServiceWorker()
  })

  return {
    isOnline: readonly(isOnline),
    isInstallable: readonly(isInstallable),
    isInstalled: readonly(isInstalled),
    updateAvailable: readonly(updateAvailable),
    showInstallPrompt,
    activateUpdate,
    requestNotificationPermission,
    subscribeToPushNotifications,
    clearCaches,
    getCacheSize,
    formatBytes,
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
