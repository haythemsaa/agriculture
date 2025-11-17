<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <h1 class="text-3xl font-bold mb-8">🌤️ Météo Agricole</h1>

      <!-- Location Selector -->
      <div class="card mb-8">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-64">
            <label class="block text-sm font-medium mb-2">Sélectionnez votre gouvernorat</label>
            <select v-model="selectedGovernorate" @change="fetchWeather" class="input-field">
              <option value="">Choisir un gouvernorat</option>
              <option v-for="gov in governorates" :key="gov" :value="gov">{{ gov }}</option>
            </select>
          </div>
          <button @click="useCurrentLocation" class="btn-primary">
            📍 Ma position
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Weather Data -->
      <div v-else-if="currentWeather" class="space-y-6">
        <!-- Current Weather -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 class="text-2xl font-bold mb-2">{{ selectedGovernorate }}</h2>
              <p class="text-blue-100 mb-6">{{ new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) }}</p>

              <div class="flex items-center mb-6">
                <span class="text-7xl mr-6">{{ getWeatherIcon(currentWeather.condition) }}</span>
                <div>
                  <p class="text-6xl font-bold">{{ Math.round(currentWeather.temperature) }}°C</p>
                  <p class="text-2xl text-blue-100">{{ getConditionLabel(currentWeather.condition) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-blue-100 text-sm">Ressenti</p>
                  <p class="text-xl font-semibold">{{ Math.round(currentWeather.feels_like) }}°C</p>
                </div>
                <div>
                  <p class="text-blue-100 text-sm">Humidité</p>
                  <p class="text-xl font-semibold">{{ currentWeather.humidity }}%</p>
                </div>
                <div>
                  <p class="text-blue-100 text-sm">Vent</p>
                  <p class="text-xl font-semibold">{{ currentWeather.wind_speed }} km/h</p>
                </div>
                <div>
                  <p class="text-blue-100 text-sm">Précipitations</p>
                  <p class="text-xl font-semibold">{{ currentWeather.precipitation }} mm</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center">
              <div class="text-center">
                <div class="text-8xl mb-4">🌡️</div>
                <p class="text-xl">Conditions idéales pour:</p>
                <div class="flex flex-wrap gap-2 mt-4 justify-center">
                  <span class="badge badge-lg bg-white text-blue-600">🌱 Plantation</span>
                  <span class="badge badge-lg bg-white text-blue-600">💧 Irrigation</span>
                  <span class="badge badge-lg bg-white text-blue-600">🚜 Travaux</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Alerts -->
        <div v-if="alerts.length > 0" class="space-y-3">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="card border-l-4 border-orange-500 bg-orange-50"
          >
            <div class="flex items-start">
              <span class="text-3xl mr-4">⚠️</span>
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-orange-900">{{ alert.alert_type }}</h3>
                <p class="text-orange-700">{{ alert.alert_message }}</p>
                <p class="text-sm text-orange-600 mt-2">
                  {{ new Date(alert.forecast_time).toLocaleDateString('fr-FR') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 7-Day Forecast -->
        <div class="card">
          <h2 class="text-2xl font-bold mb-6">Prévisions sur 7 jours</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div
              v-for="day in forecast"
              :key="day.id"
              class="text-center p-4 rounded-lg border hover:border-primary-500 hover:shadow-md transition"
            >
              <p class="font-semibold mb-2">{{ getDayLabel(day.forecast_time) }}</p>
              <span class="text-4xl block mb-2">{{ getWeatherIcon(day.condition) }}</span>
              <p class="text-2xl font-bold mb-1">{{ Math.round(day.temperature) }}°C</p>
              <p class="text-sm text-gray-600">{{ getConditionLabel(day.condition) }}</p>
              <div class="mt-2 space-y-1 text-xs text-gray-500">
                <p>💧 {{ day.humidity }}%</p>
                <p>🌧️ {{ day.precipitation }} mm</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Agricultural Recommendations -->
        <div class="card bg-green-50">
          <h2 class="text-2xl font-bold mb-6 text-green-900">Recommandations Agricoles</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-lg mb-3 flex items-center">
                <span class="mr-2">🌱</span> Plantation
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Conditions favorables pour semer des légumes de saison</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Humidité du sol optimale</span>
                </li>
              </ul>
            </div>

            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-lg mb-3 flex items-center">
                <span class="mr-2">💧</span> Irrigation
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">ℹ️</span>
                  <span>Pluies prévues dans 3 jours, réduire l'irrigation</span>
                </li>
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Arrosage recommandé tôt le matin</span>
                </li>
              </ul>
            </div>

            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-lg mb-3 flex items-center">
                <span class="mr-2">🚜</span> Travaux des champs
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Conditions idéales pour les travaux agricoles</span>
                </li>
                <li class="flex items-start">
                  <span class="text-orange-500 mr-2">⚠️</span>
                  <span>Éviter les traitements par temps venteux</span>
                </li>
              </ul>
            </div>

            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-lg mb-3 flex items-center">
                <span class="mr-2">🦠</span> Protection des cultures
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">✓</span>
                  <span>Conditions défavorables aux maladies fongiques</span>
                </li>
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">ℹ️</span>
                  <span>Surveiller l'apparition de parasites</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- No Location Selected -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">🌤️</div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Sélectionnez votre localisation</h2>
        <p class="text-gray-600">Choisissez un gouvernorat pour voir les prévisions météo</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const selectedGovernorate = ref('')
const currentWeather = ref<any>(null)
const forecast = ref<any[]>([])
const alerts = ref<any[]>([])
const loading = ref(false)

const governorates = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
  'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
  'Jendouba', 'Kef', 'Siliana', 'Sousse',
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
  'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kebili',
]

const fetchWeather = async () => {
  if (!selectedGovernorate.value) return

  loading.value = true

  try {
    // Fetch current weather
    const currentResponse = await $fetch(`${config.public.apiBase}/weather/current`, {
      params: { governorate: selectedGovernorate.value },
    })
    currentWeather.value = currentResponse.weather

    // Fetch forecast
    const forecastResponse = await $fetch(`${config.public.apiBase}/weather/forecast`, {
      params: {
        governorate: selectedGovernorate.value,
        days: 7,
      },
    })
    forecast.value = forecastResponse.forecast || []

    // Fetch alerts
    const alertsResponse = await $fetch(`${config.public.apiBase}/weather/alerts`, {
      params: { governorate: selectedGovernorate.value },
    })
    alerts.value = alertsResponse.alerts || []
  } catch (error) {
    console.error('Failed to fetch weather:', error)
  } finally {
    loading.value = false
  }
}

const useCurrentLocation = () => {
  // Fallback to Tunis for demo
  selectedGovernorate.value = 'Tunis'
  fetchWeather()
}

const getWeatherIcon = (condition: string) => {
  const icons: Record<string, string> = {
    clear: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    storm: '⛈️',
    snow: '❄️',
    fog: '🌫️',
  }
  return icons[condition] || '🌤️'
}

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    clear: 'Ensoleillé',
    cloudy: 'Nuageux',
    rain: 'Pluvieux',
    storm: 'Orageux',
    snow: 'Neigeux',
    fog: 'Brouillard',
  }
  return labels[condition] || condition
}

const getDayLabel = (date: string) => {
  const d = new Date(date)
  const today = new Date()

  if (d.toDateString() === today.toDateString()) return 'Aujourd\'hui'

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Demain'

  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
}

useHead({
  title: 'Météo Agricole',
})
</script>
