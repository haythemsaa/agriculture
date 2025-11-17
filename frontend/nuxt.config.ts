// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
  ],

  app: {
    head: {
      title: 'AgriTech Tunisia - Marketplace Agricole',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Marketplace agricole directe avec intelligence artificielle - Connectez agriculteurs et acheteurs en Tunisie' },
        { name: 'theme-color', content: '#059669' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AgriTech TN' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
      ],
    },
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/animations.css',
    '~/assets/css/mobile.css',
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config',
  },

  i18n: {
    locales: [
      { code: 'ar', iso: 'ar-TN', name: 'العربية', dir: 'rtl' },
      { code: 'fr', iso: 'fr-TN', name: 'Français', dir: 'ltr' },
      { code: 'en', iso: 'en-US', name: 'English', dir: 'ltr' },
    ],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:8000/api/v1',
    },
  },

  compatibilityDate: '2024-11-17',
})
