<template>
  <div class="card">
    <h3 class="text-xl font-bold mb-4">{{ title || 'Évaluer cette commande' }}</h3>

    <form @submit.prevent="submitReview" class="space-y-6">
      <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium mb-2">Votre note *</label>
        <div class="flex items-center gap-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="form.rating = star"
            class="text-3xl focus:outline-none transition hover:scale-110"
          >
            <span v-if="star <= form.rating" class="text-yellow-500">⭐</span>
            <span v-else class="text-gray-300">⭐</span>
          </button>
          <span class="ml-2 text-sm text-gray-600">
            {{ ratingLabel }}
          </span>
        </div>
      </div>

      <!-- Comment -->
      <div>
        <label class="block text-sm font-medium mb-2">Votre avis (optionnel)</label>
        <textarea
          v-model="form.comment"
          rows="5"
          class="input-field"
          placeholder="Partagez votre expérience avec ce produit..."
          maxlength="1000"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">{{ form.comment?.length || 0 }} / 1000 caractères</p>
      </div>

      <!-- Images Upload (optional feature for later) -->
      <div v-if="allowImages">
        <label class="block text-sm font-medium mb-2">Photos (optionnel)</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <p class="text-sm text-gray-500">Ajoutez des photos de votre produit</p>
          <p class="text-xs text-gray-400 mt-1">Maximum 5 images</p>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="!form.rating || submitting"
          class="btn-primary flex-1"
        >
          <span v-if="submitting">Envoi en cours...</span>
          <span v-else>Publier mon avis</span>
        </button>
        <button
          v-if="onCancel"
          type="button"
          @click="onCancel"
          class="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface Props {
  orderId: number
  title?: string
  allowImages?: boolean
  onCancel?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits(['success'])

const config = useRuntimeConfig()
const authStore = useAuthStore()

const form = reactive({
  rating: 0,
  comment: '',
  images: [] as string[],
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const ratingLabel = computed(() => {
  const labels = {
    1: 'Très mauvais',
    2: 'Mauvais',
    3: 'Moyen',
    4: 'Bon',
    5: 'Excellent',
  }
  return form.rating > 0 ? labels[form.rating] : 'Sélectionnez une note'
})

const submitReview = async () => {
  if (!form.rating) {
    errorMessage.value = 'Veuillez sélectionner une note'
    return
  }

  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch(`${config.public.apiBase}/orders/${props.orderId}/review`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        rating: form.rating,
        comment: form.comment || null,
        images: form.images.length > 0 ? form.images : null,
      },
    })

    if (response.success) {
      successMessage.value = response.message || 'Avis publié avec succès!'

      // Reset form
      form.rating = 0
      form.comment = ''
      form.images = []

      // Emit success event
      emit('success', response.review)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Erreur lors de la publication de l\'avis'
  } finally {
    submitting.value = false
  }
}
</script>
