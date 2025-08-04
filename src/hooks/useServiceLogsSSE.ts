import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/api/client";
import type { ServiceLog } from "@/types/services";
import { useToastStore } from "@/store/toastStore";

export function useServiceLogsSSE() {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchLogs = useCallback(
    async (serviceId: string, count = 10) => {
      try {
        setLoading(true);
        setError(null);

        // Close any existing EventSource
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        const response = await api.services.logs(serviceId, count);
        setLogs(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch service logs";
        setError(errorMessage);
        showToast({ message: errorMessage, severity: "error" });
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const fetchLogsViaSSE = useCallback(
    async (serviceId: string, count = 10) => {
      try {
        setLoading(true);
        setError(null);

        // Close any existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // TODO: Replace with actual SSE endpoint when backend supports it
        // For now, this is a placeholder structure for future SSE implementation
        const _sseUrl = `/api/services/${serviceId}/logs/stream?count=${count}`;

        // Placeholder EventSource setup (commented out until backend ready)
        /*
      eventSourceRef.current = new EventSource(sseUrl);
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const logData: ServiceLog = JSON.parse(event.data);
          setLogs(prevLogs => [...prevLogs, logData]);
        } catch (parseError) {
          console.error('Failed to parse SSE log data:', parseError);
        }
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        setError('Connection to log stream failed');
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
      };
      
      eventSourceRef.current.onopen = () => {
        setLoading(false);
        setError(null);
      };
      */

        // Fallback to regular API call for now
        await fetchLogs(serviceId, count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to connect to log stream";
        setError(errorMessage);
        showToast({ message: errorMessage, severity: "error" });
        setLoading(false);
      }
    },
    [fetchLogs, showToast]
  );

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setError(null);
    closeConnection();
  }, [closeConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnection();
    };
  }, [closeConnection]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchLogsViaSSE,
    closeConnection,
    clearLogs,
  };
}
