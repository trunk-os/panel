import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { ZFSEntry, ZFSList } from "@/api/types";

// Convert size string to kb
function calculateSize(size: string): number {
  if (!size) return 0;

  const match = size.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)B?$/i);
  if (!match) return Number.parseInt(size) || 0;

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case "T":
      return value * 1024 * 1024 * 1024; // TB to KB
    case "G":
      return value * 1024 * 1024; // GB to KB
    case "M":
      return value * 1024; // MB to KB
    case "K":
      return value; // KB to KB
    default:
      return value / 1024; // Bytes to KB
  }
}

// Input validation functions
function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(name);
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function CreateDatasetDialog({
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
      const quotaInKB = calculateSize(`${quota}${quotaUnit}B`);
      onSubmit(name, quotaInKB);
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

function CreateVolumeDialog({
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

    const sizeInKB = calculateSize(`${size}${sizeUnit}B`);
    onSubmit(name, sizeInKB);
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

function DestroyConfirmationDialog({
  open,
  onClose,
  onConfirm,
  name,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Destruction</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to destroy the dataset/volume <strong>{name}</strong>? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Destroy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ZFSPage() {
  const [filter, setFilter] = useState("");
  const [filterTimeout, setFilterTimeout] = useState<number | null>(null);

  const [currentFilter, setCurrentFilter] = useState("");
  const [zfsList, setZfsList] = useState<ZFSList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const [createDatasetOpen, setCreateDatasetOpen] = useState(false);
  const [createVolumeOpen, setCreateVolumeOpen] = useState(false);
  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ZFSEntry | null>(null);

  const fetchZFSEntries = async () => {
    setIsLoading(true);
    try {
      const response = await api.zfs.list(currentFilter);
      if (Array.isArray(response.data)) {
        setZfsList({ entries: response.data });
      } else {
        setZfsList(response.data);
      }
    } catch (error) {
      handleApiError(error);
      setZfsList({ entries: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchZFSEntries();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the function isn't going to change.
  useEffect(() => {
    fetchZFSEntries();
  }, [currentFilter]);

  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [isCreatingVolume, setIsCreatingVolume] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);

  const handleApiError = (error: unknown) => {
    console.error("API Error:", error);

    let message = "An unknown error occurred";

    if (error instanceof ApiError) {
      message = error.message || `Error ${error.statusCode}`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    setErrorMessage(message);
    setShowError(true);
  };

  // Handle filter change with debounce
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);

    if (filterTimeout) {
      window.clearTimeout(filterTimeout);
    }

    const timeout = window.setTimeout(() => {
      setCurrentFilter(newFilter);
    }, 500);

    setFilterTimeout(timeout);
  };

  const handleCreateDataset = async (name: string, quota?: number) => {
    setIsCreatingDataset(true);
    try {
      await api.zfs.createDataset({ name, quota });
      refetch();
      setCreateDatasetOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCreatingDataset(false);
    }
  };

  const handleCreateVolume = async (name: string, size: number) => {
    setIsCreatingVolume(true);
    try {
      await api.zfs.createVolume({ name, size });
      refetch();
      setCreateVolumeOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsCreatingVolume(false);
    }
  };

  const handleConfirmDestroy = async () => {
    if (selectedEntry) {
      setIsDestroying(true);
      try {
        await api.zfs.destroy(selectedEntry.name);
        refetch();
        setDestroyDialogOpen(false);
        setSelectedEntry(null);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsDestroying(false);
      }
    }
  };

  const openDestroyDialog = (entry: ZFSEntry) => {
    setSelectedEntry(entry);
    setDestroyDialogOpen(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h2">Disk Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage datasets and volumes
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <TextField
              label="Filter"
              variant="outlined"
              size="small"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Filter by name"
              sx={{ width: 300 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" onClick={() => setCreateDatasetOpen(true)}>
                Create Dataset
              </Button>
              <Button variant="outlined" onClick={() => setCreateVolumeOpen(true)}>
                Create Volume
              </Button>
            </Box>
          </Box>

          {/* Datasets Table */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Datasets
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Used</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : zfsList?.entries &&
                    zfsList.entries.filter((entry) => entry.kind === "Dataset").length > 0 ? (
                    zfsList.entries
                      .filter((entry) => entry.kind === "Dataset")
                      .map((entry) => {
                        // For datasets: use size (will be quota when available) vs available, whichever is smaller
                        const effectiveSize = Math.min(entry.size, entry.avail + entry.used);
                        return (
                          <TableRow key={entry.full_name}>
                            <TableCell>{entry.name}</TableCell>
                            <TableCell>{formatBytes(effectiveSize)}</TableCell>
                            <TableCell>{formatBytes(entry.used)}</TableCell>
                            <TableCell>{formatBytes(entry.avail)}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDestroyDialog(entry)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No datasets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Volumes Table */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Volumes
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Used</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : zfsList?.entries &&
                    zfsList.entries.filter((entry) => entry.kind === "Volume").length > 0 ? (
                    zfsList.entries
                      .filter((entry) => entry.kind === "Volume")
                      .map((entry) => (
                        <TableRow key={entry.full_name}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>{formatBytes(entry.size)}</TableCell>
                          <TableCell>{formatBytes(entry.used)}</TableCell>
                          <TableCell>{formatBytes(entry.avail)}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDestroyDialog(entry)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No volumes found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateDatasetDialog
        open={createDatasetOpen}
        onClose={() => setCreateDatasetOpen(false)}
        onSubmit={handleCreateDataset}
        isLoading={isCreatingDataset}
      />

      <CreateVolumeDialog
        open={createVolumeOpen}
        onClose={() => setCreateVolumeOpen(false)}
        onSubmit={handleCreateVolume}
        isLoading={isCreatingVolume}
      />

      <DestroyConfirmationDialog
        open={destroyDialogOpen}
        onClose={() => setDestroyDialogOpen(false)}
        onConfirm={handleConfirmDestroy}
        name={selectedEntry?.full_name || ""}
        isLoading={isDestroying}
      />

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
