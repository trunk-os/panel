import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Login, UserData } from "@/api/types";
import { createSecureStorage } from "./secureStorage";
import type { api } from "@/api/client";
import { useSetupStore } from "./setupStore";
import { ApiError } from "@/api/errors";
import { validateStoredToken, showAuthErrorMessage, type TokenValidationResult } from "@/utils/authValidation";

type ApiClient = typeof api;

interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (credentials: Login, apiClient: ApiClient) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  clearToken: () => void;
  initialize: (apiClient: ApiClient) => Promise<void>;
  validateToken: (apiClient: ApiClient) => Promise<TokenValidationResult>;
  clearAuthError: () => void;
  currentUser: () => UserData | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      authError: null,

      getToken: () => get().token,

      clearToken: () => {
        set({ user: null, token: null, isAuthenticated: false, authError: null });
        const { clearSetupStore } = useSetupStore.getState();
        clearSetupStore();
      },

      clearAuthError: () => {
        set({ authError: null });
      },

      validateToken: async (apiClient: ApiClient) => {
        const token = get().token;
        return await validateStoredToken(token, apiClient);
      },

      login: async (credentials: Login, apiClient: ApiClient) => {
        set({ isLoading: true, authError: null });
        try {
          const response = await apiClient.session.login(credentials);
          const token = response.data.token;
          set({
            token,
            user: null,
            isAuthenticated: true,
            authError: null,
          });
          // get my user data
          const me: UserData = (await apiClient.session.me()).data;
          set({
            user: me,
            isLoading: false,
          });
        } catch (error) {
          console.log("[authStore] Login error:", error);
          const errorMessage = error instanceof ApiError && error.statusCode === 401
            ? "Invalid username or password"
            : error instanceof Error 
              ? error.message 
              : "Login failed. Please try again.";
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            authError: errorMessage,
          });
          throw error;
        }
      },
      currentUser() {
        return get().user;
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, authError: null });
        const { clearSetupStore } = useSetupStore.getState();
        clearSetupStore();
      },

      initialize: async (apiClient: ApiClient) => {
        const currentState = get();
        const token = currentState.token;
        
        console.log('[authStore] initialize called with:', { 
          hasToken: !!token, 
          isLoading: currentState.isLoading,
          isAuthenticated: currentState.isAuthenticated 
        });
        
        if (!token) {
          console.log('[authStore] No token, setting not authenticated');
          set({ isLoading: false, isAuthenticated: false, user: null, authError: null });
          return;
        }

        console.log('[authStore] Starting token validation');
        set({ isLoading: true, authError: null });
        
        const validation = await get().validateToken(apiClient);
        
        if (validation.isValid) {
          try {
            console.log('[authStore] Token valid, fetching user data');
            const me: UserData = (await apiClient.session.me()).data;
            console.log('[authStore] Token validation successful, user:', me);
            set({
              user: me,
              isAuthenticated: true,
              isLoading: false,
              authError: null,
            });
            console.log('[authStore] Auth state updated to authenticated');
          } catch (error) {
            console.log("[authStore] Failed to fetch user data after validation:", error);
            set({
              isLoading: false,
              isAuthenticated: false,
              authError: "Failed to fetch user information",
            });
          }
        } else {
          console.log("[authStore] Token validation failed:", validation);
          
          if (validation.isExpired || validation.error?.includes("401")) {
            console.log("[authStore] Clearing expired/invalid token");
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              authError: null,
            });
            showAuthErrorMessage(validation);
          } else {
            console.log("[authStore] Keeping token, error was not authentication-related");
            set({
              isLoading: false,
              isAuthenticated: false,
              authError: validation.error || null,
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
