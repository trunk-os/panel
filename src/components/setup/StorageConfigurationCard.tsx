import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SetupStorage } from "@/store/setupStore";

interface StorageConfigurationCardProps {
  storage: SetupStorage;
  onEdit: (storage: SetupStorage) => void;
  onDelete: (storageId: string) => void;
  onValidationChange: (storageId: string, isValid: boolean, errors: string[]) => void;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

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

function isValidStorageName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name);
}

export function StorageConfigurationCard({
  storage,
  onEdit,
  onDelete,
  onValidationChange,
}: StorageConfigurationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(storage.name);
  const [editType, setEditType] = useState(storage.type);
  const [editSize, setEditSize] = useState(storage.size ? formatBytes(storage.size) : "100 GB");
  const [editSizeValue, setEditSizeValue] = useState("100");
  const [editSizeUnit, setEditSizeUnit] = useState("G");
  const [errors, setErrors] = useState<string[]>([]);

  const validateStorage = () => {
    const newErrors: string[] = [];

    if (!editName) {
      newErrors.push("Storage name is required");
    } else if (!isValidStorageName(editName)) {
      newErrors.push("Storage name must be 1-64 characters, alphanumeric, underscore, hyphen");
    }

    if (!editSizeValue || Number.parseFloat(editSizeValue) <= 0) {
      newErrors.push("Size must be greater than 0");
    }

    setErrors(newErrors);
    onValidationChange(storage.id, newErrors.length === 0, newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validateStorage()) {
      return;
    }

    const sizeInBytes = calculateSize(`${editSizeValue}${editSizeUnit}B`);
    const updatedStorage: SetupStorage = {
      ...storage,
      name: editName,
      type: editType,
      size: sizeInBytes,
      options: editType === "dataset" ? { quota: sizeInBytes } : {},
    };

    onEdit(updatedStorage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(storage.name);
    setEditType(storage.type);
    const currentSize = storage.size ? formatBytes(storage.size) : "100 GB";
    setEditSize(currentSize);
    setEditSizeValue("100");
    setEditSizeUnit("G");
    setErrors([]);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditName(storage.name);
    setEditType(storage.type);
    if (storage.size) {
      const sizeStr = formatBytes(storage.size);
      const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/);
      if (match) {
        setEditSizeValue(match[1]);
        setEditSizeUnit(match[2].charAt(0));
      }
    }
    setIsEditing(true);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {isEditing ? (
          <Box>
            <Box sx={{ display: "grid", gap: 2, mb: 2 }}>
              <TextField
                label="Storage Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={validateStorage}
                error={errors.some((e) => e.includes("name"))}
                helperText="1-64 characters, alphanumeric, underscore, hyphen"
                size="small"
              />

              <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={editType}
                  label="Type"
                  onChange={(e) => setEditType(e.target.value as "dataset" | "volume")}
                >
                  <MenuItem value="dataset">Dataset (file storage with quota)</MenuItem>
                  <MenuItem value="volume">Volume (fixed-size block storage)</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                  label={editType === "dataset" ? "Quota" : "Size"}
                  type="number"
                  value={editSizeValue}
                  onChange={(e) => setEditSizeValue(e.target.value)}
                  onBlur={validateStorage}
                  error={errors.some((e) => e.includes("Size"))}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={editSizeUnit}
                    label="Unit"
                    onChange={(e) => setEditSizeUnit(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="G">GB</MenuItem>
                    <MenuItem value="T">TB</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button size="small" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSave}
                disabled={errors.length > 0}
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="h6">{storage.name}</Typography>
                  <Chip
                    label={storage.type}
                    color={storage.type === "dataset" ? "primary" : "secondary"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {storage.type === "dataset" ? "Quota" : "Size"}:{" "}
                  {storage.size ? formatBytes(storage.size) : "Not set"}
                </Typography>
                {storage.mountPoint && (
                  <Typography variant="body2" color="text.secondary">
                    Mount: {storage.mountPoint}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" onClick={handleStartEdit}>
                  <span className="material-symbols-outlined">edit</span>
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(storage.id)} color="error">
                  <span className="material-symbols-outlined">delete</span>
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
