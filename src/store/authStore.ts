import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Login, UserData } from "@/api/types";
import { createSecureStorage } from "./secureStorage";
import type { api } from "@/api/client";

type ApiClient = typeof api;

interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsSetup: boolean;
  setupProgress: {
    currentStep: number;
    completedSteps: string[];
  };
  login: (credentials: Login, apiClient: ApiClient) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  clearToken: () => void;
  initialize: (apiClient: ApiClient) => Promise<void>;
  markSetupComplete: () => void;
  checkSetupRequired: (apiClient: ApiClient) => Promise<boolean>;
  updateSetupProgress: (step: number, completedSteps: string[]) => void;
  resetSetupProgress: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      needsSetup: false,
      setupProgress: {
        currentStep: 0,
        completedSteps: [],
      },

      getToken: () => get().token,

      clearToken: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      markSetupComplete: () => {
        set({ 
          needsSetup: false,
          setupProgress: {
            currentStep: 0,
            completedSteps: [],
          }
        });
      },

      updateSetupProgress: (step: number, completedSteps: string[]) => {
        set({ 
          setupProgress: {
            currentStep: step,
            completedSteps,
          }
        });
      },

      resetSetupProgress: () => {
        set({ 
          setupProgress: {
            currentStep: 0,
            completedSteps: [],
          }
        });
      },

      checkSetupRequired: async (apiClient: ApiClient) => {
        try {
          const usersList = await apiClient.users.list();
          const hasMultipleUsers = Array.isArray(usersList.data) && usersList.data.length > 1;
          
          const zfsList = await apiClient.zfs.list("");
          const hasZFS = Array.isArray(zfsList.data) ? zfsList.data.length > 0 : zfsList.data?.entries?.length > 0;
          
          const currentUser = get().user;
          const isFirstUser = !hasMultipleUsers && currentUser !== null;
          
          const needsSetup = isFirstUser && !hasZFS;
          set({ needsSetup });
          return needsSetup;
        } catch (error) {
          console.log("[authStore] Setup check failed:", error);
          set({ needsSetup: false });
          return false;
        }
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
          const needsSetup = await get().checkSetupRequired(apiClient);
          set({
            user: me,
            isLoading: false,
            needsSetup,
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

      initialize: async (apiClient: ApiClient) => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const me: UserData = (await apiClient.session.me()).data;
          const needsSetup = await get().checkSetupRequired(apiClient);
          set({
            user: me,
            isAuthenticated: true,
            isLoading: false,
            needsSetup,
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
        needsSetup: state.needsSetup,
        setupProgress: state.setupProgress,
      }),
      onRehydrateStorage: () => () => {
        // Storage rehydrated
      },
    }
  )
);
