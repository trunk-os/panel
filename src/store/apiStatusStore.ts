import { create } from "zustand";
import { api } from "../api/client";
import type { SystemStatus, HealthStatus } from "@/api/types";

const STATUS_POLLING_INTERVAL = 30000; // TODO: Move this to settings

interface ApiStatusState {
  status: "ok" | "error" | "loading";
  lastChecked: Date | null;
  isPolling: boolean;
  systemStatus: SystemStatus | null;
  healthStatus: HealthStatus | null;
  checkApiStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: number | null = null;

export const useApiStatusStore = create<ApiStatusState>((set, get) => ({
  status: "loading",
  lastChecked: null,
  isPolling: false,
  systemStatus: null,
  healthStatus: null,

  checkApiStatus: async () => {
    set({ status: "loading" });

    try {
      const result = await api.status.ping();
      console.log("[checkApiStatus] ", result);

      if (result === undefined) {
        set({
          status: "error",
          lastChecked: new Date(),
          systemStatus: null,
          healthStatus: null,
        });
      } else {
        console.log("[checkApiStatus] ", result.data.info);
        const systemStatus = result.data.info as SystemStatus;
        const healthStatus = result.data.health;
        set({
          status: "ok",
          lastChecked: new Date(),
          systemStatus,
          healthStatus,
        });
      }
    } catch (_) {
      set({
        status: "error",
        lastChecked: new Date(),
        systemStatus: null,
        healthStatus: null,
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
