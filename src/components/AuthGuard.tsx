import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useAuthStore } from "@/store/authStore";
import { useConnectionStore } from "@/store/connectionStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, authError } = useAuthStore();
  const { lastConnectionError } = useConnectionStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log("[AuthGuard] State:", { isAuthenticated, isLoading, pathname: location.pathname });

  useEffect(() => {
    console.log("[AuthGuard] useEffect:", {
      isAuthenticated,
      isLoading,
      pathname: location.pathname,
    });
    if (!isLoading && !isAuthenticated) {
      console.log("[AuthGuard] Redirecting to login");
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  if (isLoading) {
    let loadingMessage = "Authenticating...";

    if (lastConnectionError) {
      loadingMessage = "Connecting to server...";
    } else if (authError) {
      loadingMessage = "Validating session...";
    }

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {loadingMessage}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
