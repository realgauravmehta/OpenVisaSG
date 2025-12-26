import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // GitHub Pages deployment - use repository name as base path
  // Change 'OpenVisaSG' to your actual repository name if different
  base: '/OpenVisaSG/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'mediapipe': ['@mediapipe/tasks-vision'],
          'imgly': ['@imgly/background-removal'],
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
