import { Box, CircularProgress, Typography, Button, Tooltip, Skeleton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallback, useState } from "react";
import { useApiStatusStore } from "@/store/apiStatusStore";

interface StatusIndicatorProps {
  isStale?: boolean;
  onRetry?: () => void;
}

export default function StatusIndicator({ isStale, onRetry }: StatusIndicatorProps) {
  const { status: apiStatus, checkApiStatus } = useApiStatusStore();
  const [failedAttempts, setFailedAttempts] = useState(0);

  const isLoading = apiStatus === "loading";
  const status = apiStatus;
  const error = apiStatus === "error" ? new Error("API connection failed") : null;

  const handleRetry = useCallback(() => {
    if (error && (onRetry || checkApiStatus)) {
      const retryFn = onRetry || checkApiStatus;
      retryFn();
      setFailedAttempts((prev) => prev + 1);
    }
  }, [error, onRetry, checkApiStatus]);

  const isConnectionIssue = apiStatus === "error";

  if (isLoading && !status) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    );
  }

  if (isStale && status) {
    const statusColor = status === "ok" ? "success.main" : "error.main";

    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Typography
            variant="h2"
            sx={{
              color: statusColor,
              opacity: 0.8, // Dim slightly to indicate refreshing
            }}
          >
            {status.toUpperCase()}
          </Typography>
          <CircularProgress
            size={14}
            sx={{
              position: "absolute",
              top: 0,
              right: -18,
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: "0.7rem" }}>
          Refreshing...
        </Typography>
      </Box>
    );
  }

  if (isConnectionIssue && status) {
    const statusColor = status === "ok" ? "success.main" : "error.main";

    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Tooltip title="Status data could not be refreshed - last known status shown">
          <Typography
            variant="h2"
            sx={{
              color: statusColor,
              opacity: 0.8, // Dim slightly to indicate it's stale
            }}
          >
            {status.toUpperCase()}
          </Typography>
        </Tooltip>
        {onRetry && (
          <Button size="small" startIcon={<RefreshIcon />} onClick={handleRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (error && !status) {
    if (failedAttempts > 2) {
      return (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "text.secondary",
            }}
          >
            UNKNOWN
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            System status unavailable
          </Typography>
          {onRetry && (
            <Button size="small" startIcon={<RefreshIcon />} onClick={handleRetry} sx={{ mt: 1 }}>
              Check Status
            </Button>
          )}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "error.main",
          }}
        >
          ERROR
        </Typography>
        {onRetry && (
          <Button size="small" startIcon={<RefreshIcon />} onClick={handleRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (!status) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="50%" height={60} animation="wave" />
      </Box>
    );
  }

  const statusColor = status === "ok" ? "success.main" : "error.main";

  return (
    <Typography
      variant="h2"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: statusColor,
      }}
    >
      {status.toUpperCase()}
    </Typography>
  );
}
