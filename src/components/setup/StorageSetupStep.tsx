import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { ZFSEntry } from "@/api/types";

interface StorageSetupStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
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
      return value * 1024 * 1024 * 1024 * 1024; // TB to bytes
    case "G":
      return value * 1024 * 1024 * 1024; // GB to bytes
    case "M":
      return value * 1024 * 1024; // MB to bytes
    case "K":
      return value * 1024; // KB to bytes
    default:
      return value; // bytes to bytes
  }
}

function CreateInitialDatasetDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, quota?: number) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("data");
  const [quota, setQuota] = useState("100");
  const [quotaUnit, setQuotaUnit] = useState("G");

  const handleSubmit = () => {
    const quotaInBytes = calculateSize(`${quota}${quotaUnit}B`);
    onSubmit(name, quotaInBytes);
  };

  const handleClose = () => {
    setName("data");
    setQuota("100");
    setQuotaUnit("G");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Initial Dataset</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Create an initial dataset for storing your data with a quota to manage disk usage.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Dataset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            margin="dense"
            id="quota"
            label="Quota"
            type="number"
            variant="outlined"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            sx={{ flex: 2 }}
            helperText="Recommended: 100GB to start"
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
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading || !name}>
          Create Dataset
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateInitialVolumeDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, size: number) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("storage");
  const [size, setSize] = useState("50");
  const [sizeUnit, setSizeUnit] = useState("G");

  const handleSubmit = () => {
    const sizeInBytes = calculateSize(`${size}${sizeUnit}B`);
    onSubmit(name, sizeInBytes);
  };

  const handleClose = () => {
    setName("storage");
    setSize("50");
    setSizeUnit("G");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create Initial Volume</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Create an initial volume for block storage. Volumes are fixed-size and provide raw block storage.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="volume-name"
          label="Volume Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            margin="dense"
            id="volume-size"
            label="Size"
            type="number"
            variant="outlined"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            sx={{ flex: 2 }}
            helperText="Recommended: 50GB to start"
          />
          <FormControl sx={{ flex: 1, mt: 1 }}>
            <InputLabel id="size-unit-label">Unit</InputLabel>
            <Select
              labelId="size-unit-label"
              id="size-unit"
              value={sizeUnit}
              label="Unit"
              onChange={(e) => setSizeUnit(e.target.value)}
            >
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
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading || !name}>
          Create Volume
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function StorageSetupStep({ onNext, onBack }: StorageSetupStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zfsList, setZfsList] = useState<ZFSEntry[] | null>(null);
  const [hasCreatedStorage, setHasCreatedStorage] = useState(false);
  const [showCreateDatasetDialog, setShowCreateDatasetDialog] = useState(false);
  const [showCreateVolumeDialog, setShowCreateVolumeDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZFSEntries = async () => {
    setIsLoading(true);
    try {
      const response = await api.zfs.list("");
      setZfsList(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch storage entries:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to load storage information");
      }
      setZfsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchZFSEntries is defined in the component and doesn't change
  useEffect(() => {
    fetchZFSEntries();
  }, []);

  const handleCreateDataset = async (name: string, quota?: number) => {
    setIsCreating(true);
    try {
      await api.zfs.createDataset({ name, quota });
      setHasCreatedStorage(true);
      setShowCreateDatasetDialog(false);
      await fetchZFSEntries();
    } catch (error) {
      console.error("Failed to create dataset:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create dataset");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const hasStorage = zfsList && zfsList.length > 0;
  const canProceed = hasStorage || hasCreatedStorage;

  const handleCreateVolume = async (name: string, size: number) => {
    setIsCreating(true);
    try {
      await api.zfs.createVolume({ name, size });
      setHasCreatedStorage(true);
      setShowCreateVolumeDialog(false);
      await fetchZFSEntries();
    } catch (error) {
      console.error("Failed to create volume:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create volume");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Storage Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your storage and create initial datasets or volumes for organizing your data.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading storage information...</Typography>
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Datasets and Volumes
              </Typography>
              {hasStorage ? (
                <List>
                  {zfsList.map((entry) => (
                    <ListItem key={entry.full_name}>
                      <ListItemIcon>
                        <span className="material-symbols-outlined">
                          {entry.kind === "Dataset" ? "folder" : "storage"}
                        </span>
                      </ListItemIcon>
                      <ListItemText
                        primary={entry.name}
                        secondary={`Size: ${formatBytes(entry.size)} • Used: ${formatBytes(entry.used)} • Available: ${formatBytes(entry.avail)}`}
                      />
                      <Chip
                        label={entry.kind}
                        color={entry.kind === "Dataset" ? "primary" : "secondary"}
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No datasets or volumes found. Create initial storage to organize your data.
                </Alert>
              )}
            </CardContent>
          </Card>

          {!hasStorage && !hasCreatedStorage && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Initial Storage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choose between datasets (file storage with quotas) or volumes (fixed-size block storage).
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setShowCreateDatasetDialog(true)}
                    startIcon={<span className="material-symbols-outlined">folder</span>}
                  >
                    Create Dataset
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowCreateVolumeDialog(true)}
                    startIcon={<span className="material-symbols-outlined">storage</span>}
                  >
                    Create Volume
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {hasCreatedStorage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Storage created successfully! Your storage is ready for use.
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {onBack && <Button onClick={onBack}>Back</Button>}
            <Button variant="contained" onClick={onNext} disabled={!canProceed} sx={{ ml: "auto" }}>
              Next: User Management
            </Button>
          </Box>
        </Box>
      )}

      <CreateInitialDatasetDialog
        open={showCreateDatasetDialog}
        onClose={() => setShowCreateDatasetDialog(false)}
        onSubmit={handleCreateDataset}
        isLoading={isCreating}
      />
      
      <CreateInitialVolumeDialog
        open={showCreateVolumeDialog}
        onClose={() => setShowCreateVolumeDialog(false)}
        onSubmit={handleCreateVolume}
        isLoading={isCreating}
      />
    </Box>
  );
}
