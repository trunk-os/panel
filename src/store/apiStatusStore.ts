import { create } from "zustand";
import { api } from "../api/client";
import type { SystemStatus, HealthStatus } from "@/api/types";
import { MetricHistoryStorage } from "@/utils/metricHistoryStorage";

const MAX_HISTORY_POINTS = 86400; // Keep last 86,400 data points (1 full day at 1s intervals)

interface MetricHistory {
  cpuHistory: number[];
  memoryHistory: number[];
}

interface ApiStatusState {
  status: "ok" | "error" | "loading";
  lastSuccessfulStatus: "ok" | "error" | null;
  lastChecked: Date | null;
  isPolling: boolean;
  systemStatus: SystemStatus | null;
  healthStatus: HealthStatus | null;
  metricHistory: MetricHistory;
  checkApiStatus: () => Promise<void>;
  startPolling: (interval?: number) => void;
  stopPolling: () => void;
  clearMetricHistory: () => void;
}

let pollingInterval: number | null = null;

export const useApiStatusStore = create<ApiStatusState>((set, get) => ({
  status: "loading",
  lastSuccessfulStatus: null,
  lastChecked: null,
  isPolling: false,
  systemStatus: null,
  healthStatus: null,
  metricHistory: (() => {
    const loaded = MetricHistoryStorage.load();
    console.log("Loaded metric history from localStorage:", loaded);
    return loaded;
  })(),

  checkApiStatus: async () => {
    set({ status: "loading" });

    try {
      const result = await api.status.ping();
      console.log("[checkApiStatus] ", result);

      if (result === undefined || result.data === null) {
        set({
          status: "error",
          lastSuccessfulStatus: "error",
          lastChecked: new Date(),
          systemStatus: null,
          healthStatus: null,
        });
      } else {
        console.log("[checkApiStatus] Full system status:", result.data.info);
        const systemStatus = result.data.info as SystemStatus;
        const healthStatus = result.data.health;

        // Update metric history
        const currentState = get();
        // Convert from 0-1 to 0-100
        let cpuUsage = Math.round(systemStatus.cpu_usage * 100);
        
        // Calculate load average as percentage (load per core)
        const loadPercentage = Math.min(100, Math.round((systemStatus.load_average[0] / systemStatus.cpus) * 100));
        
        // Use load average if it's significantly higher than CPU usage (indicates CPU averaging is masking spikes)
        if (loadPercentage > cpuUsage + 20 && systemStatus.load_average[0] > 1) {
          console.log(`[DEBUG] Load-based CPU: ${loadPercentage}% (load ${systemStatus.load_average[0]}) vs API CPU: ${cpuUsage}% - using load-based`);
          cpuUsage = loadPercentage;
        }
        const memoryUsage = Math.round(
          ((systemStatus.total_memory - systemStatus.available_memory) /
            systemStatus.total_memory) *
            100
        );

        console.log(`[Metrics] Raw CPU: ${systemStatus.cpu_usage}, After *100: ${systemStatus.cpu_usage * 100}, Rounded: ${cpuUsage}%, Memory: ${memoryUsage}%, Load Avg: ${systemStatus.load_average}, Time: ${new Date().toLocaleTimeString()}`);

        const newCpuHistory = [...currentState.metricHistory.cpuHistory, cpuUsage].slice(
          -MAX_HISTORY_POINTS
        );
        const newMemoryHistory = [...currentState.metricHistory.memoryHistory, memoryUsage].slice(
          -MAX_HISTORY_POINTS
        );

        const newMetricHistory = {
          cpuHistory: newCpuHistory,
          memoryHistory: newMemoryHistory,
        };

        console.log(`[History] CPU history length: ${newCpuHistory.length}, last 5 values: [${newCpuHistory.slice(-5).join(', ')}]`);
        console.log(`[History] Memory history length: ${newMemoryHistory.length}, last 5 values: [${newMemoryHistory.slice(-5).join(', ')}]`);

        // Save to localStorage
        MetricHistoryStorage.save(newMetricHistory);

        set({
          status: "ok",
          lastSuccessfulStatus: "ok",
          lastChecked: new Date(),
          systemStatus,
          healthStatus,
          metricHistory: newMetricHistory,
        });
      }
    } catch (_) {
      set({
        status: "error",
        lastSuccessfulStatus: "error",
        lastChecked: new Date(),
        systemStatus: null,
        healthStatus: null,
      });
    }
  },

  startPolling: (interval?: number) => {
    const { isPolling, checkApiStatus } = get();

    if (isPolling) return;

    console.log(`[Polling] Starting with interval: ${interval}ms`);
    checkApiStatus();

    if (interval && interval > 0) {
      pollingInterval = window.setInterval(() => {
        console.log(`[Polling] Checking API status at ${new Date().toLocaleTimeString()}`);
        checkApiStatus();
      }, interval);
    }

    set({ isPolling: true });
  },

  stopPolling: () => {
    if (pollingInterval !== null) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },


  clearMetricHistory: () => {
    MetricHistoryStorage.clear();
    set({
      metricHistory: {
        cpuHistory: [],
        memoryHistory: [],
      },
    });
  },
}));

// Start polling with settings store interval
import { useSettingsStore } from "./settingsStore";
useApiStatusStore.getState().startPolling(useSettingsStore.getState().pollingInterval);

window.addEventListener("beforeunload", () => {
  useApiStatusStore.getState().stopPolling();
});
