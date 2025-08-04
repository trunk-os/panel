import { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Article as LogsIcon,
} from "@mui/icons-material";
import type { Service } from "@/types/services";
import { useServicesStore } from "@/store/servicesStore";

interface ServiceActionsProps {
  service: Service;
  onViewLogs: (serviceId: string) => void;
}

export function ServiceActions({ service, onViewLogs }: ServiceActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const performAction = useServicesStore((state) => state.performAction);

  const handleStart = () => {
    performAction({ type: "start", serviceId: service.id });
  };

  const handleStop = () => {
    performAction({ type: "stop", serviceId: service.id });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    performAction({ type: "delete", serviceId: service.id });
    setDeleteDialogOpen(false);
  };

  const handleViewLogs = () => {
    onViewLogs(service.id);
  };

  const canStart = service.status === "stopped" || service.status === "error";
  const canStop = service.status === "running";
  const canDelete = service.status === "stopped" || service.status === "error";

  return (
    <>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {canStart && (
          <Tooltip title="Start">
            <IconButton onClick={handleStart} size="small" color="success">
              <PlayIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {canStop && (
          <Tooltip title="Stop">
            <IconButton onClick={handleStop} size="small" color="warning">
              <StopIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="View Logs">
          <IconButton onClick={handleViewLogs} size="small">
            <LogsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {canDelete && (
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the service "{service.name}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
