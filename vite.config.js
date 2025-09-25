import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.jsx'],  // usa array, combacia con @vite(...)
      refresh: true,
    }),
    react(),
  ],
  server: {
    host: '127.0.0.1',  // usa lo stesso host con cui apri Laravel
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      port: 5173,
    },
  },
})
