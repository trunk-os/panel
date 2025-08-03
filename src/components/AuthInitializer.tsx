import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/client";
import { useConnectionStore } from "@/store/connectionStore";
import { useAuthRecovery } from "@/hooks/useAuthRecovery";

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasInitialized = useRef(false);
  const [serverConnected, setServerConnected] = useState(false);
  
  // Enable session recovery functionality
  useAuthRecovery();

  const checkServerConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      await api.status.ping();
      console.log('[AuthInitializer] Server connectivity check: OK');
      useConnectionStore.getState().clearConnectionError();
      return true;
    } catch (error) {
      console.log('[AuthInitializer] Server connectivity check failed:', error);
      useConnectionStore.getState().setConnectionError();
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('[AuthInitializer] useEffect:', { 
      hasInitialized: hasInitialized.current, 
      token: token ? 'present' : 'null', 
      isLoading,
      serverConnected
    });
    
    // Prevent multiple initializations
    if (hasInitialized.current) {
      console.log('[AuthInitializer] Already initialized, skipping');
      return;
    }

    const initializeAuth = async () => {
      hasInitialized.current = true;
      
      // First check server connectivity
      console.log('[AuthInitializer] Checking server connectivity...');
      const connected = await checkServerConnectivity();
      setServerConnected(connected);
      
      if (!connected) {
        console.log('[AuthInitializer] Server not reachable, stopping initialization');
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return;
      }

      if (token) {
        // We have a token and server is reachable, validate it
        console.log('[AuthInitializer] Token found and server reachable, initializing');
        try {
          await initialize(api);
        } catch (error) {
          console.error('AuthInitializer: Initialize failed', error);
          // Reset flag on error so we can retry
          hasInitialized.current = false;
        }
      } else {
        // No token, clean up state
        console.log('[AuthInitializer] No token, cleaning up state');
        useAuthStore.setState({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          isLoading: false,
          authError: null
        });
      }
    };

    initializeAuth();
  }, [initialize, token, isLoading, checkServerConnectivity, serverConnected]);

  return null;
}