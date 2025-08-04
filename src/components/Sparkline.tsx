import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  showValues?: boolean;
  showBaseline?: boolean;
  minScale?: number; // Minimum Y-axis scale (useful for low-value metrics like CPU)
  currentValue?: number; // Current value to overlay on sparkline
  currentValueLabel?: string; // Label for current value (e.g., "67%", "2.4 GB")
}

export default function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "#1976d2",
  strokeWidth = 2,
  className,
  showValues = false,
  showBaseline = true,
  minScale,
  currentValue,
  currentValueLabel,
}: SparklineProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({
      index,
      value,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, yAxisMax: minScale || 100 };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

    // Use minScale if provided and max is below it
    const yAxisMax = minScale && max < minScale ? minScale : max;

    return { min, max, avg, yAxisMax };
  }, [data, minScale]);

  if (data.length === 0) {
    return (
      <Box sx={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ width: "80%", height: 1, backgroundColor: "divider" }} />
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        border: `1px solid ${color}40`,
        borderRadius: 1,
        backgroundColor: `${color}08`,
      }}
    >
      <Box sx={{ width, height, p: 0.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, stats.yAxisMax]} />

            {/* Horizontal grid lines */}
            <ReferenceLine
              y={stats.yAxisMax}
              stroke={color}
              strokeOpacity={0.2}
              strokeWidth={0.5}
            />
            <ReferenceLine
              y={stats.yAxisMax * 0.75}
              stroke={color}
              strokeOpacity={0.1}
              strokeWidth={0.5}
            />
            <ReferenceLine
              y={stats.yAxisMax * 0.5}
              stroke={color}
              strokeOpacity={0.15}
              strokeWidth={0.5}
            />
            <ReferenceLine
              y={stats.yAxisMax * 0.25}
              stroke={color}
              strokeOpacity={0.1}
              strokeWidth={0.5}
            />
            <ReferenceLine y={0} stroke={color} strokeOpacity={0.2} strokeWidth={0.5} />

            {showBaseline && (
              <ReferenceLine
                y={stats.avg}
                stroke={color}
                strokeDasharray="3 2"
                strokeOpacity={0.6}
                strokeWidth={1}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={strokeWidth + 1}
              fill={`url(#gradient-${color.replace("#", "")})`}
              dot={false}
              activeDot={false}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Current value overlay */}
      {currentValue !== undefined && currentValueLabel && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "11px",
              fontWeight: "bold",
              color: color,
              textAlign: "center",
            }}
          >
            {currentValueLabel}
          </Typography>
        </Box>
      )}
      
      {showValues && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            position: "absolute",
            bottom: -16,
            left: 0,
            right: 0,
            fontSize: "10px",
          }}
        >
          <Typography variant="caption" sx={{ fontSize: "9px", color: "text.secondary" }}>
            {stats.min}%
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "9px", color: "text.secondary" }}>
            avg: {stats.avg}%
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "9px", color: "text.secondary" }}>
            {stats.max}%
          </Typography>
        </Box>
      )}
    </Box>
  );
}
