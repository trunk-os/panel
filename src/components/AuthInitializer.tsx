import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/client";

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log('[AuthInitializer] useEffect:', { 
      hasInitialized: hasInitialized.current, 
      token: token ? 'present' : 'null', 
      isLoading 
    });
    
    // Prevent multiple initializations
    if (hasInitialized.current) {
      console.log('[AuthInitializer] Already initialized, skipping');
      return;
    }
    
    if (token) {
      // We have a token, try to validate it
      console.log('[AuthInitializer] Token found, initializing');
      hasInitialized.current = true;
      initialize(api).catch((error) => {
        console.error('AuthInitializer: Initialize failed', error);
        // Reset flag on error so we can retry
        hasInitialized.current = false;
      });
    } else if (isLoading) {
      // No token and still loading, stop loading
      console.log('[AuthInitializer] No token, stopping loading');
      hasInitialized.current = true;
      useAuthStore.setState({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } else {
      console.log('[AuthInitializer] No token and not loading, nothing to do');
    }
  }, [initialize, token, isLoading]);

  return null;
}