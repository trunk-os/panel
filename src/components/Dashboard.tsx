import { Typography, Card, CardContent, Box, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import SystemStatusCard from "./metrics/SystemStatusCard";
import DiskMetricCard from "./metrics/DiskMetricCard";
import ComputeMetricCard from "./metrics/ComputeMetricCard";
import NetworkMetricCard from "./metrics/NetworkMetricCard";
import VMMetricCard from "./metrics/VMMetricCard";
import ObjectStorageMetricCard from "./metrics/ObjectStorageMetricCard";
import SkeletonCard from "./SkeletonCard";
import AuditLog from "./AuditLog";
import { useApiStatusStore } from "@/store/apiStatusStore";

const drawerWidth = 240;
const cardHeight = 240;

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { systemStatus } = useApiStatusStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const metricsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [showDebug] = useState(false);

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
    if (!metricsRef.current) return;

    const headerHeight = 64;
    const halfRowHeight = cardHeight / 2;

    const setupObserver = () => {
      const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight + halfRowHeight}px 0px 0px 0px`,
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        setIsCollapsed(!entry.isIntersecting);
      }, observerOptions);

      if (metricsRef.current) {
        observer.observe(metricsRef.current);
      }

      return observer;
    };

    let observer = setupObserver();

    const handleResize = () => {
      observer.disconnect();
      observer = setupObserver();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      ref={dashboardRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        minHeight: "100%",
      }}
    >
      {showDebug && (
        <Box
          sx={{
            position: "fixed",
            top: 64 + cardHeight / 2,
            left: 0,
            right: 0,
            height: "2px",
            backgroundColor: "red",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
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
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Loading system information...
          </Typography>
        )}
      </Box>

      {isCollapsed && (
        <Box
          sx={{
            position: "fixed",
            top: 64,
            left: isMobile ? 0 : drawerWidth,
            right: 0,
            zIndex: 1050,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.background.paper,
            boxShadow: 3,
            py: 0.75,
            px: 1.5,
            display: "flex",
            flexDirection: "row",
            gap: 1,
            transition: "all 0.3s ease",
            minHeight: "56px",
            alignItems: "center",
            width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
            opacity: 0.95,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <SystemStatusCard collapsed={true} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <VMMetricCard collapsed={true} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <ObjectStorageMetricCard collapsed={true} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <DiskMetricCard collapsed={true} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <ComputeMetricCard collapsed={true} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <NetworkMetricCard collapsed={true} />
          </Box>
        </Box>
      )}

      <Box
        ref={metricsRef}
        id="metrics-section"
        sx={{
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <SystemStatusCard />
          </Box>

          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <VMMetricCard />
          </Box>

          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <ObjectStorageMetricCard />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <DiskMetricCard />
          </Box>

          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <ComputeMetricCard />
          </Box>

          <Box sx={{ flex: 1, width: "100%", height: cardHeight }}>
            <NetworkMetricCard />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          mt: isCollapsed ? 6 : 0,
          transition: "margin-top 0.3s ease",
          position: "relative",
        }}
      >
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
