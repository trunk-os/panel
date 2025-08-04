import { Typography, Card, CardContent, Box, useMediaQuery, Select, MenuItem, FormControl } from "@mui/material";
import { useState, useEffect } from "react";
import SystemHealthCard from "./metrics/SystemHealthCard";
import ComputeStorageCard from "./metrics/ComputeStorageCard";
import SkeletonCard from "./SkeletonCard";
import AuditLog from "./AuditLog";
import { useApiStatusStore } from "@/store/apiStatusStore";
import { useSettingsStore } from "@/store/settingsStore";

const cardHeight = 300;

export default function Dashboard() {
  const isVeryLargeScreen = useMediaQuery("(min-width: 1600px)");
  const { systemStatus, lastChecked, stopPolling, startPolling } = useApiStatusStore();
  const { pollingInterval, setPollingInterval } = useSettingsStore();

  const [isLoading, setIsLoading] = useState(true);

  const intervalOptions = [
    { value: 1000, label: "1s" },
    { value: 5000, label: "5s" },
    { value: 10000, label: "10s" },
    { value: 30000, label: "30s" },
    { value: 60000, label: "1m" },
    { value: 0, label: "Off" },
  ];

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        minHeight: "100%",
      }}
    >
      <Box>
        <Typography variant="h2">Dashboard</Typography>
        {systemStatus ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Host: {systemStatus.host_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kernel: {systemStatus.kernel_version}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Uptime: {formatUptime(systemStatus.uptime)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Last Check: {lastChecked ? lastChecked.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }) : "--:--:--"}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 60 }}>
                <Select
                  value={pollingInterval}
                  onChange={(e) => {
                    const newInterval = e.target.value as number;
                    setPollingInterval(newInterval);
                    stopPolling();
                    if (newInterval > 0) {
                      startPolling(newInterval);
                    }
                  }}
                  variant="standard"
                  sx={{ 
                    fontSize: "0.875rem",
                    color: "text.secondary",
                    "& .MuiSelect-select": {
                      paddingTop: 0,
                      paddingBottom: 0,
                    },
                  }}
                >
                  {intervalOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Loading system information...
          </Typography>
        )}
      </Box>

      <Box>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", xl: "row" }, gap: 2 }}>
          <Box sx={{ 
            flex: { xs: 1, xl: 1 }, 
            minWidth: 0, 
            height: cardHeight,
          }}>
            <SystemHealthCard />
          </Box>

          <Box sx={{ 
            flex: { xs: 1, xl: 3 }, 
            minWidth: 0, 
            height: cardHeight,
          }}>
            <ComputeStorageCard />
          </Box>
        </Box>
      </Box>

      <Box>
        {isLoading ? (
          <SkeletonCard titleWidth={150} withFooter={true} />
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activity</Typography>
              <Typography component="span" variant="body2" color="text.secondary">
                <AuditLog />
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
