// Service Worker for AgriTech Tunisia PWA
// Version 1.5.0

const CACHE_VERSION = 'agritech-v1.5.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/marketplace',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 60

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION)

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION)

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('agritech-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )

  // Take control of all pages immediately
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
    return
  }

  // Images - Cache first, network fallback
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
    return
  }

  // Static assets - Cache first
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // All other requests - Network first, cache fallback
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// Cache first strategy
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())

      // Limit cache size
      if (cacheName === IMAGE_CACHE) {
        limitCacheSize(cacheName, MAX_IMAGE_CACHE_SIZE)
      }
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Cache first failed:', error)

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline')
      if (offlineResponse) {
        return offlineResponse
      }
    }

    return new Response('Offline', { status: 503 })
  }
}

// Network first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())

      // Limit cache size
      limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_SIZE)
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network first failed, trying cache:', error)

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline')
      if (offlineResponse) {
        return offlineResponse
      }
    }

    return new Response('Offline', { status: 503 })
  }
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(keysToDelete.map((key) => cache.delete(key)))
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart())
  }

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites())
  }
})

// Sync cart with server
async function syncCart() {
  try {
    // Get pending cart updates from IndexedDB
    // This would be implemented with actual IndexedDB operations
    console.log('[SW] Syncing cart...')

    // Send updates to server
    // await fetch('/api/cart/sync', { method: 'POST', body: ... })

    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Cart sync failed:', error)
    return Promise.reject(error)
  }
}

// Sync favorites with server
async function syncFavorites() {
  try {
    console.log('[SW] Syncing favorites...')
    // Similar to cart sync
    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Favorites sync failed:', error)
    return Promise.reject(error)
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const data = event.data ? event.data.json() : {}
  const title = data.title || 'AgriTech Tunisia'
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      },
      {
        action: 'close',
        title: 'Fermer',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})

// Message event for manual cache updates
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)

  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }

  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        )
      })
    )
  }
})
