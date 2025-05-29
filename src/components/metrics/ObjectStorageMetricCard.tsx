import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";
import { api } from "@/api/client";
import type { ZFSEntry } from "@/api/types";

interface ObjectStorageMetricCardProps {
  collapsed?: boolean;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

export default function ObjectStorageMetricCard({
  collapsed = false,
}: ObjectStorageMetricCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [usedSpace, setUsedSpace] = useState<string | undefined>();
  const [totalSpace, setTotalSpace] = useState<string | undefined>();
  const [usagePercent, setUsagePercent] = useState<number | undefined>();

  useEffect(() => {
    const fetchZFSData = async () => {
      setIsLoading(true);
      try {
        const response = await api.zfs.list("");
        const datasets = response.data;

        const datasetEntries = datasets.filter((entry: ZFSEntry) => entry.kind === "Dataset");

        let totalUsed = 0;
        let totalAvailable = 0;

        for (const dataset of datasetEntries) {
          totalUsed += dataset.used;
          totalAvailable += dataset.avail;
        }

        const usedFormatted = formatBytes(totalUsed);
        const totalFormatted = formatBytes(totalUsed + totalAvailable);
        const usagePercentage =
          totalUsed + totalAvailable > 0
            ? Math.round((totalUsed / (totalUsed + totalAvailable)) * 100)
            : 0;

        setUsedSpace(usedFormatted);
        setTotalSpace(totalFormatted);
        setUsagePercent(usagePercentage);
      } catch (error) {
        console.error("Failed to fetch ZFS data:", error);
        setUsedSpace("0 B");
        setTotalSpace("0 B");
        setUsagePercent(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZFSData();
  }, []);

  const secondaryValue = usedSpace && totalSpace ? `${usedSpace} / ${totalSpace}` : undefined;

  return (
    <MetricCard
      title="Archive"
      value={usagePercent}
      unit="%"
      isLoading={isLoading}
      secondaryValue={collapsed ? undefined : secondaryValue}
      secondaryLabel={collapsed ? undefined : "Storage"}
      progress={collapsed ? undefined : usagePercent}
      color="primary"
      collapsed={collapsed}
    />
  );
}
