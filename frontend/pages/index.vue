<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl">
          <h1 class="text-5xl font-bold mb-6">
            Connectons l'agriculture tunisienne
          </h1>
          <p class="text-xl mb-8 text-primary-100">
            Marketplace agricole directe avec intelligence artificielle.
            Achetez directement auprès des agriculteurs locaux.
          </p>
          <div class="flex space-x-4">
            <NuxtLink to="/marketplace" class="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition">
              Explorer le Marketplace
            </NuxtLink>
            <NuxtLink to="/register?role=agriculteur" class="border-2 border-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-lg transition">
              Devenir Vendeur
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Pourquoi AgriTech Tunisia ?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">🌾</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Produits Frais</h3>
            <p class="text-gray-600">Directement de la ferme à votre table</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">💰</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Prix Justes</h3>
            <p class="text-gray-600">Sans intermédiaires, prix équitables pour tous</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">🤖</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Intelligence Artificielle</h3>
            <p class="text-gray-600">Conseils personnalisés et prévisions météo</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Catégories Populaires</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink to="/marketplace?category=fruits" class="card hover:shadow-lg transition text-center">
            <span class="text-4xl mb-2 block">🍎</span>
            <h3 class="font-semibold">Fruits</h3>
          </NuxtLink>
          <NuxtLink to="/marketplace?category=legumes" class="card hover:shadow-lg transition text-center">
            <span class="text-4xl mb-2 block">🥬</span>
            <h3 class="font-semibold">Légumes</h3>
          </NuxtLink>
          <NuxtLink to="/marketplace?category=huile" class="card hover:shadow-lg transition text-center">
            <span class="text-4xl mb-2 block">🫒</span>
            <h3 class="font-semibold">Huile d'Olive</h3>
          </NuxtLink>
          <NuxtLink to="/marketplace?category=dattes" class="card hover:shadow-lg transition text-center">
            <span class="text-4xl mb-2 block">🌴</span>
            <h3 class="font-semibold">Dattes</h3>
          </NuxtLink>
          <NuxtLink to="/marketplace?category=miel" class="card hover:shadow-lg transition text-center">
            <span class="text-4xl mb-2 block">🍯</span>
            <h3 class="font-semibold">Miel</h3>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-16 bg-primary-600 text-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold mb-2">2,000+</div>
            <div class="text-primary-100">Agriculteurs</div>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">20,000+</div>
            <div class="text-primary-100">Acheteurs</div>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">500K TND</div>
            <div class="text-primary-100">Volume de ventes</div>
          </div>
          <div>
            <div class="text-4xl font-bold mb-2">15</div>
            <div class="text-primary-100">Gouvernorats</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
        <p class="text-xl text-gray-600 mb-8">Rejoignez des milliers d'agriculteurs et acheteurs</p>
        <NuxtLink to="/register" class="btn-primary text-lg">
          S'inscrire Maintenant
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Accueil',
})
</script>
