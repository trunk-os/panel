import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";

interface ComputeMetricCardProps {
  collapsed?: boolean;
}

export default function ComputeMetricCard({ collapsed = false }: ComputeMetricCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [cpuUsage, setCpuUsage] = useState<number | undefined>();
  const [memoryUsage, setMemoryUsage] = useState<number | undefined>();

  // Simulate loading compute metrics from API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Movk values
      setCpuUsage(42);
      setMemoryUsage(78);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MetricCard
      title="Compute"
      value={cpuUsage}
      unit="%"
      isLoading={isLoading}
      progress={cpuUsage || undefined}
      secondaryValue={memoryUsage}
      secondaryLabel="Memory"
      color="secondary"
      collapsed={collapsed}
    />
  );
}
