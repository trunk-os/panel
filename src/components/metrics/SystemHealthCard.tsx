import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useApiStatusStore } from "@/store/apiStatusStore";
import { useMemo } from "react";

interface SystemHealthCardProps {
  collapsed?: boolean;
}

interface ServiceInfo {
  name: string;
  isHealthy: boolean;
  latency?: number;
}

export default function SystemHealthCard({ collapsed = false }: SystemHealthCardProps) {
  const { status, lastChecked, checkApiStatus, healthStatus } = useApiStatusStore();
  const apiStatus = status === "loading" ? null : status === "ok";
  const isChecking = status === "loading";

  const services = useMemo((): ServiceInfo[] => {
    const serviceList: ServiceInfo[] = [];

    if (healthStatus?.buckle) {
      const buckleHealth = healthStatus.buckle;
      serviceList.push({
        name: "Buckle",
        isHealthy: !buckleHealth.error,
        latency: buckleHealth.latency,
      });
    }

    return serviceList;
  }, [healthStatus]);

  const formattedTime = lastChecked
    ? lastChecked.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  const healthyCount = services.filter((s) => s.isHealthy).length;
  const totalCount = services.length;
  const allServicesHealthy = healthyCount === totalCount && totalCount > 0;

  if (collapsed) {
    return (
      <Card sx={{ transition: "all 0.3s ease" }}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px !important",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1">System</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {apiStatus === null ? (
              <Typography variant="body2">Checking...</Typography>
            ) : (
              <Chip
                label={apiStatus ? "UP" : "DOWN"}
                color={apiStatus ? "success" : "error"}
                size="small"
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isChecking ? (
              <Box sx={{ width: 60 }}>
                <LinearProgress color="primary" />
              </Box>
            ) : (
              <Typography
                variant="body2"
                color={allServicesHealthy ? "success.main" : "error.main"}
                sx={{ fontWeight: "bold" }}
              >
                Services: {healthyCount}/{totalCount}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">System & API Status</Typography>
          {lastChecked && (
            <Tooltip title={`Last checked: ${formattedTime}`} arrow>
              <Typography variant="caption" color="text.secondary">
                {formattedTime}
              </Typography>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", flexGrow: 1, gap: 2 }}>
          <Box
            sx={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              API Status
            </Typography>
            {apiStatus === null ? (
              <Typography variant="body1">Checking API status...</Typography>
            ) : (
              <>
                <Chip
                  label={apiStatus ? "UP" : "DOWN"}
                  color={apiStatus ? "success" : "error"}
                  size="medium"
                  sx={{
                    fontSize: "1.1rem",
                    padding: "1rem 0.5rem",
                    fontWeight: "bold",
                    mb: 1,
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}
            >
              {apiStatus ? "API is operational" : apiStatus === false ? "API is unreachable" : ""}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderLeft: 1,
              borderColor: "divider",
              pl: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Service Health
            </Typography>

            {isChecking ? (
              <Box sx={{ width: "100%", mt: 2 }}>
                <LinearProgress color="primary" />
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1 }}>
                {services.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No services
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography
                      variant="body1"
                      color={allServicesHealthy ? "success.main" : "error.main"}
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      {healthyCount}/{totalCount} UP
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {services.map((service) => (
                        <Box
                          key={service.name}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {service.name}
                          </Typography>
                          <Chip
                            label={service.isHealthy ? "UP" : "DOWN"}
                            color={service.isHealthy ? "success" : "error"}
                            size="small"
                            variant="filled"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
