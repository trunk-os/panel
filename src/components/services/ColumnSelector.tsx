import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Typography,
  Divider,
  Box,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ViewColumn as ViewColumnIcon, Reorder as ReorderIcon } from "@mui/icons-material";
import type { ServiceColumn } from "./types";
import { ALL_AVAILABLE_COLUMNS, COLUMN_LABELS } from "./types";
import { ColumnReorderDialog } from "./ColumnReorderDialog";
import { useServicesTableConfig } from "@/hooks/useServicesTableConfig";

interface ColumnSelectorProps {
  visibleColumns: ServiceColumn[];
  columnOrder: ServiceColumn[];
  onColumnsChange: (columns: ServiceColumn[]) => void;
  onColumnOrderChange: (order: ServiceColumn[]) => void;
}

export function ColumnSelector({
  visibleColumns,
  columnOrder,
  onColumnsChange,
  onColumnOrderChange,
}: ColumnSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const { resetToDefaults } = useServicesTableConfig();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColumnToggle = (column: ServiceColumn) => {
    const newColumns = visibleColumns.includes(column)
      ? visibleColumns.filter((col) => col !== column)
      : [...visibleColumns, column];

    onColumnsChange(newColumns);
  };

  const handleReset = () => {
    resetToDefaults();
    handleClose();
  };

  const handleReorderClick = () => {
    setReorderDialogOpen(true);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Configure table columns">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
          aria-label="Configure table columns"
        >
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 220 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Table Columns
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            Configuration saved automatically
          </Typography>
        </Box>
        <Divider />

        {ALL_AVAILABLE_COLUMNS.map((column) => (
          <MenuItem
            key={column}
            onClick={() => handleColumnToggle(column)}
            dense
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={visibleColumns.includes(column)}
                  size="small"
                  sx={{
                    "&.Mui-checked": {
                      color: "primary.main",
                    },
                  }}
                />
              }
              label={COLUMN_LABELS[column]}
              sx={{ margin: 0, width: "100%" }}
            />
          </MenuItem>
        ))}

        <Divider />
        <MenuItem
          onClick={handleReorderClick}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <ListItemIcon>
            <ReorderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">Reorder columns</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleReset}
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
              color: "primary.main",
            },
          }}
        >
          <Typography variant="body2">Reset to default</Typography>
        </MenuItem>
      </Menu>

      <ColumnReorderDialog
        open={reorderDialogOpen}
        onClose={() => setReorderDialogOpen(false)}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
      />
    </>
  );
}
