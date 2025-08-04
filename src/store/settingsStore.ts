import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds default

interface SettingsState {
  pollingInterval: number;
  setPollingInterval: (interval: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pollingInterval: DEFAULT_POLLING_INTERVAL,
      setPollingInterval: (interval) => set({ pollingInterval: interval }),
    }),
    {
      name: "trunk-admin-settings",
    }
  )
);