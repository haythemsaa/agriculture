<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">🌱 AgriTech Tunisia</h1>
        <h2 class="text-2xl font-semibold text-gray-900">Connexion</h2>
        <p class="mt-2 text-gray-600">Accédez à votre compte</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="votre@email.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" class="mr-2" />
              <span class="text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
              Mot de passe oublié?
            </NuxtLink>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Pas encore de compte?
              <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
                S'inscrire
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>

      <!-- Role Quick Access -->
      <div class="mt-8 grid grid-cols-2 gap-4">
        <NuxtLink to="/register?role=agriculteur" class="card text-center hover:shadow-lg transition">
          <span class="text-3xl mb-2 block">👨‍🌾</span>
          <p class="text-sm font-medium">Je suis agriculteur</p>
        </NuxtLink>
        <NuxtLink to="/register?role=acheteur" class="card text-center hover:shadow-lg transition">
          <span class="text-3xl mb-2 block">🛒</span>
          <p class="text-sm font-medium">Je suis acheteur</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(form.email, form.password)

    // Redirect based on role
    if (authStore.isAgriculteur) {
      router.push('/dashboard/agriculteur')
    } else if (authStore.isAcheteur) {
      router.push('/marketplace')
    } else {
      router.push('/dashboard')
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erreur de connexion. Vérifiez vos identifiants.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Connexion',
})

// Redirect if already logged in
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>
