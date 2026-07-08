import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            usuario: null,
            isAuthenticated: false,
            login: (token, usuario) => set({ token, usuario, isAuthenticated: true }),
            logout: () => set({ token: null, usuario: null, isAuthenticated: false })
        }),
        { name: 'ferreteria-auth' }
    )
);

export default useAuthStore;
