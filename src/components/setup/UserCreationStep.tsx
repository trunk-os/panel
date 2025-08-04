import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  LinearProgress,
  Chip,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { useSetupStore, type SetupUser } from "@/store/setupStore";
import { UserConfigurationCard } from "./UserConfigurationCard";

interface UserCreationStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function CreateUserDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  existingUsernames,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<SetupUser, "id">) => void;
  isLoading: boolean;
  existingUsernames: string[];
}) {
  const [username, setUsername] = useState("");
  const [realname, setRealname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (!isValidUsername(username)) {
      newErrors.username = "Username must be 3-32 characters, alphanumeric, underscore, hyphen";
    } else if (existingUsernames.includes(username.toLowerCase())) {
      newErrors.username = "Username already exists";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newUser: Omit<SetupUser, "id"> = {
      username,
      password,
      realname: realname || null,
      email: email || null,
      phone: phone || null,
      role: "user",
    };

    onSubmit(newUser);
    handleClose();
  };

  const handleClose = () => {
    setUsername("");
    setRealname("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Create a new user account that will be added during setup.
        </DialogContentText>

        <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
          <TextField
            autoFocus
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={validateForm}
            error={!!errors.username}
            helperText={errors.username || "3-32 characters, alphanumeric, underscore, hyphen"}
            required
          />

          <TextField
            label="Real Name"
            value={realname}
            onChange={(e) => setRealname(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validateForm}
            error={!!errors.password}
            helperText={errors.password || "At least 8 characters"}
            required
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validateForm}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateForm}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            isLoading ||
            Object.keys(errors).length > 0 ||
            !username ||
            !password ||
            !confirmPassword
          }
        >
          {isLoading ? <CircularProgress size={24} /> : "Add User"}
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
      <DialogTitle>Creating Users</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Creating user {progress.current} of {progress.total}: {progress.currentItem}
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

export function UserCreationStep({ onNext, onBack, isLastStep }: UserCreationStepProps) {
  const {
    pendingUsers,
    addPendingUser,
    updatePendingUser,
    removePendingUser,
    setUserValidation,
    getValidationSummary,
  } = useSetupStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentItem: "" });
  const [error, setError] = useState<string | null>(null);
  const [, setCreatedUsers] = useState<string[]>([]);

  const validationSummary = getValidationSummary();
  const existingUsernames = pendingUsers.map((u) => u.username.toLowerCase());

  const handleAddUser = (user: Omit<SetupUser, "id">) => {
    addPendingUser(user);
  };

  const handleEditUser = (user: SetupUser) => {
    updatePendingUser(user.id, user);
  };

  const handleDeleteUser = (userId: string) => {
    removePendingUser(userId);
  };

  const handleUserValidation = (userId: string, isValid: boolean, errors: string[]) => {
    setUserValidation(userId, isValid ? [] : errors);
  };

  const [usersCreated, setUsersCreated] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmitUsers = async () => {
    if (pendingUsers.length === 0) {
      setUsersCreated(true);
      return;
    }

    setIsCreatingBatch(true);
    setError(null);
    const results: string[] = [];

    try {
      for (let i = 0; i < pendingUsers.length; i++) {
        const user = pendingUsers[i];
        setBatchProgress({
          current: i + 1,
          total: pendingUsers.length,
          currentItem: user.username,
        });

        try {
          await api.users.create({
            username: user.username,
            password: user.password,
            realname: user.realname,
            email: user.email,
            phone: user.phone,
          });
          results.push(user.username);
        } catch (userError) {
          console.error(`Failed to create user ${user.username}:`, userError);
          if (userError instanceof ApiError) {
            throw new Error(`Failed to create user ${user.username}: ${userError.message}`);
          }
          throw new Error(`Failed to create user ${user.username}`);
        }
      }

      setCreatedUsers(results);
      setUsersCreated(true);
    } catch (batchError) {
      console.error("Batch user creation failed:", batchError);
      setError(batchError instanceof Error ? batchError.message : "Failed to create users");
    } finally {
      setIsCreatingBatch(false);
      setBatchProgress({ current: 0, total: 0, currentItem: "" });
    }
  };

  const handleNext = () => {
    onNext();
  };

  const hasPendingItems = pendingUsers.length > 0 && !usersCreated;

  const handleContinueHover = () => {
    if (hasPendingItems && createButtonRef.current) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 1000);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create user accounts for your team members. All users will be created when you proceed to
        the next step.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {validationSummary.userErrors > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {validationSummary.userErrors} validation error(s) need to be fixed before proceeding.
        </Alert>
      )}

      {/* Users List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">Pending Users</Typography>
            <Chip
              label={`${pendingUsers.length} user${pendingUsers.length !== 1 ? "s" : ""}`}
              color={
                validationSummary.userErrors > 0
                  ? "error"
                  : pendingUsers.length > 0
                    ? "success"
                    : "default"
              }
              size="small"
            />
          </Box>

          {pendingUsers.length > 0 ? (
            <Box>
              {pendingUsers.map((user) => (
                <UserConfigurationCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onValidationChange={handleUserValidation}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No users configured yet. You can add team members now or later from the User
              Management page.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add User Button */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create user accounts for team members to give them access to the system.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowCreateDialog(true)}
            startIcon={<span className="material-symbols-outlined">person_add</span>}
            disabled={isCreatingBatch || usersCreated}
          >
            Add User
          </Button>
        </CardContent>
      </Card>

      {/* Submit Users */}
      {pendingUsers.length > 0 && !usersCreated && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Users
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Submit your user configuration to create {pendingUsers.length} user account
              {pendingUsers.length !== 1 ? "s" : ""}.
            </Typography>
            <Button
              ref={createButtonRef}
              variant="contained"
              onClick={handleSubmitUsers}
              disabled={validationSummary.userErrors > 0 || isCreatingBatch}
              startIcon={<span className="material-symbols-outlined">group_add</span>}
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
                  Creating Users...
                </Box>
              ) : (
                `Create ${pendingUsers.length} User${pendingUsers.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {usersCreated && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {pendingUsers.length > 0
            ? `${pendingUsers.length} user${pendingUsers.length !== 1 ? "s" : ""} created successfully.`
            : "User creation step completed."}{" "}
          You can now proceed to the next step.
        </Alert>
      )}

      {/* Navigation */}
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
          disabled={isCreatingBatch || hasPendingItems}
          sx={{ ml: "auto" }}
        >
          {isLastStep ? "Complete Setup" : "Next: Summary"}
        </Button>
      </Box>

      <CreateUserDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleAddUser}
        isLoading={false}
        existingUsernames={existingUsernames}
      />

      <BatchProgressDialog open={isCreatingBatch} progress={batchProgress} onClose={() => {}} />
    </Box>
  );
}
