declare module 'vite-plugin-pwa' {
  import { Plugin } from 'vite'

  interface VitePWAOptions {
    registerType?: 'autoUpdate' | 'prompt'
    includeAssets?: string[]
    manifest?: Record<string, any>
    workbox?: Record<string, any>
  }

  export function VitePWA(options?: VitePWAOptions): Plugin
}
