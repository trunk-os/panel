import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/api/client";
import type { Login } from "@/api/types";
import { createSecureStorage } from "./secureStorage";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      getToken: () => get().token,
      
      clearToken: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      login: async (credentials: Login) => {
        set({ isLoading: true });
        try {
          const response = await api.session.login(credentials);
          const token = response.data.token;
          
          set({ 
            token,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.log("[authStore] Login error:", error);
          set({ 
            user: null,
            token: null,
            isAuthenticated: false, 
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "trunk-admin-auth",
      storage: createSecureStorage<AuthState>(),
      partialize: (state) => ({
        user: null,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: false,
        getToken: state.getToken,
        clearToken: state.clearToken,
        login: state.login,
        logout: state.logout,
      }),
    }
  )
);
