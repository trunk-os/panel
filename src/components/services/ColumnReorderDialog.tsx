import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  DragHandle as DragHandleIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import type { ServiceColumn } from "./types";
import { COLUMN_LABELS, DEFAULT_COLUMN_ORDER } from "./types";

interface ColumnReorderDialogProps {
  open: boolean;
  onClose: () => void;
  visibleColumns: ServiceColumn[];
  columnOrder: ServiceColumn[];
  onColumnOrderChange: (newOrder: ServiceColumn[]) => void;
}

export function ColumnReorderDialog({
  open,
  onClose,
  visibleColumns,
  columnOrder,
  onColumnOrderChange,
}: ColumnReorderDialogProps) {
  const [localOrder, setLocalOrder] = useState(columnOrder);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...localOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setLocalOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === localOrder.length - 1) return;
    
    const newOrder = [...localOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setLocalOrder(newOrder);
  };

  const handleSave = () => {
    onColumnOrderChange(localOrder);
    onClose();
  };

  const handleCancel = () => {
    setLocalOrder(columnOrder);
    onClose();
  };

  const handleReset = () => {
    setLocalOrder(DEFAULT_COLUMN_ORDER);
  };

  const visibleOrderedColumns = localOrder.filter(col => visibleColumns.includes(col));

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DragHandleIcon />
          <Typography variant="h6">Reorder Columns</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Drag or use arrow buttons to reorder visible columns. The Actions column is always positioned at the far right.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block", fontSize: "0.7rem" }}>
          Your column order will be saved automatically.
        </Typography>
        
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {visibleOrderedColumns.map((column, index) => {
            const isActions = column === "actions";
            const isFirst = index === 0;
            const isLast = index === visibleOrderedColumns.length - 1;
            
            return (
              <ListItem
                key={column}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: isActions ? "action.selected" : "background.paper",
                  opacity: isActions ? 0.7 : 1,
                }}
                secondaryAction={
                  !isActions && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Move up">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveUp(index)}
                          disabled={isFirst}
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <ArrowUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDown(index)}
                          disabled={isLast}
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isActions ? (
                    <Tooltip title="Actions column is always positioned at the far right">
                      <LockIcon fontSize="small" color="action" />
                    </Tooltip>
                  ) : (
                    <DragHandleIcon fontSize="small" color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={COLUMN_LABELS[column]}
                  secondary={isActions ? "Always at far right" : `Position ${index + 1}`}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleReset}
          color="secondary"
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Reset to Default
        </Button>
        <Button
          onClick={handleCancel}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Save Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}