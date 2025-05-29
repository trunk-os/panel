import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Login, UserData } from "@/api/types";
import { createSecureStorage } from "./secureStorage";
import type { api } from "@/api/client";
import { useSetupStore } from "./setupStore";
import { ApiError } from "@/api/errors";

type ApiClient = typeof api;

interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Login, apiClient: ApiClient) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  clearToken: () => void;
  initialize: (apiClient: ApiClient) => Promise<void>;
  currentUser: () => UserData | null;
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
        const { clearSetupStore } = useSetupStore.getState();
        clearSetupStore();
      },

      login: async (credentials: Login, apiClient: ApiClient) => {
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
      currentUser() {
        return get().user;
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        const { clearSetupStore } = useSetupStore.getState();
        clearSetupStore();
      },

      initialize: async (apiClient: ApiClient) => {
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
          console.log("[authStore] Error type:", error?.constructor?.name);
          console.log("[authStore] Error instanceof ApiError:", error instanceof ApiError);
          if (error instanceof ApiError) {
            console.log("[authStore] ApiError statusCode:", error.statusCode);
          }

          // Only clear token if this is an authentication error (401)
          // Don't log out on network errors or API unavailability
          if (error instanceof ApiError && error.statusCode === 401) {
            console.log("[authStore] Clearing token due to 401 error");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            console.log("[authStore] Keeping token, error was not 401");
            // For network errors or API unavailability, just stop loading but keep token
            set({
              isLoading: false,
            });
          }
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
