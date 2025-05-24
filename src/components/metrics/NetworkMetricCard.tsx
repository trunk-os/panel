import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";

interface NetworkMetricCardProps {
  collapsed?: boolean;
}

export default function NetworkMetricCard({ collapsed = false }: NetworkMetricCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [throughput, setThroughput] = useState<number | null>(null);
  const [packetsPerSec, setPacketsPerSec] = useState<number | null>(null);

  // Simulate loading network metrics from API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock values
      setThroughput(148);
      setPacketsPerSec(2650);
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MetricCard
      title="Network I/O"
      value={throughput}
      unit="MB/s"
      isLoading={isLoading}
      secondaryValue={packetsPerSec}
      secondaryLabel="Packets/sec"
      color="primary"
      collapsed={collapsed}
    />
  );
}
