import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/client";

export function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Only initialize if we haven't already done so
    if (isLoading && token) {
      initialize(api);
    } else if (!token) {
      // No token, so clear state and stop loading
      useAuthStore.setState({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  }, [initialize, token, isLoading]);

  return null;
}