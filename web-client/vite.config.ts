import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

import path from 'path'

import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      injectRegister: 'auto',

      includeAssets: ['icon-192.png', 'icon-512.png', 'splash.png'],
      manifest: {
        theme_color: '#6a1b9a',
      },
    }),
  ],

  root: '.',

  publicDir: 'public',

  build: {
    outDir: 'dist',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
