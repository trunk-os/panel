import { useServicesStore } from "@/store/servicesStore";

/**
 * Read-only hook for components that only need to display services
 * without triggering any initialization or refreshes.
 * Use this for components like metric cards, status displays, etc.
 */
export function useServicesReadOnly() {
  const { services, loading, error } = useServicesStore((state) => ({
    services: state.services,
    loading: state.loading,
    error: state.error,
  }));

  return {
    services,
    loading,
    error,
  };
}
