import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { api } from "@/api/client";
import { AUTH_ERROR_MESSAGES } from "@/utils/authValidation";

export function useAuthRecovery() {
  const { 
    token, 
    isAuthenticated, 
    validateToken, 
    clearToken, 
    authError 
  } = useAuthStore();
  const { showToast } = useToastStore();

  const handleSessionRecovery = useCallback(async () => {
    if (!token || isAuthenticated) {
      return;
    }

    console.log('[useAuthRecovery] Attempting session recovery');

    const validation = await validateToken(api);
    
    if (!validation.isValid) {
      console.log('[useAuthRecovery] Session recovery failed:', validation);
      
      // Clear invalid session data
      clearToken();
      
      // Show appropriate message based on the type of failure
      if (validation.isExpired) {
        showToast({
          severity: "info",
          message: AUTH_ERROR_MESSAGES.EXPIRED_TOKEN,
          autoHideDuration: 5000,
        });
      } else if (validation.error?.includes("ERR_CONNECTION_REFUSED") ||
                 validation.error?.includes("ECONNREFUSED") ||
                 validation.error?.includes("ERR_NETWORK") ||
                 validation.error?.includes("Failed to fetch")) {
        showToast({
          severity: "warning",
          message: AUTH_ERROR_MESSAGES.SERVER_RESTART,
          autoHideDuration: 7000,
        });
      } else if (validation.error) {
        showToast({
          severity: "error",
          message: validation.error,
          autoHideDuration: 7000,
        });
      }
    } else {
      console.log('[useAuthRecovery] Session recovery successful');
    }
  }, [token, isAuthenticated, validateToken, clearToken, showToast]);

  const detectServerRestart = useCallback(async () => {
    if (!token) {
      return false;
    }

    try {
      // Try to ping the server
      await api.status.ping();
      
      // If ping succeeds but we have auth errors, likely a server restart
      if (authError?.includes("401")) {
        console.log('[useAuthRecovery] Server restart detected via auth error after successful ping');
        return true;
      }
      
      return false;
    } catch (error) {
      // Server is unreachable
      console.log('[useAuthRecovery] Server unreachable:', error);
      return false;
    }
  }, [token, authError]);

  const handleServerRestartRecovery = useCallback(async () => {
    const isServerRestart = await detectServerRestart();
    
    if (isServerRestart) {
      console.log('[useAuthRecovery] Handling server restart recovery');
      
      // Clear the invalid session
      clearToken();
      
      // Show user-friendly message
      showToast({
        severity: "info",
        message: AUTH_ERROR_MESSAGES.SERVER_RESTART,
        autoHideDuration: 7000,
      });
    }
  }, [detectServerRestart, clearToken, showToast]);

  // Auto-recovery effect
  useEffect(() => {
    if (token && !isAuthenticated && authError) {
      const timeoutId = setTimeout(() => {
        handleSessionRecovery();
      }, 1000); // Small delay to avoid rapid retries

      return () => clearTimeout(timeoutId);
    }
  }, [token, isAuthenticated, authError, handleSessionRecovery]);

  // Server restart detection effect
  useEffect(() => {
    if (authError && token) {
      const timeoutId = setTimeout(() => {
        handleServerRestartRecovery();
      }, 2000); // Slightly longer delay for server restart detection

      return () => clearTimeout(timeoutId);
    }
  }, [authError, token, handleServerRestartRecovery]);

  return {
    handleSessionRecovery,
    detectServerRestart,
    handleServerRestartRecovery,
  };
}