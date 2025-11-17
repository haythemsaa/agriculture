<template>
  <button
    @click="handleToggle"
    :disabled="loading"
    :class="buttonClass"
    :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
  >
    <span v-if="loading" class="inline-block animate-spin">⏳</span>
    <span v-else :class="isFavorite ? 'text-red-500' : 'text-gray-400'">
      {{ isFavorite ? '❤️' : '🤍' }}
    </span>
    <span v-if="showLabel" class="ml-2">
      {{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'
import { useAuthStore } from '~/stores/auth'

interface Props {
  productId: number
  showLabel?: boolean
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  buttonClass: 'w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition',
})

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const router = useRouter()

const loading = ref(false)
const isFavorite = computed(() => favoritesStore.isFavorite(props.productId))

const handleToggle = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  loading.value = true

  try {
    await favoritesStore.toggleFavorite(props.productId)
  } catch (error: any) {
    console.error('Failed to toggle favorite:', error)
  } finally {
    loading.value = false
  }
}
</script>
