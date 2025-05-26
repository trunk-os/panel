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
import type { ZFSEntry, ZFSList } from "@/api/types";

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

export function StorageSetupStep({ onNext, onBack }: StorageSetupStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zfsList, setZfsList] = useState<ZFSList | null>(null);
  const [hasCreatedDataset, setHasCreatedDataset] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZFSEntries = async () => {
    setIsLoading(true);
    try {
      const response = await api.zfs.list("");
      if (Array.isArray(response.data)) {
        setZfsList({ entries: response.data });
      } else {
        setZfsList(response.data);
      }
      setError(null);
    } catch (error) {
      console.error("Failed to fetch storage entries:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to load storage information");
      }
      setZfsList({ entries: [] });
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
      setHasCreatedDataset(true);
      setShowCreateDialog(false);
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

  const hasDatasets = zfsList?.entries && zfsList.entries.length > 0;
  const canProceed = hasDatasets || hasCreatedDataset;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Storage Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your storage and create initial datasets for organizing your data.
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
              {hasDatasets ? (
                <List>
                  {zfsList.entries.map((entry) => (
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
                  No datasets found. Create an initial dataset to organize your storage.
                </Alert>
              )}
            </CardContent>
          </Card>

          {!hasDatasets && !hasCreatedDataset && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Initial Dataset
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Datasets help organize your storage with quotas and permissions. We recommend
                  creating a "data" dataset to get started.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowCreateDialog(true)}
                  startIcon={<span className="material-symbols-outlined">add</span>}
                >
                  Create Dataset
                </Button>
              </CardContent>
            </Card>
          )}

          {hasCreatedDataset && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Dataset created successfully! Your storage is ready for use.
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
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateDataset}
        isLoading={isCreating}
      />
    </Box>
  );
}
