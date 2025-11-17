<template>
  <div class="relative" v-click-outside="closeDropdown">
    <!-- Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 hover:bg-gray-100 rounded-full transition"
      :aria-label="`Notifications (${unreadCount})`"
      :aria-expanded="isOpen.toString()"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse"
        aria-hidden="true"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
        role="menu"
      >
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Notifications
              <span v-if="unreadCount > 0" class="text-sm font-normal text-gray-500 ml-2">
                ({{ unreadCount }} non lu{{ unreadCount > 1 ? 's' : '' }})
              </span>
            </h3>

            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-sm text-primary-600 hover:underline"
                title="Tout marquer comme lu"
              >
                Tout lire
              </button>

              <button
                @click="showSettings = !showSettings"
                class="p-1 hover:bg-gray-200 rounded"
                aria-label="Paramètres"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mt-3">
            <button
              @click="activeTab = 'all'"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition',
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              Toutes
            </button>
            <button
              @click="activeTab = 'unread'"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition',
                activeTab === 'unread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              Non lues ({{ unreadCount }})
            </button>
          </div>
        </div>

        <!-- Settings Panel -->
        <div v-if="showSettings" class="p-4 border-b border-gray-200 bg-gray-50">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">Paramètres</h4>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="enableBrowserNotifications" class="rounded" />
              <span>Notifications navigateur</span>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="enableSoundNotifications" class="rounded" />
              <span>Sons de notification</span>
            </label>
          </div>
          <button
            @click="clearAllNotifications"
            class="mt-3 text-sm text-red-600 hover:underline"
          >
            Supprimer toutes les notifications
          </button>
        </div>

        <!-- Notifications List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="displayedNotifications.length === 0" class="p-8 text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p class="text-sm">Aucune notification</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              :class="[
                'p-4 hover:bg-gray-50 transition cursor-pointer',
                !notification.read && 'bg-blue-50',
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex gap-3">
                <!-- Icon -->
                <div
                  :class="[
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl',
                    getTypeColor(notification.type),
                  ]"
                >
                  {{ getNotificationIcon(notification.type) }}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-gray-900">
                        {{ notification.title }}
                      </p>
                      <p class="text-sm text-gray-600 mt-1">
                        {{ notification.message }}
                      </p>
                    </div>

                    <button
                      @click.stop="removeNotification(notification.id)"
                      class="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      aria-label="Supprimer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-xs text-gray-500">
                      {{ formatTimeAgo(notification.timestamp) }}
                    </span>

                    <button
                      v-if="!notification.read"
                      @click.stop="markAsRead(notification.id)"
                      class="text-xs text-primary-600 hover:underline"
                    >
                      Marquer comme lu
                    </button>

                    <NuxtLink
                      v-if="notification.link"
                      :to="notification.link"
                      class="text-xs text-primary-600 hover:underline"
                      @click="closeDropdown"
                    >
                      {{ notification.actionLabel || 'Voir' }} →
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 bg-gray-50">
          <NuxtLink
            to="/notifications"
            class="block text-center text-sm text-primary-600 hover:underline font-medium"
            @click="closeDropdown"
          >
            Voir toutes les notifications
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAll,
  getUnread,
  formatTimeAgo,
  getNotificationIcon,
} = useNotifications()

const isOpen = ref(false)
const activeTab = ref<'all' | 'unread'>('all')
const showSettings = ref(false)
const enableBrowserNotifications = ref(false)
const enableSoundNotifications = ref(false)

const displayedNotifications = computed(() => {
  const notifs = activeTab.value === 'unread' ? getUnread() : notifications.value
  return notifs.slice(0, 20) // Limit to 20 in dropdown
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
  showSettings.value = false
}

const handleNotificationClick = (notification: any) => {
  markAsRead(notification.id)
  if (notification.link) {
    navigateTo(notification.link)
    closeDropdown()
  }
}

const clearAllNotifications = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
    clearAll()
    closeDropdown()
  }
}

const getTypeColor = (type: string): string => {
  const colors = {
    info: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    promotion: 'bg-purple-100',
    order: 'bg-indigo-100',
    price_drop: 'bg-green-100',
    stock: 'bg-blue-100',
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100'
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
