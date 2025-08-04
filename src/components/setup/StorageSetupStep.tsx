import { useState, useEffect, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { ZFSEntry } from "@/api/types";
import { useSetupStore, type SetupStorage } from "@/store/setupStore";
import { StorageConfigurationCard } from "./StorageConfigurationCard";

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

function CreateStorageDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  existingNames,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (storage: Omit<SetupStorage, "id">) => void;
  isLoading: boolean;
  existingNames: string[];
}) {
  const [name, setName] = useState("data");
  const [type, setType] = useState<"dataset" | "volume">("dataset");
  const [size, setSize] = useState("100");
  const [sizeUnit, setSizeUnit] = useState("G");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Storage name is required";
    } else if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
      newErrors.name = "Name must be 1-64 characters, alphanumeric, underscore, hyphen";
    } else if (existingNames.includes(name.toLowerCase())) {
      newErrors.name = "Storage name already exists";
    }

    if (!size || Number.parseFloat(size) <= 0) {
      newErrors.size = "Size must be greater than 0";
    }

    setErrors(newErrors);
  }, [name, size, existingNames]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Storage name is required";
    } else if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
      newErrors.name = "Name must be 1-64 characters, alphanumeric, underscore, hyphen";
    } else if (existingNames.includes(name.toLowerCase())) {
      newErrors.name = "Storage name already exists";
    }

    if (!size || Number.parseFloat(size) <= 0) {
      newErrors.size = "Size must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const sizeInBytes = calculateSize(`${size}${sizeUnit}B`);
    const newStorage: Omit<SetupStorage, "id"> = {
      name,
      type,
      size: sizeInBytes,
      options: type === "dataset" ? { quota: sizeInBytes } : {},
    };

    onSubmit(newStorage);
    handleClose();
  };

  const handleClose = () => {
    setName("data");
    setType("dataset");
    setSize("100");
    setSizeUnit("G");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Storage</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Create a new storage portion that will be added during setup.
        </DialogContentText>

        <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
          <TextField
            autoFocus
            label="Storage Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name || "1-64 characters, alphanumeric, underscore, hyphen"}
            required
          />

          <FormControl>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as "dataset" | "volume")}
            >
              <MenuItem value="dataset">Dataset (file storage with quota)</MenuItem>
              <MenuItem value="volume">Volume (fixed-size block storage)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              label={type === "dataset" ? "Quota" : "Size"}
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              error={!!errors.size}
              helperText={errors.size || "Recommended: 100GB to start"}
              sx={{ flex: 2 }}
              required
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Unit</InputLabel>
              <Select value={sizeUnit} label="Unit" onChange={(e) => setSizeUnit(e.target.value)}>
                <MenuItem value="G">GB</MenuItem>
                <MenuItem value="T">TB</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || Object.keys(errors).length > 0 || !name || !size}
        >
          {isLoading ? <CircularProgress size={24} /> : "Add Storage"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface BatchProgressDialogProps {
  open: boolean;
  progress: { current: number; total: number; currentItem: string };
  onClose: () => void;
}

function BatchProgressDialog({ open, progress, onClose }: BatchProgressDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>Creating Storage</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Creating storage {progress.current} of {progress.total}: {progress.currentItem}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(progress.current / progress.total) * 100}
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {Math.round((progress.current / progress.total) * 100)}% complete
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export function StorageSetupStep({ onNext, onBack }: StorageSetupStepProps) {
  const {
    pendingStorage,
    addPendingStorage,
    updatePendingStorage,
    removePendingStorage,
    setStorageValidation,
    getValidationSummary,
  } = useSetupStore();

  const [isLoading, setIsLoading] = useState(true);
  const [zfsList, setZfsList] = useState<ZFSEntry[] | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentItem: "" });
  const [error, setError] = useState<string | null>(null);

  const validationSummary = getValidationSummary();
  const existingZfsNames = (zfsList || []).map((entry) => entry.name.toLowerCase());
  const pendingNames = pendingStorage.map((s) => s.name.toLowerCase());
  const existingNames = [...existingZfsNames, ...pendingNames];

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

  const handleAddStorage = (storage: Omit<SetupStorage, "id">) => {
    addPendingStorage(storage);
  };

  const handleEditStorage = (storage: SetupStorage) => {
    updatePendingStorage(storage.id, storage);
  };

  const handleDeleteStorage = (storageId: string) => {
    removePendingStorage(storageId);
  };

  const handleStorageValidation = (storageId: string, isValid: boolean, errors: string[]) => {
    setStorageValidation(storageId, isValid ? [] : errors);
  };

  const validateStorageNames = (): string[] => {
    const errors: string[] = [];
    const pendingNames = new Set<string>();

    for (const storage of pendingStorage) {
      if (!storage.name) {
        errors.push("Storage item is missing a name");
        continue;
      }

      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(storage.name)) {
        errors.push(
          `Storage name "${storage.name}" is invalid (must be 1-64 characters, alphanumeric, underscore, hyphen)`
        );
        continue;
      }

      const lowerName = storage.name.toLowerCase();

      if (existingZfsNames.includes(lowerName)) {
        errors.push(`Storage name "${storage.name}" already exists in the system`);
        continue;
      }

      if (pendingNames.has(lowerName)) {
        errors.push(`Duplicate storage name "${storage.name}" in batch`);
        continue;
      }

      pendingNames.add(lowerName);
    }

    return errors;
  };

  const [storageCreated, setStorageCreated] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmitStorage = async () => {
    if (pendingStorage.length === 0) {
      setStorageCreated(true);
      return;
    }

    const validationErrors = validateStorageNames();
    if (validationErrors.length > 0) {
      setError(`Storage validation failed:\n${validationErrors.join("\n")}`);
      return;
    }

    setIsCreatingBatch(true);
    setError(null);

    try {
      for (let i = 0; i < pendingStorage.length; i++) {
        const storage = pendingStorage[i];
        setBatchProgress({
          current: i + 1,
          total: pendingStorage.length,
          currentItem: storage.name,
        });

        try {
          if (storage.type === "dataset") {
            await api.zfs.createDataset({
              name: storage.name,
              quota: storage.size,
            });
          } else {
            await api.zfs.createVolume({
              name: storage.name,
              size: storage.size || 0,
            });
          }
        } catch (storageError) {
          console.error(`Failed to create ${storage.type} ${storage.name}:`, storageError);
          if (storageError instanceof ApiError) {
            throw new Error(
              `Failed to create ${storage.type} ${storage.name}: ${storageError.message}`
            );
          }
          throw new Error(`Failed to create ${storage.type} ${storage.name}`);
        }
      }

      await fetchZFSEntries();
      setStorageCreated(true);
    } catch (batchError) {
      console.error("Batch storage creation failed:", batchError);
      setError(batchError instanceof Error ? batchError.message : "Failed to create storage");
    } finally {
      setIsCreatingBatch(false);
      setBatchProgress({ current: 0, total: 0, currentItem: "" });
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handleContinueHover = () => {
    if (hasPendingItems && createButtonRef.current) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 1000);
    }
  };

  const hasStorage = zfsList && zfsList.length > 0;
  const canSubmit = pendingStorage.length > 0 && !isCreatingBatch;
  const hasPendingItems = pendingStorage.length > 0 && !storageCreated;
  const canProceed = (hasStorage || storageCreated) && !hasPendingItems;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Storage Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your storage and create datasets or volumes for organizing your data. All storage
        will be created when you proceed to the next step.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {validationSummary.storageErrors > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {validationSummary.storageErrors} validation error(s) need to be fixed before proceeding.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading storage information...</Typography>
        </Box>
      ) : (
        <Box>
          {/* Existing Storage */}
          {hasStorage && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Existing Storage
                </Typography>
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
              </CardContent>
            </Card>
          )}

          {/* Pending Storage */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Pending Storage</Typography>
                <Chip
                  label={`${pendingStorage.length} item${pendingStorage.length !== 1 ? "s" : ""}`}
                  color={
                    validationSummary.storageErrors > 0
                      ? "error"
                      : pendingStorage.length > 0
                        ? "success"
                        : "default"
                  }
                  size="small"
                />
              </Box>

              {pendingStorage.length > 0 ? (
                <Box>
                  {pendingStorage.map((storage) => (
                    <StorageConfigurationCard
                      key={storage.id}
                      storage={storage}
                      onEdit={handleEditStorage}
                      onDelete={handleDeleteStorage}
                      onValidationChange={handleStorageValidation}
                    />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  No storage configured yet.{" "}
                  {!hasStorage && "Create storage portions to organize your data."}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Add Storage */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Storage
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create datasets (file storage with quotas) or volumes (fixed-size block storage) for
                organizing your data.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowCreateDialog(true)}
                startIcon={<span className="material-symbols-outlined">add</span>}
                disabled={isCreatingBatch}
              >
                Add Storage
              </Button>
            </CardContent>
          </Card>

          {/* Submit Storage */}
          {pendingStorage.length > 0 && !storageCreated && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Storage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Submit your storage configuration to create {pendingStorage.length} storage item
                  {pendingStorage.length !== 1 ? "s" : ""}.
                </Typography>
                <Button
                  ref={createButtonRef}
                  variant="contained"
                  onClick={handleSubmitStorage}
                  disabled={validationSummary.storageErrors > 0 || !canSubmit}
                  startIcon={<span className="material-symbols-outlined">storage</span>}
                  sx={{
                    animation: isFlashing ? "flash 0.5s ease-in-out 2" : "none",
                    "@keyframes flash": {
                      "0%, 100%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.05)" },
                    },
                  }}
                >
                  {isCreatingBatch ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Creating Storage...
                    </Box>
                  ) : (
                    `Create ${pendingStorage.length} Storage Item${pendingStorage.length !== 1 ? "s" : ""}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {storageCreated && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Storage has been created successfully. You can now proceed to the next step.
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            {onBack && (
              <Button onClick={onBack} disabled={isCreatingBatch}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              onMouseEnter={handleContinueHover}
              disabled={!canProceed || isCreatingBatch}
              sx={{ ml: "auto" }}
            >
              Next: User Management
            </Button>
          </Box>
        </Box>
      )}

      <CreateStorageDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleAddStorage}
        isLoading={false}
        existingNames={existingNames}
      />

      <BatchProgressDialog open={isCreatingBatch} progress={batchProgress} onClose={() => {}} />
    </Box>
  );
}
