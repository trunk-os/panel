import { Box, CircularProgress, Tooltip } from "@mui/material";
import { useApiStatusStore } from "../store/apiStatusStore";

export default function ApiStatusIndicator() {
  const { status, lastChecked, checkApiStatus } = useApiStatusStore();

  const statusColor =
    status === "ok"
      ? "#4caf50" // success green
      : status === "error"
        ? "#f44336" // error red
        : "#757575"; // loading grey

  const getTooltipText = () => {
    const baseText =
      status === "ok"
        ? "API Connected"
        : status === "error"
          ? "API Connection Error"
          : "Checking API...";

    if (lastChecked && status !== "loading") {
      return `${baseText} (Last checked: ${lastChecked.toLocaleTimeString()})`;
    }

    return baseText;
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Box
        sx={{
          display: "inline-flex",
          ml: 1.5,
          position: "relative",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => checkApiStatus()}
      >
        {status === "loading" ? (
          <CircularProgress size={12} sx={{ color: statusColor }} />
        ) : (
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow:
                status === "ok"
                  ? "0 0 6px #4caf50"
                  : status === "error"
                    ? "0 0 6px #f44336"
                    : "none",
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
}
