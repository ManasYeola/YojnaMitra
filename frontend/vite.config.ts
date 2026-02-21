import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,           // listen on 0.0.0.0 — required for ngrok to reach Vite
    port: 5173,
    allowedHosts: [
      'monte-nonlevulose-leticia.ngrok-free.dev'
    ],
    proxy: {
      // Forward all /api requests to the backend — the browser never calls localhost directly
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
