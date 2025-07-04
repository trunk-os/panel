import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import type { Service } from "@/types/services";
import { ServiceActionsMenu } from "./ServiceActionsMenu";
import { ColumnSelector } from "./ColumnSelector";
import type { ServiceColumn } from "./types";
import { COLUMN_LABELS } from "./types";
import { useServicesTableConfig } from "@/hooks/useServicesTableConfig";

interface ServicesListProps {
  services: Service[];
  loading: boolean;
  onViewLogs: (serviceId: string) => void;
}

export function ServicesList({ services, loading, onViewLogs }: ServicesListProps) {
  const {
    visibleColumns,
    columnOrder,
    updateVisibleColumns,
    updateColumnOrder,
  } = useServicesTableConfig();

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "running":
        return "success";
      case "stopped":
        return "default";
      case "error":
        return "error";
      case "installing":
      case "configuring":
        return "warning";
      default:
        return "default";
    }
  };

  const renderCellContent = (service: Service, column: ServiceColumn) => {
    switch (column) {
      case "status":
        return (
          <Chip 
            label={service.status} 
            color={getStatusColor(service.status)} 
            size="small" 
          />
        );
      case "name":
        return (
          <Typography variant="body2" fontWeight="medium">
            {service.name}
          </Typography>
        );
      case "description":
        return (
          <Typography variant="body2" color="text.secondary">
            {service.description}
          </Typography>
        );
      case "version":
        return service.version;
      case "uptime":
        return service.status === "running" && service.uptime ? formatUptime(service.uptime) : "-";
      case "createdAt":
        return service.createdAt ? formatDate(service.createdAt) : "-";
      case "lastStarted":
        return service.lastStarted ? formatDate(service.lastStarted) : "-";
      case "packageName":
        return service.packageName || "-";
      case "id":
        return (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
            {service.id}
          </Typography>
        );
      case "volumeRoot":
        return service.volumeRoot ? (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
            {service.volumeRoot}
          </Typography>
        ) : "-";
      case "load_state":
        return service.load_state;
      case "active_state":
        return service.active_state;
      case "sub_state":
        return service.sub_state;
      case "following":
        return service.following || "-";
      case "object_path":
        return (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
            {service.object_path}
          </Typography>
        );
      case "job_id":
        return service.job_id || "-";
      case "job_type":
        return service.job_type || "-";
      case "job_object_path":
        return service.job_object_path ? (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
            {service.job_object_path}
          </Typography>
        ) : "-";
      case "actions":
        return <ServiceActionsMenu service={service} onViewLogs={onViewLogs} />;
      default:
        return "-";
    }
  };

  const getColumnAlign = (column: ServiceColumn): "left" | "center" | "right" => {
    return column === "actions" ? "right" : "left";
  };

  const getOrderedVisibleColumns = (): ServiceColumn[] => {
    // Filter ordered columns to only include visible ones
    const orderedVisible = columnOrder.filter(col => visibleColumns.includes(col));
    
    // Ensure actions column is always last if visible
    const withoutActions = orderedVisible.filter(col => col !== "actions");
    const hasActions = visibleColumns.includes("actions");
    
    return hasActions ? [...withoutActions, "actions"] : withoutActions;
  };

  const orderedVisibleColumns = getOrderedVisibleColumns();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (services.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No services found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Install packages to create services
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <ColumnSelector
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onColumnsChange={updateVisibleColumns}
          onColumnOrderChange={updateColumnOrder}
        />
      </Box>
      
      <TableContainer 
        component={Paper}
        sx={{
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {orderedVisibleColumns.map((column) => (
                <TableCell 
                  key={column} 
                  align={getColumnAlign(column)}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "background.paper",
                  }}
                >
                  {COLUMN_LABELS[column]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow 
                key={service.id}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: "action.selected",
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {orderedVisibleColumns.map((column) => (
                  <TableCell 
                    key={column} 
                    align={getColumnAlign(column)}
                    sx={{
                      maxWidth: column === "description" ? 300 : "auto",
                      wordBreak: column === "description" ? "break-word" : "normal",
                    }}
                  >
                    {renderCellContent(service, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
