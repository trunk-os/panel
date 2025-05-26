import { useState } from "react";
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

function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(name);
}

interface CreateDatasetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, quota?: number) => void;
  isLoading: boolean;
}

export default function CreateDatasetDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: CreateDatasetDialogProps) {
  const [name, setName] = useState("");
  const [quota, setQuota] = useState("");
  const [quotaUnit, setQuotaUnit] = useState("G");
  const [nameError, setNameError] = useState("");

  const validateName = (value: string) => {
    if (!value) {
      setNameError("");
      return;
    }

    if (!isValidName(value)) {
      setNameError("Name must contain only alphanumeric characters");
    } else {
      setNameError("");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleSubmit = () => {
    if (nameError || !name) return;

    if (quota) {
      const quotaInBytes = calculateSize(`${quota}${quotaUnit}B`);
      onSubmit(name, quotaInBytes);
    } else {
      onSubmit(name, undefined);
    }
  };

  const handleClose = () => {
    setName("");
    setQuota("");
    setQuotaUnit("G");
    setNameError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Dataset</DialogTitle>
      <DialogContent>
        <DialogContentText>Create a new dataset with optional quota.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Dataset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError || "Only alphanumeric characters allowed"}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            margin="dense"
            id="quota"
            label="Quota (optional)"
            type="number"
            variant="outlined"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            sx={{ flex: 2 }}
            helperText="Leave empty for no quota"
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !name || !!nameError}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}