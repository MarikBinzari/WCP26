import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Nu cachea apelurile API sau Supabase — doar assets statice
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // Supabase realtime/API — mereu network, fără cache
            urlPattern: /supabase\.co/,
            handler: 'NetworkOnly',
          },
          {
            // football-data.org — NetworkOnly
            urlPattern: /football-data\.org/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: false, // folosim manifest.json existent din /public
    }),
  ],
  server: { host: true, port: 5175 },
  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/@hcaptcha')) return 'vendor-captcha';
        },
      },
    },
  },
})
