import MetricCard from "./MetricCard";
import { useApiStatusStore } from "@/store/apiStatusStore";

interface DiskMetricCardProps {
  collapsed?: boolean;
}

export default function DiskMetricCard({ collapsed = false }: DiskMetricCardProps) {
  const { systemStatus, status } = useApiStatusStore();
  const isLoading = status === "loading" || !systemStatus;

  const formatBytes = (bytes: number): number => Math.round(bytes / 1024 ** 3);

  const totalDisk = systemStatus ? formatBytes(systemStatus.total_disk) : undefined;
  const availableDisk = systemStatus ? formatBytes(systemStatus.available_disk) : undefined;
  const usedDisk = totalDisk && availableDisk ? totalDisk - availableDisk : undefined;
  const usagePercent = totalDisk && usedDisk ? Math.round((usedDisk / totalDisk) * 100) : undefined;

  if (systemStatus?.total_disk && systemStatus.total_disk > 0) {
    return (
      <MetricCard
        title="Disk"
        value={usedDisk}
        unit="GB"
        isLoading={isLoading}
        progress={usagePercent}
        secondaryValue={availableDisk}
        secondaryLabel="Available"
        color="info"
        collapsed={collapsed}
      />
    );
  }
  return (
    <MetricCard
      title="Disk"
      value="unknown"
      isLoading={isLoading}
      collapsed={collapsed}
      color="info"
    />
  );
}
