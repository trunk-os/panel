import { create } from "zustand";
import { api } from "@/api/client";
import type { Service, ServiceAction } from "@/types/services";
import { useToastStore } from "./toastStore";

let refreshTimeout: NodeJS.Timeout | null = null;

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  cacheDuration: number; // in milliseconds
  isInitialized: boolean;

  // Actions
  fetchServices: (force?: boolean) => Promise<void>;
  performAction: (action: ServiceAction) => Promise<void>;
  clearError: () => void;
  invalidateCache: () => void;
  initialize: () => Promise<void>;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  lastFetch: null,
  cacheDuration: 5000, // 5 seconds cache
  isInitialized: false,

  fetchServices: async (force = false) => {
    const { lastFetch, cacheDuration, loading } = get();
    const now = Date.now();

    // Check if we should use cached data
    if (!force && lastFetch && now - lastFetch < cacheDuration && !loading) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading && !force) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await api.services.list();
      console.log(
        `[DEBUG STORE] servicesStore: received ${response.data.length} services from API`
      );
      const containerServices = response.data.filter(
        (s) =>
          s.name.includes("libpod-") ||
          s.name.includes("gild") ||
          s.name.includes("charond") ||
          s.name.includes("buckled") ||
          s.name.includes("caddy")
      );
      console.log(
        `[DEBUG STORE] servicesStore: ${containerServices.length} container services in store:`,
        containerServices.map((s) => s.name)
      );

      set({
        services: response.data,
        loading: false,
        error: null,
        lastFetch: now,
        isInitialized: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch services";
      set({
        error: errorMessage,
        loading: false,
      });

      const { showToast } = useToastStore.getState();
      showToast({ message: errorMessage, severity: "error" });
    }
  },

  performAction: async (action: ServiceAction) => {
    const { showToast } = useToastStore.getState();

    try {
      switch (action.type) {
        case "start":
          await api.services.start(action.serviceId);
          showToast({ message: "Service started successfully", severity: "success" });
          break;
        case "stop":
          await api.services.stop(action.serviceId);
          showToast({ message: "Service stopped successfully", severity: "success" });
          break;
        case "restart":
          await api.services.restart(action.serviceId);
          showToast({ message: "Service restarted successfully", severity: "success" });
          break;
        case "delete":
          await api.services.delete(action.serviceId);
          showToast({ message: "Service deleted successfully", severity: "success" });
          break;
        default:
          throw new Error(`Unknown action: ${action.type}`);
      }

      // Invalidate cache and debounced refetch after successful action
      get().invalidateCache();

      // Debounce multiple rapid actions to prevent excessive API calls
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(async () => {
        await get().fetchServices(true);
      }, 500); // 500ms debounce
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action.type} service`;
      showToast({ message: errorMessage, severity: "error" });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  invalidateCache: () => set({ lastFetch: null }),

  initialize: async () => {
    const { isInitialized } = get();
    if (!isInitialized) {
      await get().fetchServices();
    }
  },
}));
