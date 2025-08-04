import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Article as LogsIcon,
} from "@mui/icons-material";
import type { Service } from "@/types/services";
import { useServicesStore } from "@/store/servicesStore";

interface ServiceActionsMenuProps {
  service: Service;
  onViewLogs: (serviceId: string) => void;
}

export function ServiceActionsMenu({ service, onViewLogs }: ServiceActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const performAction = useServicesStore((state) => state.performAction);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStart = () => {
    performAction({ type: "start", serviceId: service.id });
    handleClose();
  };

  const handleStop = () => {
    performAction({ type: "stop", serviceId: service.id });
    handleClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleClose();
  };

  const handleConfirmDelete = () => {
    performAction({ type: "delete", serviceId: service.id });
    setDeleteDialogOpen(false);
  };

  const handleViewLogs = () => {
    onViewLogs(service.id);
    handleClose();
  };

  const canStart = service.status === "stopped" || service.status === "error";
  const canStop = service.status === "running";
  const canDelete = service.status === "stopped" || service.status === "error";

  return (
    <>
      <Tooltip title="Service actions">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-label={`Actions for ${service.name}`}
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
              backgroundColor: "action.hover",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 140 },
        }}
      >
        {canStart && (
          <MenuItem
            onClick={handleStart}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ListItemIcon>
              <PlayIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Start</ListItemText>
          </MenuItem>
        )}

        {canStop && (
          <MenuItem
            onClick={handleStop}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ListItemIcon>
              <StopIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Stop</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={handleViewLogs}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <ListItemIcon>
            <LogsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Logs</ListItemText>
        </MenuItem>

        {canDelete && (
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.light",
                color: "error.contrastText",
              },
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the service "{service.name}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
