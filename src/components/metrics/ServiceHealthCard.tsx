import { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useApiStatusStore } from "@/store/apiStatusStore";

interface ServiceHealthCardProps {
  collapsed?: boolean;
}

interface ServiceInfo {
  name: string;
  isHealthy: boolean;
  latency?: number;
}

export default function ServiceHealthCard({ collapsed = false }: ServiceHealthCardProps) {
  const { status, healthStatus } = useApiStatusStore();

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

  const isLoading = status === "loading";

  const getHealthColor = (isHealthy: boolean) => (isHealthy ? "success" : "error");
  const getHealthLabel = (isHealthy: boolean) => (isHealthy ? "UP" : "DOWN");

  if (collapsed) {
    const healthyCount = services.filter((s) => s.isHealthy).length;
    const totalCount = services.length;
    const allHealthy = healthyCount === totalCount && totalCount > 0;

    return (
      <Card sx={{ transition: "all 0.3s ease" }}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px !important",
          }}
        >
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Services
          </Typography>
          {isLoading ? (
            <Box sx={{ width: 60, mx: 2 }}>
              <LinearProgress color="primary" />
            </Box>
          ) : (
            <Typography
              variant="body1"
              color={allHealthy ? "success.main" : "error.main"}
              sx={{ fontWeight: "bold" }}
            >
              {healthyCount}/{totalCount} UP
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6">Service Health</Typography>

        {isLoading ? (
          <Box sx={{ width: "100%", mt: 4 }}>
            <LinearProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ mt: 2, flexGrow: 1 }}>
            {services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No services available
              </Typography>
            ) : (
              <List sx={{ width: "100%", p: 0 }}>
                {services.map((service) => (
                  <ListItem key={service.name} sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body1">{service.name}</Typography>
                          <Chip
                            label={getHealthLabel(service.isHealthy)}
                            color={getHealthColor(service.isHealthy)}
                            size="small"
                            variant="filled"
                          />
                        </Box>
                      }
                      secondary={
                        service.isHealthy && service.latency !== undefined ? (
                          <Typography variant="body2" color="text.secondary">
                            {service.latency}ms latency
                          </Typography>
                        ) : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
