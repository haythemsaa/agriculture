<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-600 mb-2">🌱 AgriTech Tunisia</h1>
        <h2 class="text-2xl font-semibold text-gray-900">Créer un compte</h2>
        <p class="mt-2 text-gray-600">Rejoignez notre marketplace agricole</p>
      </div>

      <div class="card">
        <!-- Role Selection -->
        <div v-if="!selectedRole" class="space-y-4">
          <h3 class="text-lg font-semibold text-center mb-6">Choisissez votre profil</h3>

          <button
            @click="selectRole('agriculteur')"
            class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left"
          >
            <div class="flex items-center">
              <span class="text-5xl mr-4">👨‍🌾</span>
              <div>
                <h4 class="text-xl font-semibold mb-1">Agriculteur / Producteur</h4>
                <p class="text-gray-600">Vendez vos produits directement aux acheteurs</p>
              </div>
            </div>
          </button>

          <button
            @click="selectRole('acheteur')"
            class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition text-left"
          >
            <div class="flex items-center">
              <span class="text-5xl mr-4">🛒</span>
              <div>
                <h4 class="text-xl font-semibold mb-1">Acheteur</h4>
                <p class="text-gray-600">Achetez des produits frais directement des fermes</p>
              </div>
            </div>
          </button>

          <div class="text-center pt-4">
            <p class="text-sm text-gray-600">
              Déjà un compte?
              <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Se connecter
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Registration Form -->
        <form v-else @submit.prevent="handleRegister" class="space-y-6">
          <!-- Error Alert -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Role Badge -->
          <div class="flex items-center justify-between bg-primary-50 p-4 rounded-lg">
            <div class="flex items-center">
              <span class="text-3xl mr-3">{{ selectedRole === 'agriculteur' ? '👨‍🌾' : '🛒' }}</span>
              <span class="font-semibold">
                {{ selectedRole === 'agriculteur' ? 'Agriculteur' : 'Acheteur' }}
              </span>
            </div>
            <button type="button" @click="selectedRole = null" class="text-sm text-primary-600 hover:text-primary-700">
              Changer
            </button>
          </div>

          <!-- Common Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input v-model="form.first_name" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input v-model="form.last_name" type="text" required class="input-field" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input v-model="form.email" type="email" required class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
            <input v-model="form.phone" type="tel" required class="input-field" placeholder="+216 XX XXX XXX" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <input v-model="form.password" type="password" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer mot de passe *</label>
              <input v-model="form.password_confirmation" type="password" required class="input-field" />
            </div>
          </div>

          <!-- Agriculteur Specific Fields -->
          <div v-if="selectedRole === 'agriculteur'" class="border-t pt-6 space-y-4">
            <h4 class="font-semibold text-lg">Informations de la ferme</h4>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la ferme *</label>
              <input v-model="form.farm_name" type="text" required class="input-field" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gouvernorat *</label>
                <select v-model="form.governorate" required class="input-field">
                  <option value="">Sélectionner</option>
                  <option value="Tunis">Tunis</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Ben Arous">Ben Arous</option>
                  <option value="Manouba">Manouba</option>
                  <option value="Nabeul">Nabeul</option>
                  <option value="Zaghouan">Zaghouan</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Béja">Béja</option>
                  <option value="Jendouba">Jendouba</option>
                  <option value="Kef">Kef</option>
                  <option value="Siliana">Siliana</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Mahdia">Mahdia</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Kairouan">Kairouan</option>
                  <option value="Kasserine">Kasserine</option>
                  <option value="Sidi Bouzid">Sidi Bouzid</option>
                  <option value="Gabès">Gabès</option>
                  <option value="Médenine">Médenine</option>
                  <option value="Tataouine">Tataouine</option>
                  <option value="Gafsa">Gafsa</option>
                  <option value="Tozeur">Tozeur</option>
                  <option value="Kebili">Kebili</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Délégation *</label>
                <input v-model="form.delegation" type="text" required class="input-field" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Surface de la ferme (hectares)</label>
              <input v-model.number="form.farm_size" type="number" step="0.1" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description de votre activité</label>
              <textarea v-model="form.bio" rows="3" class="input-field"></textarea>
            </div>
          </div>

          <!-- Acheteur Specific Fields -->
          <div v-if="selectedRole === 'acheteur'" class="border-t pt-6 space-y-4">
            <h4 class="font-semibold text-lg">Type d'acheteur</h4>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Je suis *</label>
              <select v-model="form.buyer_type" required class="input-field">
                <option value="particulier">Particulier</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hôtel</option>
                <option value="epicerie">Épicerie / Commerce</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div v-if="form.buyer_type !== 'particulier'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input v-model="form.company_name" type="text" class="input-field" />
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input v-model="acceptTerms" type="checkbox" required class="mt-1 mr-2" />
            <label class="text-sm text-gray-600">
              J'accepte les <a href="#" class="text-primary-600 hover:underline">conditions d'utilisation</a>
              et la <a href="#" class="text-primary-600 hover:underline">politique de confidentialité</a>
            </label>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !acceptTerms"
            class="w-full btn-primary"
          >
            <span v-if="loading">Inscription en cours...</span>
            <span v-else>Créer mon compte</span>
          </button>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Déjà un compte?
              <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Se connecter
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const selectedRole = ref<string | null>(null)
const acceptTerms = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  role: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  // Agriculteur
  farm_name: '',
  governorate: '',
  delegation: '',
  farm_size: null,
  bio: '',
  // Acheteur
  buyer_type: 'particulier',
  company_name: '',
})

const selectRole = (role: string) => {
  selectedRole.value = role
  form.role = role
}

const handleRegister = async () => {
  if (form.password !== form.password_confirmation) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register(form)

    // Redirect based on role
    if (authStore.isAgriculteur) {
      router.push('/dashboard/agriculteur')
    } else {
      router.push('/marketplace')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
    if (err.response?.data?.errors) {
      const errors = Object.values(err.response.data.errors).flat()
      error.value = errors.join(', ')
    }
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Inscription',
})

// Check for role in query params
onMounted(() => {
  if (route.query.role) {
    selectRole(route.query.role as string)
  }

  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>
