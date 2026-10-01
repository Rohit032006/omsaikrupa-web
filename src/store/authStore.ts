import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN';
  status: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (emailOrMobile: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ emailOrMobile, password });
          const { token, user } = res.data;
          localStorage.setItem('osk_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          const { token, user } = res.data;
          localStorage.setItem('osk_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('osk_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user: User) => set({ user }),
    }),
    {
      name: 'osk-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
