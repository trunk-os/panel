import { Box, Card, CardContent, Typography, LinearProgress, Tooltip } from "@mui/material";

interface MetricCardProps {
  title: string;
  value: string | number | null | undefined;
  isLoading?: boolean;
  progress?: number;
  secondaryValue?: string | number | null;
  secondaryLabel?: string;
  unit?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  collapsed?: boolean;
}

export default function MetricCard({
  title,
  value,
  isLoading = false,
  progress,
  secondaryValue,
  secondaryLabel,
  unit = "",
  color = "primary",
  collapsed = false,
}: MetricCardProps) {
  const formatValue = (val: string | number | null) => {
    if (val === null) return "-";
    return typeof val === "number" ? val.toLocaleString() : val;
  };

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
          {title}
        </Typography>

        {!collapsed ? (
          <Box
            sx={{
              mt: 2,
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: "100%",
            }}
          >
            {isLoading ? (
              <Box sx={{ width: "100%", mt: 4 }}>
                <LinearProgress color={color} />
              </Box>
            ) : (
              <>
                <Typography
                  variant="h2"
                  color={`${color}.main`}
                  sx={{
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {value !== undefined && value !== null ? formatValue(value) : "-"}
                  {unit && (
                    <Typography component="span" variant="h5">
                      {unit}
                    </Typography>
                  )}
                </Typography>

                {secondaryValue !== null && secondaryValue !== undefined && secondaryLabel && (
                  <Tooltip title={secondaryLabel} arrow>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {secondaryLabel}: {formatValue(secondaryValue)}
                    </Typography>
                  </Tooltip>
                )}

                {progress !== undefined && (
                  <Box sx={{ width: "80%", mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={progress > 90 ? "error" : progress > 70 ? "warning" : color}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", textAlign: "right" }}
                    >
                      {progress}%
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isLoading ? (
              <Box sx={{ width: 60, mx: 2 }}>
                <LinearProgress color={color} />
              </Box>
            ) : (
              <Typography variant="body1" color={`${color}.main`} sx={{ fontWeight: "bold" }}>
                {value !== undefined && value !== null ? formatValue(value) : "-"}
                {unit && unit}
                {progress !== undefined && ` (${progress}%)`}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
