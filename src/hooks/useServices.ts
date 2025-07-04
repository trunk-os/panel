import { useEffect } from "react";
import { useServicesStore } from "@/store/servicesStore";

export function useServices() {
  const {
    services,
    loading,
    error,
    initialize,
    fetchServices,
    performAction,
    clearError,
  } = useServicesStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    services,
    loading,
    error,
    refetch: () => fetchServices(true), // Force refresh
    performAction,
    clearError,
  };
}