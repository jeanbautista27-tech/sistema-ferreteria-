import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables VITE_* del .env correspondiente al modo
  const env = loadEnv(mode, process.cwd(), '')

  // En producción (npm run build) no se usa proxy;
  // la URL del API se inyecta en tiempo de build mediante VITE_API_URL.
  // En desarrollo (npm run dev) el proxy redirige /api → localhost:3002.
  const apiTarget = env.VITE_API_URL || 'http://localhost:3002'

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target:       apiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target:       apiTarget,
          changeOrigin: true,
        },
      },
    },

    // Permitir todos los hosts externos en modo preview (Railway, etc.)
    preview: {
      host:         '0.0.0.0',
      port:         parseInt(process.env.PORT) || 4173,
      allowedHosts: 'all',
    },

    // Define la variable en el bundle para que axios.js pueda usarla
    define: {
      __API_URL__: JSON.stringify(
        mode === 'production' ? (env.VITE_API_URL || '') : ''
      ),
    },
  }
})
