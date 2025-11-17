<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
    <div class="max-w-2xl w-full text-center">
      <!-- 404 Illustration -->
      <div class="mb-8 relative">
        <span class="text-9xl">🌾</span>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-6xl font-bold text-primary-600 opacity-20">404</span>
        </div>
      </div>

      <!-- Message -->
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Page introuvable
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Oups! La page que vous cherchez semble s'être perdue dans les champs...
      </p>

      <!-- Search Suggestion -->
      <div class="mb-8 max-w-md mx-auto">
        <p class="text-sm text-gray-600 mb-3">Peut-être cherchez-vous un produit?</p>
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des produits..."
            class="input-field flex-1"
            @keyup.enter="searchProducts"
          />
          <button @click="searchProducts" class="btn-primary">
            🔍
          </button>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <NuxtLink to="/" class="card hover:shadow-lg transition p-6">
          <span class="text-4xl mb-3 block">🏠</span>
          <p class="font-semibold">Accueil</p>
        </NuxtLink>

        <NuxtLink to="/marketplace" class="card hover:shadow-lg transition p-6">
          <span class="text-4xl mb-3 block">🛍️</span>
          <p class="font-semibold">Marketplace</p>
        </NuxtLink>

        <NuxtLink to="/weather" class="card hover:shadow-lg transition p-6">
          <span class="text-4xl mb-3 block">🌤️</span>
          <p class="font-semibold">Météo</p>
        </NuxtLink>

        <NuxtLink to="/contact" class="card hover:shadow-lg transition p-6">
          <span class="text-4xl mb-3 block">📧</span>
          <p class="font-semibold">Contact</p>
        </NuxtLink>
      </div>

      <!-- Popular Categories -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Catégories populaires</h2>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink
            to="/marketplace?category=fruits"
            class="badge badge-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
          >
            🍊 Fruits
          </NuxtLink>
          <NuxtLink
            to="/marketplace?category=legumes"
            class="badge badge-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
          >
            🥕 Légumes
          </NuxtLink>
          <NuxtLink
            to="/marketplace?category=huile"
            class="badge badge-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
          >
            🫒 Huile d'olive
          </NuxtLink>
          <NuxtLink
            to="/marketplace?category=dattes"
            class="badge badge-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
          >
            🌴 Dattes
          </NuxtLink>
          <NuxtLink
            to="/marketplace?category=bio"
            class="badge badge-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
          >
            🌱 Bio
          </NuxtLink>
        </div>
      </div>

      <!-- Help -->
      <div class="pt-8 border-t border-gray-200">
        <p class="text-gray-600 mb-4">Vous ne trouvez toujours pas ce que vous cherchez?</p>
        <NuxtLink to="/contact" class="btn-secondary">
          Contactez-nous →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const searchQuery = ref('')

const searchProducts = () => {
  if (searchQuery.value.trim()) {
    router.push(`/marketplace?search=${encodeURIComponent(searchQuery.value)}`)
  } else {
    router.push('/marketplace')
  }
}

useHead({
  title: '404 - Page introuvable',
})
</script>
