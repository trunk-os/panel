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
import type { ZFSEntry, ZFSModifyVolume } from "@/api/types";

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

interface ModifyVolumeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: ZFSModifyVolume) => void;
  entry: ZFSEntry | null;
  isLoading: boolean;
}

export default function ModifyVolumeDialog({
  open,
  onClose,
  onSubmit,
  entry,
  isLoading,
}: ModifyVolumeDialogProps) {
  const [size, setSize] = useState(0);
  const [sizeUnit, setSizeUnit] = useState("G");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (entry) {
      const sizeInGB = entry.size / (1024 * 1024 * 1024);
      setSize(Math.round(sizeInGB * 100) / 100);
      setSizeUnit("G");
      setNewName(entry.name);
    }
  }, [entry]);

  const handleSubmit = () => {
    if (!entry || !size) return;

    const sizeInBytes = calculateSize(`${size}${sizeUnit}B`);
    onSubmit({
      name: entry.name,
      modifications: {
        name: newName || entry.name,
        size: sizeInBytes,
      },
    });
  };

  const handleClose = () => {
    setSize(0);
    setSizeUnit("G");
    setNewName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Modify Volume: {entry?.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>Modify volume properties.</DialogContentText>
        <TextField
          margin="dense"
          id="name"
          label="Volume Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
          <TextField
            margin="dense"
            id="size"
            label="Size"
            type="number"
            variant="outlined"
            value={size}
            onChange={(e) => setSize(Number.parseFloat(e.target.value) || 0)}
            sx={{ flex: 2 }}
          />
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="size-unit-label">Unit</InputLabel>
            <Select
              labelId="size-unit-label"
              id="size-unit"
              value={sizeUnit}
              label="Unit"
              onChange={(e) => setSizeUnit(e.target.value)}
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
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading || !size}>
          {isLoading ? <CircularProgress size={24} /> : "Modify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}