import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SetupState {
  setupComplete: boolean;
  setupProgress: {
    currentStep: number;
    completedSteps: string[];
  };
  markSetupComplete: () => void;
  updateSetupProgress: (step: number, completedSteps: string[]) => void;
  resetSetupProgress: () => void;
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
