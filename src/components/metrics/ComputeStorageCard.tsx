import { Box, Card, CardContent, Typography, LinearProgress, Grid } from "@mui/material";
import { useApiStatusStore } from "@/store/apiStatusStore";
import Sparkline from "@/components/Sparkline";

interface ComputeStorageCardProps {
  collapsed?: boolean;
}

export default function ComputeStorageCard({ collapsed = false }: ComputeStorageCardProps) {
  const { systemStatus, status, metricHistory } = useApiStatusStore();
  const isLoading = status === "loading" || !systemStatus;

  const formatBytes = (bytes: number): string => {
    const gb = bytes / 1024 ** 3;
    return `${gb.toFixed(1)} GB`;
  };

  const cpuUsage = systemStatus ? Math.round(systemStatus.cpu_usage) : 0;
  const cpuCount = systemStatus ? systemStatus.cpus : 0;
  const loadAverage = systemStatus ? systemStatus.load_average[0].toFixed(2) : "0.00";
  const memoryPercentage = systemStatus
    ? Math.round(
        ((systemStatus.total_memory - systemStatus.available_memory) / systemStatus.total_memory) *
          100
      )
    : 0;
  const totalMemory = systemStatus ? systemStatus.total_memory : 0;
  const usedMemory = systemStatus ? systemStatus.total_memory - systemStatus.available_memory : 0;

  const formatBytesToGB = (bytes: number): number => Math.round((bytes / 1024 ** 3) * 10) / 10; // One decimal place
  const totalDisk = systemStatus ? formatBytesToGB(systemStatus.total_disk) : undefined;
  const availableDisk = systemStatus ? formatBytesToGB(systemStatus.available_disk) : undefined;
  const usedDisk =
    totalDisk && availableDisk !== undefined ? Math.max(0, totalDisk - availableDisk) : undefined;
  const diskUsagePercent =
    totalDisk &&
    totalDisk > 0 &&
    systemStatus?.total_disk &&
    systemStatus?.available_disk !== undefined
      ? Math.round(
          ((systemStatus.total_disk - systemStatus.available_disk) / systemStatus.total_disk) * 100
        )
      : undefined;

  if (collapsed) {
    return (
      <Card sx={{ transition: "all 0.3s ease" }}>
        <CardContent
          sx={{
            padding: "8px 16px !important",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1">Resources</Typography>
          {isLoading ? (
            <Box sx={{ width: 80 }}>
              <LinearProgress color="secondary" />
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: "bold" }}>
                  CPU: {cpuUsage}%
                </Typography>
                <Sparkline
                  data={metricHistory.cpuHistory}
                  width={40}
                  height={16}
                  color="#9c27b0"
                  strokeWidth={1.5}
                  minScale={20}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="info.main" sx={{ fontWeight: "bold" }}>
                  Mem: {memoryPercentage}%
                </Typography>
                <Sparkline
                  data={metricHistory.memoryHistory}
                  width={40}
                  height={16}
                  color="#1976d2"
                  strokeWidth={1.5}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", pb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Compute & Storage
        </Typography>

        {isLoading ? (
          <Box sx={{ mt: 4 }}>
            <LinearProgress color="secondary" />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                pb: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  CPU Usage
                </Typography>
                <Typography variant="h5" color="secondary.main" sx={{ mb: 1 }}>
                  {cpuUsage}%
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <Sparkline
                    data={metricHistory.cpuHistory}
                    width={120}
                    height={30}
                    color="#9c27b0"
                    strokeWidth={2}
                    showBaseline={true}
                    showValues={false}
                    minScale={20}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {cpuCount} cores, {loadAverage} load
                </Typography>
              </Box>

              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  Memory Usage
                </Typography>
                <Typography variant="h5" color="secondary.main" sx={{ mb: 1 }}>
                  {memoryPercentage}%
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <Sparkline
                    data={metricHistory.memoryHistory}
                    width={120}
                    height={30}
                    color="#1976d2"
                    strokeWidth={2}
                    showBaseline={true}
                    showValues={false}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {formatBytes(usedMemory)} / {formatBytes(totalMemory)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
                py: 2,
                px: 1,
              }}
            >
              {systemStatus?.total_disk && systemStatus.total_disk > 0 && totalDisk ? (
                <Box sx={{ textAlign: "center", width: "100%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Disk Storage
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Typography variant="h4" color="info.main">
                      {usedDisk || 0} GB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {availableDisk} GB Available of {totalDisk} GB
                    </Typography>
                  </Box>
                  <Box sx={{ width: "80%", mx: "auto" }}>
                    <LinearProgress
                      variant="determinate"
                      value={diskUsagePercent || 0}
                      color={
                        diskUsagePercent && diskUsagePercent > 90
                          ? "error"
                          : diskUsagePercent && diskUsagePercent > 70
                            ? "warning"
                            : "info"
                      }
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", textAlign: "right", mt: 0.5 }}
                    >
                      {diskUsagePercent}% used
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="h5" color="info.main" sx={{ mb: 1 }}>
                    Unknown
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disk information unavailable
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
