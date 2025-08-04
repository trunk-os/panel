import { Box, Card, CardContent, Typography, LinearProgress, Grid } from "@mui/material";
import { useApiStatusStore } from "@/store/apiStatusStore";

interface ComputeMetricCardProps {
  collapsed?: boolean;
}

export default function ComputeMetricCard({ collapsed = false }: ComputeMetricCardProps) {
  const { systemStatus, status } = useApiStatusStore();
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

  if (collapsed) {
    return (
      <Card sx={{ transition: "all 0.3s ease" }}>
        <CardContent sx={{ padding: "8px 16px !important", display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Compute
          </Typography>
          {isLoading ? (
            <Box sx={{ width: 60, mx: 2 }}>
              <LinearProgress color="secondary" />
            </Box>
          ) : (
            <Typography variant="body1" color="secondary.main" sx={{ fontWeight: "bold" }}>
              CPU: {cpuUsage}% | Memory: {memoryPercentage}%
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Compute
        </Typography>

        {isLoading ? (
          <Box sx={{ mt: 4 }}>
            <LinearProgress color="secondary" />
          </Box>
        ) : (
          <Grid container spacing={1} sx={{ flexGrow: 1 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: "center", p: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  CPU Usage
                </Typography>
                <Typography variant="h6" color="secondary.main" sx={{ mb: 0.5 }}>
                  {cpuUsage}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={cpuUsage}
                  color={cpuUsage > 90 ? "error" : cpuUsage > 70 ? "warning" : "secondary"}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: "center", p: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  Memory
                </Typography>
                <Typography variant="h6" color="secondary.main" sx={{ mb: 0.5 }}>
                  {formatBytes(usedMemory)}/{formatBytes(totalMemory)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={memoryPercentage}
                  color={
                    memoryPercentage > 90
                      ? "error"
                      : memoryPercentage > 70
                        ? "warning"
                        : "secondary"
                  }
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: "center", p: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  CPU Count
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {cpuCount}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ textAlign: "center", p: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  Load Average
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {loadAverage}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
