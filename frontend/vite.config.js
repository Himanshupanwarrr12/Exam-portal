import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js — Vite build tool configuration
// The "proxy" block is KEY: during development, any request from our React app
// that starts with /api will be forwarded to our Express server on port 5000.
// This means the browser never sees a cross-origin request, so no CORS error.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // frontend runs on this port
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // forward /api/* to Express
        changeOrigin: true,             // sets the Host header to match the target
      },
    },
  },
})
