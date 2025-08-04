import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, LinearProgress } from "@mui/material";
import { api } from "@/api/client";
import type { ZFSEntry } from "@/api/types";

interface InfrastructureCardProps {
  collapsed?: boolean;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

export default function InfrastructureCard({ collapsed = false }: InfrastructureCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeVMs, setActiveVMs] = useState<number | undefined>();
  const [allocatedRam, setAllocatedRam] = useState<string | undefined>();
  const [usedSpace, setUsedSpace] = useState<string | undefined>();
  const [totalSpace, setTotalSpace] = useState<string | undefined>();
  const [usagePercent, setUsagePercent] = useState<number | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const vmTimer = setTimeout(() => {
          setActiveVMs(12);
          setAllocatedRam("64 GB");
        }, 800);

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

        return () => clearTimeout(vmTimer);
      } catch (error) {
        console.error("Failed to fetch infrastructure data:", error);
        setActiveVMs(0);
        setAllocatedRam("0 GB");
        setUsedSpace("0 B");
        setTotalSpace("0 B");
        setUsagePercent(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (collapsed) {
    return (
      <Card sx={{ transition: "all 0.3s ease" }}>
        <CardContent
          sx={{
            padding: "8px 16px !important",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1">Infrastructure</Typography>
          {isLoading ? (
            <Box sx={{ width: 80 }}>
              <LinearProgress color="primary" />
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="body2" color="info.main" sx={{ fontWeight: "bold" }}>
                VMs: {activeVMs || 0}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: "bold" }}>
                Archive: {usagePercent || 0}%
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", transition: "all 0.3s ease" }}>
      <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Infrastructure
        </Typography>

        {isLoading ? (
          <Box sx={{ mt: 4 }}>
            <LinearProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexGrow: 1, gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pr: 2,
                borderRight: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Virtual Machines
              </Typography>
              <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>
                {activeVMs || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Active VMs
              </Typography>
              {allocatedRam && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {allocatedRam} allocated
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pl: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Archive Storage
              </Typography>
              <Typography variant="h3" color="primary.main" sx={{ mb: 1 }}>
                {usagePercent || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                Storage Used
              </Typography>

              {usedSpace && totalSpace && (
                <>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    {usedSpace} / {totalSpace}
                  </Typography>
                  <Box sx={{ width: "80%", mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={usagePercent || 0}
                      color={
                        usagePercent && usagePercent > 90
                          ? "error"
                          : usagePercent && usagePercent > 70
                            ? "warning"
                            : "primary"
                      }
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
