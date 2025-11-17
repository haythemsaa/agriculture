<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast-item rounded-lg shadow-lg p-4 flex items-start gap-3',
            toast.type === 'success' && 'bg-green-500 text-white',
            toast.type === 'error' && 'bg-red-500 text-white',
            toast.type === 'warning' && 'bg-yellow-500 text-white',
            toast.type === 'info' && 'bg-blue-500 text-white',
          ]"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 text-2xl">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">❌</span>
            <span v-else-if="toast.type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-semibold mb-1">{{ toast.title }}</p>
            <p class="text-sm opacity-90">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = ++toastId
  toasts.value.push({ ...toast, id })

  // Auto remove after duration
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose methods for global use
defineExpose({
  success: (message: string, title?: string, duration = 3000) => {
    addToast({ type: 'success', message, title, duration })
  },
  error: (message: string, title?: string, duration = 5000) => {
    addToast({ type: 'error', message, title, duration })
  },
  warning: (message: string, title?: string, duration = 4000) => {
    addToast({ type: 'warning', message, title, duration })
  },
  info: (message: string, title?: string, duration = 3000) => {
    addToast({ type: 'info', message, title, duration })
  },
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-item {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
