import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Login } from "@/api/types";
import { createSecureStorage } from "./secureStorage";
import type { UserData } from "@/api/types";

interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Login, apiClient: any) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  clearToken: () => void;
  initialize: (apiClient: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      getToken: () => get().token,

      clearToken: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      login: async (credentials: Login, apiClient: any) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.session.login(credentials);
          const token = response.data.token;
          set({
            token,
            user: null,
            isAuthenticated: true,
          });
          // get my user data
          const me: UserData = (await apiClient.session.me()).data;
          set({
            user: me,
            isLoading: false,
          });
        } catch (error) {
          console.log("[authStore] Login error:", error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      initialize: async (apiClient: any) => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const me: UserData = (await apiClient.session.me()).data;
          set({
            user: me,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.log("[authStore] Token validation failed:", error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "trunk-admin-auth",
      storage: createSecureStorage(),
      partialize: (state) => ({
        token: state.token,
      }),
      onRehydrateStorage: () => () => {
        // Storage rehydrated
      },
    }
  )
);
