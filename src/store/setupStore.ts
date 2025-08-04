import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { api } from "@/api/client";
import { nanoid } from "nanoid";

type ApiClient = typeof api;

export interface SetupUser {
  id: string;
  username: string;
  password: string;
  realname?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: "admin" | "user";
  isTemporary?: boolean;
}

export interface SetupStorage {
  id: string;
  name: string;
  type: "dataset" | "volume";
  size?: number;
  mountPoint?: string;
  options: Record<string, unknown>;
  isTemporary?: boolean;
}

interface SetupState {
  setupComplete: boolean;
  setupProgress: {
    currentStep: number;
    completedSteps: string[];
  };
  // Multi-entity setup data
  pendingUsers: SetupUser[];
  pendingStorage: SetupStorage[];
  validationErrors: {
    users: Record<string, string[]>;
    storage: Record<string, string[]>;
  };

  // Setup control
  markSetupComplete: () => void;
  updateSetupProgress: (step: number, completedSteps: string[]) => void;
  resetSetupProgress: () => void;
  clearSetupStore: () => void;
  needsSetup: (apiClient: ApiClient) => Promise<boolean>;

  // User management
  addPendingUser: (user: Omit<SetupUser, "id">) => string;
  updatePendingUser: (id: string, user: SetupUser) => void;
  removePendingUser: (id: string) => void;
  clearPendingUsers: () => void;
  setUserValidation: (id: string, errors: string[]) => void;

  // Storage management
  addPendingStorage: (storage: Omit<SetupStorage, "id">) => string;
  updatePendingStorage: (id: string, storage: SetupStorage) => void;
  removePendingStorage: (id: string) => void;
  clearPendingStorage: () => void;
  setStorageValidation: (id: string, errors: string[]) => void;

  // Validation helpers
  isSetupValid: () => boolean;
  getValidationSummary: () => {
    userErrors: number;
    storageErrors: number;
    totalUsers: number;
    totalStorage: number;
  };
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set, get) => ({
      setupComplete: false,
      setupProgress: {
        currentStep: 0,
        completedSteps: [],
      },
      pendingUsers: [],
      pendingStorage: [],
      validationErrors: {
        users: {},
        storage: {},
      },

      markSetupComplete: () => {
        set({
          setupComplete: true,
        });
      },

      updateSetupProgress: (step: number, completedSteps: string[]) => {
        set({
          setupProgress: {
            currentStep: step,
            completedSteps,
          },
        });
      },

      resetSetupProgress: () => {
        set({
          setupProgress: {
            currentStep: 0,
            completedSteps: [],
          },
        });
      },

      clearSetupStore: () => {
        set({
          setupComplete: false,
          setupProgress: {
            currentStep: 0,
            completedSteps: [],
          },
          pendingUsers: [],
          pendingStorage: [],
          validationErrors: {
            users: {},
            storage: {},
          },
        });
      },

      // User management methods
      addPendingUser: (user: Omit<SetupUser, "id">) => {
        const id = nanoid();
        const newUser: SetupUser = {
          ...user,
          id,
          isTemporary: true,
        };
        set((state) => ({
          pendingUsers: [...state.pendingUsers, newUser],
        }));
        return id;
      },

      updatePendingUser: (id: string, user: SetupUser) => {
        set((state) => ({
          pendingUsers: state.pendingUsers.map((u) => (u.id === id ? user : u)),
        }));
      },

      removePendingUser: (id: string) => {
        set((state) => ({
          pendingUsers: state.pendingUsers.filter((u) => u.id !== id),
          validationErrors: {
            ...state.validationErrors,
            users: Object.fromEntries(
              Object.entries(state.validationErrors.users).filter(([key]) => key !== id)
            ),
          },
        }));
      },

      clearPendingUsers: () => {
        set({
          pendingUsers: [],
          validationErrors: {
            users: {},
            storage: get().validationErrors.storage,
          },
        });
      },

      setUserValidation: (id: string, errors: string[]) => {
        set((state) => ({
          validationErrors: {
            ...state.validationErrors,
            users: {
              ...state.validationErrors.users,
              [id]: errors,
            },
          },
        }));
      },

      // Storage management methods
      addPendingStorage: (storage: Omit<SetupStorage, "id">) => {
        const id = nanoid();
        const newStorage: SetupStorage = {
          ...storage,
          id,
          isTemporary: true,
        };
        set((state) => ({
          pendingStorage: [...state.pendingStorage, newStorage],
        }));
        return id;
      },

      updatePendingStorage: (id: string, storage: SetupStorage) => {
        set((state) => ({
          pendingStorage: state.pendingStorage.map((s) => (s.id === id ? storage : s)),
        }));
      },

      removePendingStorage: (id: string) => {
        set((state) => ({
          pendingStorage: state.pendingStorage.filter((s) => s.id !== id),
          validationErrors: {
            ...state.validationErrors,
            storage: Object.fromEntries(
              Object.entries(state.validationErrors.storage).filter(([key]) => key !== id)
            ),
          },
        }));
      },

      clearPendingStorage: () => {
        set({
          pendingStorage: [],
          validationErrors: {
            users: get().validationErrors.users,
            storage: {},
          },
        });
      },

      setStorageValidation: (id: string, errors: string[]) => {
        set((state) => ({
          validationErrors: {
            ...state.validationErrors,
            storage: {
              ...state.validationErrors.storage,
              [id]: errors,
            },
          },
        }));
      },

      // Validation helpers
      isSetupValid: () => {
        const state = get();
        const userErrors = Object.values(state.validationErrors.users).flat();
        const storageErrors = Object.values(state.validationErrors.storage).flat();
        return userErrors.length === 0 && storageErrors.length === 0;
      },

      getValidationSummary: () => {
        const state = get();
        const userErrors = Object.values(state.validationErrors.users).flat().length;
        const storageErrors = Object.values(state.validationErrors.storage).flat().length;
        return {
          userErrors,
          storageErrors,
          totalUsers: state.pendingUsers.length,
          totalStorage: state.pendingStorage.length,
        };
      },

      needsSetup: async (apiClient: ApiClient) => {
        try {
          const usersResponse = await apiClient.users.list({ page: 0 });
          console.log("[needsSetup]", usersResponse);
          const userCount = usersResponse.data.length;
          console.log("[needsSetup]", usersResponse.data.length);

          if (userCount !== 1) {
            return false;
          }

          const zfsResponse = await apiClient.zfs.list("");
          console.log("[needsSetup] zfs", zfsResponse);
          const zfsCount = zfsResponse.data.length;

          return zfsCount === 0;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "trunk-admin-setup",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
