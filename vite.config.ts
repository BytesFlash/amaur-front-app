import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // host: '0.0.0.0' permite que el servidor sea accesible desde fuera del
    // contenedor Docker. En desarrollo local normal no afecta nada.
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // API_TARGET se inyecta desde docker-compose. En dev local usa localhost.
        target: process.env.API_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
