import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import type { ZFSEntry, ZFSModifyDataset } from "@/api/types";

function calculateSize(size: string): number {
  if (!size) return 0;

  const match = size.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)B?$/i);
  if (!match) return Number.parseInt(size) || 0;

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case "T":
      return value * 1024 * 1024 * 1024 * 1024;
    case "G":
      return value * 1024 * 1024 * 1024;
    case "M":
      return value * 1024 * 1024;
    case "K":
      return value * 1024;
    default:
      return value;
  }
}

interface ModifyDatasetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: ZFSModifyDataset) => void;
  entry: ZFSEntry | null;
  isLoading: boolean;
}

export default function ModifyDatasetDialog({
  open,
  onClose,
  onSubmit,
  entry,
  isLoading,
}: ModifyDatasetDialogProps) {
  const [quota, setQuota] = useState("");
  const [quotaUnit, setQuotaUnit] = useState("G");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (entry) {
      setQuota("");
      setQuotaUnit("G");
      setNewName(entry.name);
    }
  }, [entry]);

  const handleSubmit = () => {
    if (!entry) return;

    const modifications: { name: string; quota?: number } = { name: newName || entry.name };

    if (quota) {
      const quotaInBytes = calculateSize(`${quota}${quotaUnit}B`);
      modifications.quota = quotaInBytes;
    }

    onSubmit({
      name: entry.name,
      modifications,
    });
  };

  const handleClose = () => {
    setQuota("");
    setQuotaUnit("G");
    setNewName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Modify Dataset: {entry?.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>Modify dataset properties.</DialogContentText>
        <TextField
          margin="dense"
          id="name"
          label="Dataset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mt: 2 }}>
          <TextField
            margin="dense"
            id="quota"
            label="Quota (optional)"
            type="number"
            variant="outlined"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            sx={{ flex: 2 }}
            helperText="Leave empty to keep current quota"
          />
          <FormControl sx={{ flex: 1, mt: 1 }}>
            <InputLabel id="quota-unit-label">Unit</InputLabel>
            <Select
              labelId="quota-unit-label"
              id="quota-unit"
              value={quotaUnit}
              label="Unit"
              onChange={(e) => setQuotaUnit(e.target.value)}
            >
              <MenuItem value="K">KB</MenuItem>
              <MenuItem value="M">MB</MenuItem>
              <MenuItem value="G">GB</MenuItem>
              <MenuItem value="T">TB</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Modify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
