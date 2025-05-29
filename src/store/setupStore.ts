import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { api } from "@/api/client";

type ApiClient = typeof api;

interface SetupState {
  setupComplete: boolean;
  setupProgress: {
    currentStep: number;
    completedSteps: string[];
  };
  markSetupComplete: () => void;
  updateSetupProgress: (step: number, completedSteps: string[]) => void;
  resetSetupProgress: () => void;
  clearSetupStore: () => void;
  needsSetup: (apiClient: ApiClient) => Promise<boolean>;
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      setupComplete: false,
      setupProgress: {
        currentStep: 0,
        completedSteps: [],
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
        });
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
