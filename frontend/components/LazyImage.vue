<template>
  <div :class="containerClass" class="relative overflow-hidden">
    <Transition name="fade">
      <img
        v-if="loaded"
        :src="src"
        :alt="alt"
        :class="imageClass"
        @load="onLoad"
        @error="onError"
      />
    </Transition>

    <!-- Skeleton Placeholder -->
    <div
      v-if="!loaded && !error"
      :class="['absolute inset-0 bg-gray-200 animate-pulse', skeletonClass]"
    >
      <div class="w-full h-full flex items-center justify-center text-4xl opacity-30">
        {{ placeholderIcon }}
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      :class="['absolute inset-0 bg-gray-100 flex items-center justify-center', skeletonClass]"
    >
      <div class="text-center text-gray-400">
        <div class="text-4xl mb-2">{{ errorIcon }}</div>
        <p class="text-xs">Image non disponible</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  containerClass?: string
  imageClass?: string
  skeletonClass?: string
  placeholderIcon?: string
  errorIcon?: string
  lazy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  imageClass: 'w-full h-full object-cover',
  skeletonClass: '',
  placeholderIcon: '🌾',
  errorIcon: '📷',
  lazy: true,
})

const loaded = ref(false)
const error = ref(false)
const imgElement = ref<HTMLImageElement | null>(null)

const onLoad = () => {
  loaded.value = true
  error.value = false
}

const onError = () => {
  error.value = true
  loaded.value = false
}

// Intersection Observer for lazy loading
onMounted(() => {
  if (!props.lazy) {
    loaded.value = true
    return
  }

  // Start loading immediately (browser will handle lazy loading via native attribute)
  const img = new Image()
  img.src = props.src
  img.onload = onLoad
  img.onerror = onError
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
