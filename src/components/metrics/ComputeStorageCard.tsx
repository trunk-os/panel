import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { useState } from "react";
import { useApiStatusStore } from "@/store/apiStatusStore";
import MultiSparkline from "@/components/MultiSparkline";

export default function ComputeStorageCard() {
  const { systemStatus, metricHistory } = useApiStatusStore();
  const isLoading = !systemStatus;
  const [zoomedChart, setZoomedChart] = useState<"cpu" | "memory" | null>(null);

  const formatBytes = (bytes: number): string => {
    const gb = bytes / 1024 ** 3;
    return `${gb.toFixed(1)} GB`;
  };

  const cpuUsage = systemStatus ? Math.round(systemStatus.cpu_usage * 100) : 0;
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

  const handleChartClick = (chartType: "cpu" | "memory") => {
    setZoomedChart(zoomedChart === chartType ? null : chartType);
  };


  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            Resources
          </Typography>
          {!isLoading && (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                {cpuCount} cores, {loadAverage} load
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                {formatBytes(usedMemory)} / {formatBytes(totalMemory)}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          height: "100%", 
          gap: 2 
        }}>
          {/* CPU Chart */}
          <Box sx={{ 
            flex: {
              xs: zoomedChart === "cpu" ? 2 : zoomedChart === "memory" ? 0.5 : 1,
              md: zoomedChart === "cpu" ? 3 : zoomedChart === "memory" ? 0.5 : 1
            },
            display: "flex", 
            flexDirection: "column", 
            px: "5px",
            minWidth: 0,
            minHeight: { xs: zoomedChart === "cpu" ? 180 : 100, md: "auto" },
            position: "relative",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              "& .zoom-indicator": {
                opacity: 1,
              }
            }
          }}
          onClick={() => handleChartClick("cpu")}
          >
            <Box sx={{ 
              position: "absolute", 
              top: 4, 
              right: 4, 
              zIndex: 1,
              opacity: 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none"
            }}
            className="zoom-indicator"
            >
              <IconButton 
                size="small" 
                sx={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  width: 20,
                  height: 20,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" }
                }}
              >
                {zoomedChart === "cpu" ? <ZoomOut sx={{ fontSize: 12 }} /> : <ZoomIn sx={{ fontSize: 12 }} />}
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ fontSize: "10px", color: "text.secondary", mb: 0.5, textAlign: "center" }}>
              CPU Usage
            </Typography>
            <MultiSparkline
                series={[
                  {
                    name: "CPU",
                    data: metricHistory.cpuHistory,
                    color: "#9c27b0",
                    currentValue: cpuUsage,
                    unit: "%"
                  }
                ]}
                height={zoomedChart === "cpu" ? 140 : 80}
                strokeWidth={2}
                showCurrentValues={zoomedChart === "cpu"}
                showTimeline={zoomedChart === "cpu"}
                timelineIntervalMs={5000}
                timeScale="1m"
              />
          </Box>
          
          {/* Memory Chart */}
          <Box sx={{ 
            flex: {
              xs: zoomedChart === "memory" ? 2 : zoomedChart === "cpu" ? 0.5 : 1,
              md: zoomedChart === "memory" ? 3 : zoomedChart === "cpu" ? 0.5 : 1
            },
            display: "flex", 
            flexDirection: "column", 
            px: "5px",
            minWidth: 0,
            minHeight: { xs: zoomedChart === "memory" ? 180 : 100, md: "auto" },
            position: "relative",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              "& .zoom-indicator": {
                opacity: 1,
              }
            }
          }}
          onClick={() => handleChartClick("memory")}
          >
            <Box sx={{ 
              position: "absolute", 
              top: 4, 
              right: 4, 
              zIndex: 1,
              opacity: 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none"
            }}
            className="zoom-indicator"
            >
              <IconButton 
                size="small" 
                sx={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  width: 20,
                  height: 20,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" }
                }}
              >
                {zoomedChart === "memory" ? <ZoomOut sx={{ fontSize: 12 }} /> : <ZoomIn sx={{ fontSize: 12 }} />}
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ fontSize: "10px", color: "text.secondary", mb: 0.5, textAlign: "center" }}>
              Memory Usage
            </Typography>
            <MultiSparkline
                series={[
                  {
                    name: "Memory",
                    data: metricHistory.memoryHistory,
                    color: "#1976d2",
                    currentValue: memoryPercentage,
                    unit: "%"
                  }
                ]}
                height={zoomedChart === "memory" ? 120 : 80}
                strokeWidth={2}
                showCurrentValues={zoomedChart === "memory"}
                showTimeline={zoomedChart === "memory"}
                timelineIntervalMs={5000}
                timeScale="1m"
              />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
