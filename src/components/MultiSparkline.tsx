import { useMemo, useState, useRef, useCallback } from "react";
import { Box, Typography, Slider, Select, MenuItem, FormControl, IconButton } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

interface DataSeries {
  name: string;
  data: number[];
  color: string;
  currentValue?: number;
  unit?: string;
}

interface MultiSparklineProps {
  series: DataSeries[];
  width?: number | string;
  height?: number;
  strokeWidth?: number;
  className?: string;
  showBaseline?: boolean;
  showCurrentValues?: boolean;
  showTimeline?: boolean;
  timelineIntervalMs?: number; // Time interval between data points in milliseconds
  timeScale?: "10s" | "30s" | "1m" | "5m" | "10m" | "30m" | "1h" | "all";
}

export default function MultiSparkline({
  series,
  width = "100%",
  height = 120,
  strokeWidth = 2,
  className,
  showBaseline = true,
  showCurrentValues = true,
  showTimeline = true,
  timelineIntervalMs = 5000, // 5 seconds default
  timeScale = "1m",
}: MultiSparklineProps) {
  const [currentTimeScale, setCurrentTimeScale] = useState(timeScale);
  const [viewOffset, setViewOffset] = useState<number>(0); // For scrolling through data
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; offset: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const maxDataLength = useMemo(() => {
    return series.length > 0 ? Math.max(...series.map(s => s.data.length)) : 0;
  }, [series]);

  // Calculate visible data points based on time scale
  const visibleDataPoints = useMemo(() => {
    const scaleToMs = {
      "10s": 10 * 1000,
      "30s": 30 * 1000,
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "10m": 10 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "all": Infinity,
    };
    
    const scaleMs = scaleToMs[currentTimeScale];
    if (scaleMs === Infinity) return maxDataLength;
    
    return Math.ceil(scaleMs / timelineIntervalMs);
  }, [currentTimeScale, timelineIntervalMs, maxDataLength]);

  // Calculate the actual data window to display
  const dataWindow = useMemo(() => {
    if (currentTimeScale === "all" || visibleDataPoints >= maxDataLength) {
      return { start: 0, end: maxDataLength, length: maxDataLength };
    }
    
    const start = Math.max(0, maxDataLength - visibleDataPoints - viewOffset);
    const end = Math.min(maxDataLength, start + visibleDataPoints);
    
    return { start, end, length: end - start };
  }, [maxDataLength, visibleDataPoints, viewOffset, currentTimeScale]);

  // Generate time labels for the visible window
  const timeLabels = useMemo(() => {
    const now = new Date();
    const labels = [];
    
    // Calculate the actual time range we're showing
    const startTimeOffset = (visibleDataPoints - 1 + viewOffset) * timelineIntervalMs;
    const endTimeOffset = viewOffset * timelineIntervalMs;
    
    for (let i = 0; i < visibleDataPoints; i++) {
      const timeOffset = startTimeOffset - (i * timelineIntervalMs);
      const timePoint = new Date(now.getTime() - timeOffset);
      labels.push(timePoint);
    }
    
    return labels;
  }, [visibleDataPoints, viewOffset, timelineIntervalMs]);

  // Prepare data for MUI X Charts format
  const chartSeries = useMemo(() => {
    const result = series.map(s => {
      const data = Array.from({ length: visibleDataPoints }, (_, index) => {
        const dataIndex = maxDataLength - visibleDataPoints + index - viewOffset;
        return dataIndex >= 0 && dataIndex < s.data.length ? s.data[dataIndex] : 0;
      });
      
      // Debug logging for data issues
      if (s.name === "CPU" && data.some(d => d !== null)) {
        console.log(`[MultiSparkline] ${s.name} data:`, {
          totalLength: s.data.length,
          visiblePoints: visibleDataPoints,
          viewOffset: viewOffset,
          lastFewValues: s.data.slice(-5),
          chartData: data.slice(-5)
        });
      }
      
      return {
        id: s.name,
        data,
        color: s.color,
        curve: "linear" as const,
      };
    });
    return result;
  }, [series, visibleDataPoints, maxDataLength, viewOffset]);

  const xAxisData = useMemo(() => {
    return Array.from({ length: visibleDataPoints }, (_, index) => index);
  }, [visibleDataPoints]);

  const stats = useMemo(() => {
    return series.map(s => {
      if (s.data.length === 0) return { min: 0, max: 0, avg: 0 };
      const min = Math.min(...s.data);
      const max = Math.max(...s.data);
      const avg = Math.round(s.data.reduce((a, b) => a + b, 0) / s.data.length);
      return { min, max, avg };
    });
  }, [series]);

  // Calculate max value in current view window
  const viewMax = useMemo(() => {
    const valuesInView: number[] = [];
    
    series.forEach(s => {
      for (let i = 0; i < visibleDataPoints; i++) {
        const dataIndex = maxDataLength - visibleDataPoints + i - viewOffset;
        if (dataIndex >= 0 && dataIndex < s.data.length) {
          valuesInView.push(s.data[dataIndex]);
        }
      }
    });
    
    const maxValue = valuesInView.length > 0 ? Math.max(...valuesInView) : 100;
    console.log(`[ViewMax] Values in view: ${valuesInView.slice(-10)}, Max: ${maxValue}`);
    return maxValue;
  }, [series, visibleDataPoints, maxDataLength, viewOffset]);

  // Handle graph dragging
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, offset: viewOffset });
  }, [viewOffset]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const deltaX = event.clientX - dragStart.x; // Reversed: positive deltaX = drag right = towards now
    const sensitivity = Math.max(1, Math.floor(visibleDataPoints / 50)); // More responsive
    const offsetChange = Math.floor(deltaX / sensitivity);
    
    // Dragging right (positive deltaX) should reduce offset (move towards now)
    // Dragging left (negative deltaX) should increase offset (move back in history)
    const newOffset = Math.max(0, Math.min(
      maxDataLength - visibleDataPoints,
      dragStart.offset - offsetChange
    ));
    
    setViewOffset(newOffset);
  }, [isDragging, dragStart, visibleDataPoints, maxDataLength]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Calculate if we can scroll (more data available than visible)
  const canScrollBack = viewOffset < (maxDataLength - visibleDataPoints);
  const canScrollForward = viewOffset > 0;

  const formatTimeLabel = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // Show "now" if within 10 seconds
    if (diffSeconds < 10) return "now";
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  }, []);

  if (series.length === 0 || visibleDataPoints === 0) {
    return (
      <Box sx={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  const scaleOptions = [
    { value: "10s", label: "10s" },
    { value: "30s", label: "30s" },
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "10m", label: "10m" },
    { value: "30m", label: "30m" },
    { value: "1h", label: "1h" },
    { value: "all", label: "All" },
  ];

  const handleScroll = useCallback((direction: "back" | "forward") => {
    const scrollAmount = Math.max(1, Math.floor(visibleDataPoints / 4));
    
    if (direction === "back" && canScrollBack) {
      setViewOffset(prev => Math.min(prev + scrollAmount, maxDataLength - visibleDataPoints));
    } else if (direction === "forward" && canScrollForward) {
      setViewOffset(prev => Math.max(0, prev - scrollAmount));
    }
  }, [visibleDataPoints, canScrollBack, canScrollForward, maxDataLength]);

  // Reset view offset when scale changes
  const handleScaleChange = useCallback((newScale: typeof timeScale) => {
    setCurrentTimeScale(newScale);
    setViewOffset(0);
  }, []);

  return (
    <Box className={className} sx={{ position: "relative", width: "100%", minWidth: 0 }}>
      {/* Time Scale and Scroll Controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 0.5 }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={currentTimeScale}
            onChange={(e) => handleScaleChange(e.target.value as typeof timeScale)}
            variant="standard"
            sx={{ 
              fontSize: "11px",
              "& .MuiSelect-select": {
                paddingTop: 0,
                paddingBottom: 0,
              },
            }}
          >
            {scaleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: "11px" }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {currentTimeScale !== "all" && (
          <Typography variant="caption" sx={{ fontSize: "10px", color: "text.secondary" }}>
            {viewOffset > 0 ? "Historical view" : "Live view"}
          </Typography>
        )}
      </Box>

      <Box 
        sx={{ 
          width: "100%", 
          height, 
          border: 1, 
          borderColor: "divider", 
          borderRadius: 1, 
          minWidth: 0,
          cursor: currentTimeScale !== "all" ? (isDragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onMouseDown={currentTimeScale !== "all" ? handleMouseDown : undefined}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          handleMouseUp();
        }}
      >
        <LineChart
          xAxis={[{ 
            data: xAxisData,
            scaleType: "linear",
            min: 0,
            max: visibleDataPoints - 1,
            valueFormatter: (value, context) => {
              const labelIndex = Math.round(value as number);
              if (timeLabels[labelIndex]) {
                return formatTimeLabel(timeLabels[labelIndex]);
              }
              return "";
            },
          }]}
          yAxis={[{
            min: 0,
            max: Math.max(100, Math.ceil(viewMax * 1.1)), // 10% padding above max value
          }]}
          series={chartSeries}
          height={height}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
          grid={{ horizontal: true, vertical: false }}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: strokeWidth,
              fill: "none",
            },
            "& .MuiMarkElement-root": {
              display: "none", // Hide all dots/markers
            },
            "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
              display: "none",
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
              display: "none",
            },
            "& .MuiChartsAxis-left .MuiChartsAxis-line": {
              display: "none",
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
              display: "none",
            },
            "& .MuiChartsAxis-tick": {
              display: "none",
            },
            "& .MuiChartsGrid-line": {
              stroke: "#ccc",
              strokeOpacity: 0.2,
              strokeWidth: 0.5,
            },
          }}
          slotProps={{
            legend: { hidden: true } as any,
          }}
        />
      </Box>

      {/* Current values overlay - only show on hover */}
      {showCurrentValues && isHovering && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
          }}
        >
          {series.map((s) => (
            <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 2,
                  backgroundColor: s.color,
                  borderRadius: 1,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: s.color,
                }}
              >
                {s.currentValue !== undefined ? `${s.currentValue}${s.unit || '%'}` : '--'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Time indicators and Legend */}
      <Box sx={{ mt: 0.5 }}>
        {/* Time range indicator */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, px: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: "9px", color: "text.secondary" }}>
            {timeLabels[0] && formatTimeLabel(timeLabels[0])}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "9px", color: "text.secondary" }}>
            {timeLabels[timeLabels.length - 1] && formatTimeLabel(timeLabels[timeLabels.length - 1])}
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {series.map((s) => (
            <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 2,
                  backgroundColor: s.color,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                {s.name}
              </Typography>
              {s.currentValue !== undefined && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: "11px", 
                    fontWeight: "bold", 
                    color: s.color 
                  }}
                >
                  {s.currentValue}{s.unit || '%'}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}