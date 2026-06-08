// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',

  devtools: {
    enabled: true
  },

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  }
})