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

interface CreateVolumeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, size: number) => void;
  isLoading: boolean;
}

export default function CreateVolumeDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: CreateVolumeDialogProps) {
  const [name, setName] = useState("");
  const [size, setSize] = useState(0);
  const [sizeUnit, setSizeUnit] = useState("G");
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
    if (nameError || !name || !size) return;

    const sizeInBytes = calculateSize(`${size}${sizeUnit}B`);
    onSubmit(name, sizeInBytes);
  };

  const handleClose = () => {
    setName("");
    setSize(0);
    setSizeUnit("G");
    setNameError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Volume</DialogTitle>
      <DialogContent>
        <DialogContentText>Create a new volume with specified size.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Volume Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError || "Only alphanumeric characters allowed"}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !name || !size || !!nameError}
        >
          {isLoading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
