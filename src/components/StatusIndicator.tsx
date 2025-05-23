import { Box, CircularProgress, Typography, Button, Tooltip, Skeleton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallback, useState } from "react";
import type { SystemStatus } from "@/api/types";
import { ApiError } from "@/api/errors";

interface StatusIndicatorProps {
  status: SystemStatus | null;
  isLoading: boolean;
  isStale?: boolean;
  error: ApiError | Error | null;
  onRetry?: () => void;
}

export default function StatusIndicator({
  status,
  isLoading,
  isStale,
  error,
  onRetry,
}: StatusIndicatorProps) {
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleRetry = useCallback(() => {
    if (error && onRetry) {
      onRetry();
      setFailedAttempts((prev) => prev + 1);
    }
  }, [error, onRetry]);

  const isConnectionIssue =
    error &&
    (error.message.includes("Network error") ||
      error.message.includes("timed out") ||
      (error instanceof ApiError && error.statusCode === 408));

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
    const statusColor =
      status.status === "ok"
        ? "success.main"
        : status.status === "warning"
          ? "warning.main"
          : "error.main";

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
            {status.status.toUpperCase()}
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
    const statusColor =
      status.status === "ok"
        ? "success.main"
        : status.status === "warning"
          ? "warning.main"
          : "error.main";

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
            {status.status.toUpperCase()}
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

  const statusColor =
    status.status === "ok"
      ? "success.main"
      : status.status === "warning"
        ? "warning.main"
        : "error.main";

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
      {status.status.toUpperCase()}
    </Typography>
  );
}
