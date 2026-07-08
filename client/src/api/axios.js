import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * baseURL en producción: VITE_API_URL/api  (ej. https://api.tudominio.com/api)
 * baseURL en desarrollo: /api  (el proxy de Vite lo redirige a localhost:3002)
 *
 * VITE_API_URL se define en el archivo .env del cliente:
 *   client/.env.production  →  VITE_API_URL=https://api.tudominio.com
 */
const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const api = axios.create({
    baseURL,
    timeout: 15000,
});

// ── Interceptor de petición: adjuntar token JWT ───────────────
api.interceptors.request.use(
    config => {
        const token = useAuthStore.getState().token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    err => Promise.reject(err)
);

// ── Interceptor de respuesta: manejar 401 ────────────────────
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
