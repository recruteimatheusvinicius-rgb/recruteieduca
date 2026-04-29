import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('zustand')) {
              return 'vendor-zustand'
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router'
            }
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            if (id.includes('sonner')) {
              return 'vendor-ui'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
