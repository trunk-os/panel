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
  const { lastSuccessfulStatus, lastChecked, checkApiStatus, healthStatus } = useApiStatusStore();
  const apiStatus = lastSuccessfulStatus === "ok";
  const isChecking = false;

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
            <Chip
              label={apiStatus ? "UP" : "DOWN"}
              color={apiStatus ? "success" : "error"}
              size="small"
              sx={{ fontSize: "0.7rem" }}
              onClick={() => checkApiStatus()}
              clickable
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              color={allServicesHealthy ? "success.main" : "error.main"}
              sx={{ fontWeight: "bold" }}
            >
              Services: {healthyCount}/{totalCount}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">System Status</Typography>
          
          {/* API Status Chip with integrated check button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={apiStatus ? "UP" : "DOWN"}
              color={apiStatus ? "success" : "error"}
              size="medium"
              sx={{ fontSize: "0.75rem", fontWeight: "bold" }}
              onClick={() => checkApiStatus()}
              clickable
              icon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
            />
          </Box>
        </Box>

        {/* Services List - Main Content */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, textAlign: "center" }}>
            Services ({healthyCount}/{totalCount} UP)
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}>
            {services.length === 0 ? (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexGrow: 1,
                p: 3,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  No services detected
                </Typography>
              </Box>
            ) : (
              services.map((service) => (
                <Box
                  key={service.name}
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    backgroundColor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {service.name}
                    </Typography>
                    {service.latency && (
                      <Typography variant="caption" color="text.secondary">
                        {service.latency}ms
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={service.isHealthy ? "UP" : "DOWN"}
                    color={service.isHealthy ? "success" : "error"}
                    size="small"
                    variant="filled"
                    sx={{ 
                      fontWeight: "bold",
                      minWidth: "50px"
                    }}
                  />
                </Box>
              ))
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
