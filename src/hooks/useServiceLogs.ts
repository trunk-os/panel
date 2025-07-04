import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/api/client";
import type { ServiceLog } from "@/types/services";
import { useToastStore } from "@/store/toastStore";

export function useServiceLogs() {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTailing, setIsTailing] = useState(false);
  const { showToast } = useToastStore();
  const tailingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.services.logs(serviceId);
      setLogs(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch service logs";
      setError(errorMessage);
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const startTailing = useCallback(async (serviceId: string) => {
    if (tailingIntervalRef.current) {
      clearInterval(tailingIntervalRef.current);
    }

    setIsTailing(true);
    
    const tailLogs = async () => {
      try {
        const response = await api.services.logs(serviceId);
        setLogs(prevLogs => {
          const newLogs = response.data;
          
          // Only update if we have new logs or different content
          if (newLogs.length !== prevLogs.length || 
              JSON.stringify(newLogs) !== JSON.stringify(prevLogs)) {
            return newLogs;
          }
          return prevLogs;
        });
        
        if (error) {
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to tail service logs";
        setError(errorMessage);
        // Don't show toast for every polling error to avoid spam
      }
    };

    // Initial fetch
    await tailLogs();
    
    // Poll every 2 seconds
    tailingIntervalRef.current = setInterval(tailLogs, 2000);
  }, [error]);

  const stopTailing = useCallback(() => {
    if (tailingIntervalRef.current) {
      clearInterval(tailingIntervalRef.current);
      tailingIntervalRef.current = null;
    }
    setIsTailing(false);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
    stopTailing();
  }, [stopTailing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tailingIntervalRef.current) {
        clearInterval(tailingIntervalRef.current);
      }
    };
  }, []);

  return {
    logs,
    loading,
    error,
    isTailing,
    fetchLogs,
    startTailing,
    stopTailing,
    clearLogs,
  };
}