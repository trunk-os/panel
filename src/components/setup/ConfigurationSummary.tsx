import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useSetupStore } from "@/store/setupStore";

interface ConfigurationSummaryProps {
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

export function ConfigurationSummary({ onNext, onBack }: ConfigurationSummaryProps) {
  const {
    pendingUsers,
    pendingStorage,
    getValidationSummary,
    clearPendingUsers,
    clearPendingStorage,
  } = useSetupStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const validationSummary = getValidationSummary();
  const hasErrors = validationSummary.userErrors > 0 || validationSummary.storageErrors > 0;
  const hasConfiguration = pendingUsers.length > 0 || pendingStorage.length > 0;

  const handleCompleteSetup = async () => {
    setIsCompleting(true);
    try {
      // Clear the pending configurations since they've been processed
      clearPendingUsers();
      clearPendingStorage();

      // Complete the setup
      onNext();
    } finally {
      setIsCompleting(false);
      setShowConfirmDialog(false);
    }
  };

  const getTotalStorageSize = () => {
    return pendingStorage.reduce((total, storage) => {
      return total + (storage.size || 0);
    }, 0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configuration Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your configuration before completing the setup. All users and storage have been
        created successfully.
      </Typography>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          There are validation errors that need to be resolved before completing setup.
        </Alert>
      )}

      {!hasConfiguration && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No users or storage were configured during setup. You can create them later from the
          management pages.
        </Alert>
      )}

      {/* Users Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">Users Created</Typography>
            <Chip
              label={`${pendingUsers.length} user${pendingUsers.length !== 1 ? "s" : ""}`}
              color={pendingUsers.length > 0 ? "success" : "default"}
              size="small"
            />
          </Box>

          {pendingUsers.length > 0 ? (
            <List dense>
              {pendingUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">person</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={user.username}
                    secondary={
                      <Box>
                        {user.realname && <span>{user.realname}</span>}
                        {user.email && (
                          <span>
                            {user.realname && " • "}
                            {user.email}
                          </span>
                        )}
                        {user.phone && (
                          <span>
                            {(user.realname || user.email) && " • "}
                            {user.phone}
                          </span>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    label={user.role || "user"}
                    color={user.role === "admin" ? "primary" : "default"}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" variant="outlined">
              No users were created during setup.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Storage Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">Storage Created</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={`${pendingStorage.length} item${pendingStorage.length !== 1 ? "s" : ""}`}
                color={pendingStorage.length > 0 ? "success" : "default"}
                size="small"
              />
              {pendingStorage.length > 0 && (
                <Chip
                  label={`Total: ${formatBytes(getTotalStorageSize())}`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {pendingStorage.length > 0 ? (
            <List dense>
              {pendingStorage.map((storage) => (
                <ListItem key={storage.id}>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">
                      {storage.type === "dataset" ? "folder" : "storage"}
                    </span>
                  </ListItemIcon>
                  <ListItemText
                    primary={storage.name}
                    secondary={
                      <Box>
                        <span>{storage.type === "dataset" ? "Dataset" : "Volume"}</span>
                        {storage.size && (
                          <span>
                            {" • "}
                            {storage.type === "dataset" ? "Quota" : "Size"}:{" "}
                            {formatBytes(storage.size)}
                          </span>
                        )}
                        {storage.mountPoint && (
                          <span>
                            {" • "}
                            Mount: {storage.mountPoint}
                          </span>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    label={storage.type}
                    color={storage.type === "dataset" ? "primary" : "secondary"}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" variant="outlined">
              No storage was created during setup.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            What's Next?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            After completing setup, you'll be able to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <span className="material-symbols-outlined">dashboard</span>
              </ListItemIcon>
              <ListItemText primary="Access the dashboard to monitor your system" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span className="material-symbols-outlined">group</span>
              </ListItemIcon>
              <ListItemText primary="Manage users and permissions" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span className="material-symbols-outlined">storage</span>
              </ListItemIcon>
              <ListItemText primary="Configure additional storage and datasets" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <span className="material-symbols-outlined">settings</span>
              </ListItemIcon>
              <ListItemText primary="Customize system settings and preferences" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        {onBack && (
          <Button onClick={onBack} disabled={isCompleting}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => setShowConfirmDialog(true)}
          disabled={hasErrors || isCompleting}
          sx={{ ml: "auto" }}
        >
          {isCompleting ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Completing Setup...
            </Box>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Setup?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you ready to complete the setup? This will finish the initial configuration and take
            you to the dashboard.
          </DialogContentText>

          {hasConfiguration && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Configuration Summary:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {pendingUsers.length} user{pendingUsers.length !== 1 ? "s" : ""} created
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {pendingStorage.length} storage item{pendingStorage.length !== 1 ? "s" : ""}{" "}
                created
                {pendingStorage.length > 0 && ` (${formatBytes(getTotalStorageSize())} total)`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} disabled={isCompleting}>
            Cancel
          </Button>
          <Button onClick={handleCompleteSetup} variant="contained" disabled={isCompleting}>
            {isCompleting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Completing...
              </Box>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
