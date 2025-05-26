import { Box, Card, CardContent, Typography, Tooltip, Button, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useApiStatusStore } from "@/store/apiStatusStore";

interface SystemStatusCardProps {
  collapsed?: boolean;
}

export default function SystemStatusCard({ collapsed = false }: SystemStatusCardProps) {
  const { status, lastChecked, checkApiStatus } = useApiStatusStore();
  const apiStatus = status === "loading" ? null : status === "ok";
  const isChecking = status === "loading";

  const formattedTime = lastChecked
    ? lastChecked.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <Card
      sx={{
        height: collapsed ? "auto" : "100%",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: collapsed ? "row" : "column",
          alignItems: collapsed ? "center" : "flex-start",
          padding: collapsed ? "8px 16px !important" : undefined,
        }}
      >
        <Typography variant={collapsed ? "subtitle1" : "h6"} sx={{ mr: collapsed ? 2 : 0 }}>
          API Status
        </Typography>

        {!collapsed ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
                mb: 2,
                mt: -4,
              }}
            >
              {lastChecked && (
                <Tooltip title={`Last checked: ${formattedTime}`} arrow>
                  <Typography variant="caption" color="text.secondary">
                    {formattedTime}
                  </Typography>
                </Tooltip>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
                gap: 2,
                width: "100%",
              }}
            >
              {apiStatus === null ? (
                <Typography variant="body1">Checking API status...</Typography>
              ) : (
                <>
                  <Chip
                    label={apiStatus ? "UP" : "DOWN"}
                    color={apiStatus ? "success" : "error"}
                    size="medium"
                    sx={{
                      fontSize: "1.5rem",
                      padding: "1.5rem 0.5rem",
                      fontWeight: "bold",
                    }}
                  />

                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => checkApiStatus()}
                    disabled={isChecking}
                    size="small"
                    variant="outlined"
                  >
                    {isChecking ? "Checking..." : "Check Now"}
                  </Button>
                </>
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, textAlign: "center" }}
            >
              {apiStatus ? "API is operational" : apiStatus === false ? "API is unreachable" : ""}
            </Typography>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {apiStatus === null ? (
              <Typography variant="body2">Checking...</Typography>
            ) : (
              <Chip
                label={apiStatus ? "UP" : "DOWN"}
                color={apiStatus ? "success" : "error"}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
