import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";

interface DiskMetricCardProps {
  collapsed?: boolean;
}

export default function DiskMetricCard({ collapsed = false }: DiskMetricCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [diskUsage, setDiskUsage] = useState<number | string | undefined>();
  const [availableSpace, setAvailableSpace] = useState<number | string | undefined>();
  const [usagePercent, setUsagePercent] = useState<number | undefined>();

  // Simulate loading disk metrics from API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock values
      const totalSpace = 500; // 500 GB
      const used = 320; // 320 GB
      const available = totalSpace - used;
      const percent = Math.round((used / totalSpace) * 100);

      setDiskUsage(used);
      setAvailableSpace(available);
      setUsagePercent(percent);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MetricCard
      title="Disk"
      value={diskUsage}
      unit="GB"
      isLoading={isLoading}
      progress={usagePercent}
      secondaryValue={availableSpace}
      secondaryLabel="Available"
      color="info"
      collapsed={collapsed}
    />
  );
}
