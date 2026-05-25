import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('lowlight')) {
            return 'vendor-tiptap';
          }
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'vendor-charts';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          if (id.includes('zustand')) {
            return 'vendor-zustand';
          }
          if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('sonner') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          return 'vendor';
        },
      },
    },
  },
})
