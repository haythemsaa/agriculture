<template>
  <div class="bg-gray-50 min-h-screen py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p class="text-xl text-gray-600">Notre équipe est là pour vous aider</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <div class="card">
              <h2 class="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

              <form @submit.prevent="submitForm" class="space-y-6">
                <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {{ successMessage }}
                </div>

                <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {{ errorMessage }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Prénom *</label>
                    <input v-model="form.first_name" type="text" required class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Nom *</label>
                    <input v-model="form.last_name" type="text" required class="input-field" />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Email *</label>
                  <input v-model="form.email" type="email" required class="input-field" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Téléphone</label>
                  <input v-model="form.phone" type="tel" class="input-field" placeholder="+216 XX XXX XXX" />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Sujet *</label>
                  <select v-model="form.subject" required class="input-field">
                    <option value="">Sélectionner un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="account">Question sur mon compte</option>
                    <option value="order">Question sur une commande</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Message *</label>
                  <textarea v-model="form.message" rows="6" required class="input-field"></textarea>
                </div>

                <button type="submit" :disabled="submitting" class="btn-primary w-full">
                  <span v-if="submitting">Envoi en cours...</span>
                  <span v-else">Envoyer le message</span>
                </button>
              </form>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="space-y-6">
            <!-- Office -->
            <div class="card">
              <h3 class="font-semibold text-lg mb-4 flex items-center">
                <span class="mr-2">🏢</span> Nos Bureaux
              </h3>
              <p class="text-gray-700 text-sm">
                Tunis, Tunisie<br>
                Centre Urbain Nord<br>
                1082 Tunis
              </p>
            </div>

            <!-- Contact Details -->
            <div class="card">
              <h3 class="font-semibold text-lg mb-4">Coordonnées</h3>
              <div class="space-y-3">
                <div class="flex items-start">
                  <span class="text-2xl mr-3">📧</span>
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <a href="mailto:contact@agritech.tn" class="text-primary-600 hover:text-primary-700">
                      contact@agritech.tn
                    </a>
                  </div>
                </div>

                <div class="flex items-start">
                  <span class="text-2xl mr-3">📱</span>
                  <div>
                    <p class="text-sm text-gray-600">Téléphone</p>
                    <a href="tel:+21670000000" class="text-primary-600 hover:text-primary-700">
                      +216 70 000 000
                    </a>
                  </div>
                </div>

                <div class="flex items-start">
                  <span class="text-2xl mr-3">💬</span>
                  <div>
                    <p class="text-sm text-gray-600">WhatsApp</p>
                    <a href="https://wa.me/21670000000" class="text-primary-600 hover:text-primary-700">
                      +216 70 000 000
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hours -->
            <div class="card">
              <h3 class="font-semibold text-lg mb-4 flex items-center">
                <span class="mr-2">🕐</span> Horaires
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Lundi - Vendredi</span>
                  <span class="font-medium">8h - 18h</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Samedi</span>
                  <span class="font-medium">9h - 13h</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Dimanche</span>
                  <span class="font-medium">Fermé</span>
                </div>
              </div>
            </div>

            <!-- Social -->
            <div class="card">
              <h3 class="font-semibold text-lg mb-4">Suivez-nous</h3>
              <div class="flex gap-3">
                <a href="#" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                  F
                </a>
                <a href="#" class="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition">
                  T
                </a>
                <a href="#" class="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition">
                  I
                </a>
                <a href="#" class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
                  W
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-center mb-8">Questions Fréquentes</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card">
              <h3 class="font-semibold mb-2">Comment créer un compte agriculteur?</h3>
              <p class="text-gray-600 text-sm">Cliquez sur "S'inscrire" et sélectionnez "Agriculteur". Remplissez vos informations et attendez la vérification.</p>
            </div>

            <div class="card">
              <h3 class="font-semibold mb-2">Quels sont les frais de commission?</h3>
              <p class="text-gray-600 text-sm">La commission varie entre 8% et 12% selon le montant de la commande. Pas de frais d'inscription.</p>
            </div>

            <div class="card">
              <h3 class="font-semibold mb-2">Comment sont gérées les livraisons?</h3>
              <p class="text-gray-600 text-sm">Plusieurs options disponibles : retrait à la ferme, livraison à domicile, point relais ou expédition nationale.</p>
            </div>

            <div class="card">
              <h3 class="font-semibold mb-2">Les paiements sont-ils sécurisés?</h3>
              <p class="text-gray-600 text-sm">Oui, nous utilisons des systèmes de paiement sécurisés conformes aux normes internationales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const submitForm = async () => {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    successMessage.value = 'Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.'

    // Reset form
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
  } catch (error) {
    errorMessage.value = 'Une erreur s\'est produite. Veuillez réessayer.'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'Contact',
})
</script>
