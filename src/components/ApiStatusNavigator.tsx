import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApiStatusStore } from "@/store/apiStatusStore";
import { useAuthStore } from "@/store/authStore";
import { useConnectionStore } from "@/store/connectionStore";

export function ApiStatusNavigator() {
  const { status } = useApiStatusStore();
  const { isAuthenticated } = useAuthStore();
  const { lastConnectionError, clearConnectionError } = useConnectionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if (isAuthenticated && status === "error" && location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }

    if (previousStatusRef.current === "error" && status === "ok") {
      console.log("[ApiStatusNavigator] API recovered!");
      clearConnectionError();
    }

    previousStatusRef.current = status;
  }, [status, isAuthenticated, location.pathname, navigate, clearConnectionError]);

  // Navigate to dashboard on connection errors, but only once per error
  useEffect(() => {
    if (isAuthenticated && lastConnectionError && location.pathname !== "/dashboard") {
      console.log("[ApiStatusNavigator] Navigating to dashboard due to connection error at:", lastConnectionError);
      navigate("/dashboard", { replace: true });
      // Clear the connection error immediately after navigation to prevent repeated triggering
      clearConnectionError();
    }
  }, [lastConnectionError, isAuthenticated, location.pathname, navigate, clearConnectionError]);

  return null;
}
