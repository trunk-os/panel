import { Typography, Card, CardContent, Box, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import SystemStatusCard from "./metrics/SystemStatusCard";
import DiskMetricCard from "./metrics/DiskMetricCard";
import ComputeMetricCard from "./metrics/ComputeMetricCard";
import NetworkMetricCard from "./metrics/NetworkMetricCard";
import VMMetricCard from "./metrics/VMMetricCard";
import ObjectStorageMetricCard from "./metrics/ObjectStorageMetricCard";
import SkeletonCard from "./SkeletonCard";

const drawerWidth = 240;
const cardHeight = 240;

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [vmData, setVmData] = useState<{ active: number; cpus: number; memory: string } | undefined>();
  const [storageData, setStorageData] = useState<{ objects: number; used: string; available: string } | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const metricsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [showDebug] = useState(false);

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
      setVmData({ active: 12, cpus: 48, memory: "256 GB" });
      setStorageData({ objects: 1847293, used: "2.4 TB", available: "12.6 TB" });
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
        <Typography variant="body1" color="text.secondary">
          Welcome to the Trunk Admin dashboard
        </Typography>
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
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur purus a
                  justo volutpat, eget vestibulum felis venenatis. In hac habitasse platea dictumst.
                  Fusce tempor nunc sit amet arcu fermentum scelerisque. Duis molestie erat tortor,
                  quis consectetur lacus pulvinar sit amet. Quisque tempus metus a quam venenatis,
                  ut malesuada augue malesuada. Praesent at semper felis, non fermentum enim. Nulla
                  ac quam sed arcu tincidunt porta. Cras blandit dolor vel ullamcorper suscipit.
                  Aliquam quis egestas nibh. Ut vestibulum dapibus pulvinar. Sed luctus, tortor eu
                  pharetra sollicitudin, lectus mi lobortis elit, id volutpat sapien tellus id nisl.
                </p>

                <p>
                  Suspendisse potenti. Nullam non elit sit amet purus condimentum sollicitudin quis
                  tempor nibh. Quisque sit amet cursus sem, eget imperdiet justo. Nunc nisl nulla,
                  malesuada sit amet neque pharetra, pharetra ullamcorper magna. In ultrices arcu
                  auctor pretium gravida. Nullam quis sapien dolor. Donec quis accumsan tellus, vel
                  scelerisque nisi. Phasellus sollicitudin elementum varius. Morbi consectetur
                  finibus magna. Curabitur euismod gravida finibus. Ut ornare ac nulla at
                  vestibulum.
                </p>

                <p>
                  Pellentesque rutrum mi eu tellus accumsan, sit amet tempor nibh lacinia. Mauris
                  aliquet nec diam ut rhoncus. Nulla ac nibh quam. Donec quis risus hendrerit,
                  facilisis ipsum vitae, sodales turpis. In at congue ante, vitae laoreet leo. Morbi
                  eu pharetra elit. Cras imperdiet scelerisque mi, in bibendum augue lacinia auctor.
                  Praesent non sagittis erat. Pellentesque tristique elit nec tempus imperdiet. Ut
                  fringilla libero arcu, non pellentesque sapien egestas et. Curabitur et justo
                  consectetur, pharetra dui non, sollicitudin neque. Praesent pulvinar nec libero ut
                  tincidunt. Nullam a odio accumsan, feugiat magna eu, tristique elit. In finibus et
                  risus eu mattis. Cras a lacus in urna tincidunt ultrices. Nam tincidunt felis in
                  iaculis sagittis. Sed maximus erat id luctus rhoncus. Nullam ultricies lorem
                  posuere mattis egestas. Aenean dignissim efficitur erat, in porttitor arcu rutrum
                  sed. Vivamus placerat consequat arcu ac aliquet. In ac justo id orci convallis
                  hendrerit sed id lorem. Donec gravida lorem justo, vitae sollicitudin lacus
                  feugiat nec. Proin a lacinia nulla. Quisque imperdiet posuere erat, et lobortis
                  urna pretium eget. Duis eleifend eros quis posuere scelerisque. Fusce efficitur
                  condimentum magna, sit amet gravida nisi egestas sed. Curabitur lobortis urna ac
                  urna vehicula placerat. Quisque vehicula elit eu tellus viverra vestibulum. Nunc
                  eget nunc et arcu mattis sodales.
                </p>

                <p>
                  Mauris euismod blandit euismod. Praesent in hendrerit neque, nec luctus mi. Etiam
                  gravida rutrum dolor, et laoreet ipsum efficitur nec. Fusce sem dui, interdum ac
                  viverra ut, iaculis tincidunt ante. Sed non posuere urna. Donec sollicitudin elit
                  at lorem ullamcorper porta. Pellentesque habitant morbi tristique senectus et
                  netus et malesuada fames ac turpis egestas. Sed egestas, elit ac tincidunt congue,
                  dui mi bibendum tortor, et pretium ligula augue ac mauris. Mauris sed tincidunt
                  orci. Pellentesque a erat cursus, porttitor neque hendrerit, eleifend tortor.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur purus a
                  justo volutpat, eget vestibulum felis venenatis. In hac habitasse platea dictumst.
                  Fusce tempor nunc sit amet arcu fermentum scelerisque. Duis molestie erat tortor,
                  quis consectetur lacus pulvinar sit amet. Quisque tempus metus a quam venenatis,
                  ut malesuada augue malesuada. Praesent at semper felis, non fermentum enim. Nulla
                  ac quam sed arcu tincidunt porta. Cras blandit dolor vel ullamcorper suscipit.
                  Aliquam quis egestas nibh. Ut vestibulum dapibus pulvinar. Sed luctus, tortor eu
                  pharetra sollicitudin, lectus mi lobortis elit, id volutpat sapien tellus id nisl.
                </p>

                <p>
                  Suspendisse potenti. Nullam non elit sit amet purus condimentum sollicitudin quis
                  tempor nibh. Quisque sit amet cursus sem, eget imperdiet justo. Nunc nisl nulla,
                  malesuada sit amet neque pharetra, pharetra ullamcorper magna. In ultrices arcu
                  auctor pretium gravida. Nullam quis sapien dolor. Donec quis accumsan tellus, vel
                  scelerisque nisi. Phasellus sollicitudin elementum varius. Morbi consectetur
                  finibus magna. Curabitur euismod gravida finibus. Ut ornare ac nulla at
                  vestibulum.
                </p>

                <p>
                  Pellentesque rutrum mi eu tellus accumsan, sit amet tempor nibh lacinia. Mauris
                  aliquet nec diam ut rhoncus. Nulla ac nibh quam. Donec quis risus hendrerit,
                  facilisis ipsum vitae, sodales turpis. In at congue ante, vitae laoreet leo. Morbi
                  eu pharetra elit. Cras imperdiet scelerisque mi, in bibendum augue lacinia auctor.
                  Praesent non sagittis erat. Pellentesque tristique elit nec tempus imperdiet. Ut
                  fringilla libero arcu, non pellentesque sapien egestas et. Curabitur et justo
                  consectetur, pharetra dui non, sollicitudin neque. Praesent pulvinar nec libero ut
                  tincidunt. Nullam a odio accumsan, feugiat magna eu, tristique elit. In finibus et
                  risus eu mattis. Cras a lacus in urna tincidunt ultrices. Nam tincidunt felis in
                  iaculis sagittis. Sed maximus erat id luctus rhoncus. Nullam ultricies lorem
                  posuere mattis egestas. Aenean dignissim efficitur erat, in porttitor arcu rutrum
                  sed. Vivamus placerat consequat arcu ac aliquet. In ac justo id orci convallis
                  hendrerit sed id lorem. Donec gravida lorem justo, vitae sollicitudin lacus
                  feugiat nec. Proin a lacinia nulla. Quisque imperdiet posuere erat, et lobortis
                  urna pretium eget. Duis eleifend eros quis posuere scelerisque. Fusce efficitur
                  condimentum magna, sit amet gravida nisi egestas sed. Curabitur lobortis urna ac
                  urna vehicula placerat. Quisque vehicula elit eu tellus viverra vestibulum. Nunc
                  eget nunc et arcu mattis sodales.
                </p>

                <p>
                  Mauris euismod blandit euismod. Praesent in hendrerit neque, nec luctus mi. Etiam
                  gravida rutrum dolor, et laoreet ipsum efficitur nec. Fusce sem dui, interdum ac
                  viverra ut, iaculis tincidunt ante. Sed non posuere urna. Donec sollicitudin elit
                  at lorem ullamcorper porta. Pellentesque habitant morbi tristique senectus et
                  netus et malesuada fames ac turpis egestas. Sed egestas, elit ac tincidunt congue,
                  dui mi bibendum tortor, et pretium ligula augue ac mauris. Mauris sed tincidunt
                  orci. Pellentesque a erat cursus, porttitor neque hendrerit, eleifend tortor.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec efficitur purus a
                  justo volutpat, eget vestibulum felis venenatis. In hac habitasse platea dictumst.
                  Fusce tempor nunc sit amet arcu fermentum scelerisque. Duis molestie erat tortor,
                  quis consectetur lacus pulvinar sit amet. Quisque tempus metus a quam venenatis,
                  ut malesuada augue malesuada. Praesent at semper felis, non fermentum enim. Nulla
                  ac quam sed arcu tincidunt porta. Cras blandit dolor vel ullamcorper suscipit.
                  Aliquam quis egestas nibh. Ut vestibulum dapibus pulvinar. Sed luctus, tortor eu
                  pharetra sollicitudin, lectus mi lobortis elit, id volutpat sapien tellus id nisl.
                </p>

                <p>
                  Suspendisse potenti. Nullam non elit sit amet purus condimentum sollicitudin quis
                  tempor nibh. Quisque sit amet cursus sem, eget imperdiet justo. Nunc nisl nulla,
                  malesuada sit amet neque pharetra, pharetra ullamcorper magna. In ultrices arcu
                  auctor pretium gravida. Nullam quis sapien dolor. Donec quis accumsan tellus, vel
                  scelerisque nisi. Phasellus sollicitudin elementum varius. Morbi consectetur
                  finibus magna. Curabitur euismod gravida finibus. Ut ornare ac nulla at
                  vestibulum.
                </p>

                <p>
                  Pellentesque rutrum mi eu tellus accumsan, sit amet tempor nibh lacinia. Mauris
                  aliquet nec diam ut rhoncus. Nulla ac nibh quam. Donec quis risus hendrerit,
                  facilisis ipsum vitae, sodales turpis. In at congue ante, vitae laoreet leo. Morbi
                  eu pharetra elit. Cras imperdiet scelerisque mi, in bibendum augue lacinia auctor.
                  Praesent non sagittis erat. Pellentesque tristique elit nec tempus imperdiet. Ut
                  fringilla libero arcu, non pellentesque sapien egestas et. Curabitur et justo
                  consectetur, pharetra dui non, sollicitudin neque. Praesent pulvinar nec libero ut
                  tincidunt. Nullam a odio accumsan, feugiat magna eu, tristique elit. In finibus et
                  risus eu mattis. Cras a lacus in urna tincidunt ultrices. Nam tincidunt felis in
                  iaculis sagittis. Sed maximus erat id luctus rhoncus. Nullam ultricies lorem
                  posuere mattis egestas. Aenean dignissim efficitur erat, in porttitor arcu rutrum
                  sed. Vivamus placerat consequat arcu ac aliquet. In ac justo id orci convallis
                  hendrerit sed id lorem. Donec gravida lorem justo, vitae sollicitudin lacus
                  feugiat nec. Proin a lacinia nulla. Quisque imperdiet posuere erat, et lobortis
                  urna pretium eget. Duis eleifend eros quis posuere scelerisque. Fusce efficitur
                  condimentum magna, sit amet gravida nisi egestas sed. Curabitur lobortis urna ac
                  urna vehicula placerat. Quisque vehicula elit eu tellus viverra vestibulum. Nunc
                  eget nunc et arcu mattis sodales.
                </p>

                <p>
                  Mauris euismod blandit euismod. Praesent in hendrerit neque, nec luctus mi. Etiam
                  gravida rutrum dolor, et laoreet ipsum efficitur nec. Fusce sem dui, interdum ac
                  viverra ut, iaculis tincidunt ante. Sed non posuere urna. Donec sollicitudin elit
                  at lorem ullamcorper porta. Pellentesque habitant morbi tristique senectus et
                  netus et malesuada fames ac turpis egestas. Sed egestas, elit ac tincidunt congue,
                  dui mi bibendum tortor, et pretium ligula augue ac mauris. Mauris sed tincidunt
                  orci. Pellentesque a erat cursus, porttitor neque hendrerit, eleifend tortor.
                </p>
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
