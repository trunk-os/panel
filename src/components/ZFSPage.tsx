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
  IconButton,
  Tooltip,
} from "@mui/material";
import { api } from "@/api/client";
import type { ZFSEntry, ZFSModifyDataset, ZFSModifyVolume } from "@/api/types";
import CreateDatasetDialog from "@/components/dialogs/zfs/CreateDatasetDialog";
import CreateVolumeDialog from "@/components/dialogs/zfs/CreateVolumeDialog";
import ModifyDatasetDialog from "@/components/dialogs/zfs/ModifyDatasetDialog";
import ModifyVolumeDialog from "@/components/dialogs/zfs/ModifyVolumeDialog";
import DestroyConfirmationDialog from "@/components/dialogs/zfs/DestroyConfirmationDialog";

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export default function ZFSPage() {
  const [filter, setFilter] = useState("");
  const [allEntries, setAllEntries] = useState<ZFSEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [createDatasetOpen, setCreateDatasetOpen] = useState(false);
  const [createVolumeOpen, setCreateVolumeOpen] = useState(false);
  const [modifyDatasetOpen, setModifyDatasetOpen] = useState(false);
  const [modifyVolumeOpen, setModifyVolumeOpen] = useState(false);
  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ZFSEntry | null>(null);

  const fetchZFSEntries = async () => {
    const loading = allEntries === null;
    if (loading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const response = await api.zfs.list("");
      setAllEntries(response.data);
    } catch (_error) {
      setAllEntries([]);
    } finally {
      if (loading) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const refetch = () => {
    fetchZFSEntries();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the function isn't going to change.
  useEffect(() => {
    fetchZFSEntries();
  }, []);

  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [isCreatingVolume, setIsCreatingVolume] = useState(false);
  const [isModifyingDataset, setIsModifyingDataset] = useState(false);
  const [isModifyingVolume, setIsModifyingVolume] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const filteredEntries =
    allEntries?.filter((entry) => entry.name.toLowerCase().includes(filter.toLowerCase())) || [];

  const handleCreateDataset = async (name: string, quota?: number) => {
    setIsCreatingDataset(true);
    try {
      await api.zfs.createDataset({ name, quota });
      refetch();
      setCreateDatasetOpen(false);
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
    } finally {
      setIsCreatingVolume(false);
    }
  };

  const handleModifyDataset = async (request: ZFSModifyDataset) => {
    setIsModifyingDataset(true);
    try {
      await api.zfs.modifyDataset(request);
      refetch();
      setModifyDatasetOpen(false);
      setSelectedEntry(null);
    } finally {
      setIsModifyingDataset(false);
    }
  };

  const handleModifyVolume = async (request: ZFSModifyVolume) => {
    setIsModifyingVolume(true);
    try {
      await api.zfs.modifyVolume(request);
      refetch();
      setModifyVolumeOpen(false);
      setSelectedEntry(null);
    } finally {
      setIsModifyingVolume(false);
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
      } finally {
        setIsDestroying(false);
      }
    }
  };

  const openModifyDatasetDialog = (entry: ZFSEntry) => {
    setSelectedEntry(entry);
    setModifyDatasetOpen(true);
  };

  const openModifyVolumeDialog = (entry: ZFSEntry) => {
    setSelectedEntry(entry);
    setModifyVolumeOpen(true);
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
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label="Filter"
                variant="outlined"
                size="small"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Filter by name"
                sx={{ width: 300 }}
              />
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchZFSEntries} disabled={isRefreshing} size="small">
                  {isRefreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <span className="material-symbols-outlined">refresh</span>
                  )}
                </IconButton>
              </Tooltip>
            </Box>
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
                  ) : filteredEntries.filter((entry) => entry.kind === "Dataset").length > 0 ? (
                    filteredEntries
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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => openModifyDatasetDialog(entry)}
                                  title="Modify dataset"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => openDestroyDialog(entry)}
                                  title="Delete dataset"
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </IconButton>
                              </Box>
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
                  ) : filteredEntries.filter((entry) => entry.kind === "Volume").length > 0 ? (
                    filteredEntries
                      .filter((entry) => entry.kind === "Volume")
                      .map((entry) => (
                        <TableRow key={entry.full_name}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>{formatBytes(entry.size)}</TableCell>
                          <TableCell>{formatBytes(entry.used)}</TableCell>
                          <TableCell>{formatBytes(entry.avail)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => openModifyVolumeDialog(entry)}
                                title="Modify volume"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openDestroyDialog(entry)}
                                title="Delete volume"
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </IconButton>
                            </Box>
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

      <ModifyDatasetDialog
        open={modifyDatasetOpen}
        onClose={() => setModifyDatasetOpen(false)}
        onSubmit={handleModifyDataset}
        entry={selectedEntry}
        isLoading={isModifyingDataset}
      />

      <ModifyVolumeDialog
        open={modifyVolumeOpen}
        onClose={() => setModifyVolumeOpen(false)}
        onSubmit={handleModifyVolume}
        entry={selectedEntry}
        isLoading={isModifyingVolume}
      />

      <DestroyConfirmationDialog
        open={destroyDialogOpen}
        onClose={() => setDestroyDialogOpen(false)}
        onConfirm={handleConfirmDestroy}
        name={selectedEntry?.full_name || ""}
        isLoading={isDestroying}
      />
    </Box>
  );
}
