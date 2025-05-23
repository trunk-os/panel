import { create } from "zustand";
import { api } from "../api/client";

const STATUS_POLLING_INTERVAL = 30000; // TODO: Move this to settings

interface ApiStatusState {
  status: "ok" | "error" | "loading";
  lastChecked: Date | null;
  isPolling: boolean;
  checkApiStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: number | null = null;

export const useApiStatusStore = create<ApiStatusState>((set, get) => ({
  status: "loading",
  lastChecked: null,
  isPolling: false,

  checkApiStatus: async () => {
    set({ status: "loading" });

    try {
      const isConnected = await api.status.ping();
      set({
        status: isConnected ? "ok" : "error",
        lastChecked: new Date(),
      });
    } catch (_) {
      set({
        status: "error",
        lastChecked: new Date(),
      });
    }
  },

  startPolling: () => {
    const { isPolling, checkApiStatus } = get();

    if (isPolling) return;

    checkApiStatus();

    pollingInterval = window.setInterval(() => {
      checkApiStatus();
    }, STATUS_POLLING_INTERVAL);

    set({ isPolling: true });
  },

  stopPolling: () => {
    if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },
}));

useApiStatusStore.getState().startPolling();

window.addEventListener("beforeunload", () => {
  useApiStatusStore.getState().stopPolling();
});
