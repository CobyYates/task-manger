// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'TaskFlow — Project & Task Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A modern project and task management app. Organize projects, track tasks, and stay on top of your workflow with a beautiful, themeable interface.' },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'TaskFlow — Project & Task Manager' },
        { property: 'og:description', content: 'Organize projects, track tasks, and stay on top of your workflow with a beautiful, themeable interface.' },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'TaskFlow — Project & Task Manager' },
        { name: 'twitter:description', content: 'Organize projects, track tasks, and stay on top of your workflow with a beautiful, themeable interface.' },
        { name: 'twitter:image', content: '/og-image.png' },
        // Theme
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  modules: ['@pinia/nuxt'],

  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/styles/main.scss',
  ],

  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
    },
  },

  vite: {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
  },

  ssr: false,
})
