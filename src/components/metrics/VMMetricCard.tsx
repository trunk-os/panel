import { useState, useEffect } from "react";
import MetricCard from "./MetricCard";

interface VMMetricCardProps {
  collapsed?: boolean;
}

export default function VMMetricCard({ collapsed = false }: VMMetricCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeVMs, setActiveVMs] = useState<number | undefined>();
  const [totalCPUs, setTotalCPUs] = useState<number | undefined>();
  const [totalMemory, setTotalMemory] = useState<string | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveVMs(12);
      setTotalCPUs(48);
      setTotalMemory("256 GB");
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const secondaryValue = totalCPUs && totalMemory ? `${totalCPUs} vCPUs, ${totalMemory}` : undefined;

  return (
    <MetricCard
      title="Active VMs"
      value={activeVMs}
      isLoading={isLoading}
      secondaryValue={secondaryValue}
      secondaryLabel="Resources"
      color="info"
      collapsed={collapsed}
    />
  );
}