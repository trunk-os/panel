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

  useEffect(() => {
    if (isAuthenticated && lastConnectionError && location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [lastConnectionError, isAuthenticated, location.pathname, navigate]);

  return null;
}
