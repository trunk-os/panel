import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "@/store/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('[AuthGuard] State:', { isAuthenticated, isLoading, pathname: location.pathname });

  useEffect(() => {
    console.log('[AuthGuard] useEffect:', { isAuthenticated, isLoading, pathname: location.pathname });
    if (!isLoading && !isAuthenticated) {
      console.log('[AuthGuard] Redirecting to login');
      navigate("/login", { 
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}