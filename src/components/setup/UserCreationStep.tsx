import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { UserCreateRequest } from "@/api/types";

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

function CreateAdditionalUserDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: UserCreateRequest) => void;
  isLoading: boolean;
}) {
  const [username, setUsername] = useState("");
  const [realname, setRealname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError("Username is required");
      return;
    }

    if (!isValidUsername(value)) {
      setUsernameError(
        "Username must be 3-32 characters and contain only letters, numbers, underscores, or hyphens"
      );
    } else {
      setUsernameError("");
    }
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }

    if (!isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return;
    }

    if (!isValidPassword(value)) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const validatePasswordMatch = (pass: string, confirm: string) => {
    if (!confirm) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (pass !== confirm) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      validatePasswordMatch(value, confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validatePasswordMatch(password, value);
  };

  const handleSubmit = () => {
    validateUsername(username);
    validatePassword(password);
    validatePasswordMatch(password, confirmPassword);
    if (email) validateEmail(email);

    if (
      usernameError ||
      passwordError ||
      confirmPasswordError ||
      emailError ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      return;
    }

    const newUser: UserCreateRequest = {
      username,
      password,
      realname: realname || null,
      email: email || null,
      phone: phone || null,
    };

    onSubmit(newUser);
  };

  const handleClose = () => {
    setUsername("");
    setRealname("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Additional User</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Create an additional user account for your team.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={username}
          onChange={handleUsernameChange}
          error={!!usernameError}
          helperText={usernameError || "3-32 characters, alphanumeric, underscore, hyphen"}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={handlePasswordChange}
          error={!!passwordError}
          helperText={passwordError || "At least 8 characters"}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          margin="dense"
          id="confirm-password"
          label="Confirm Password"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError || "Re-enter your password"}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          margin="dense"
          id="realname"
          label="Real Name"
          type="text"
          fullWidth
          variant="outlined"
          value={realname}
          onChange={(e) => setRealname(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="email"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="phone"
          label="Phone"
          type="tel"
          fullWidth
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
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
            !username ||
            !password ||
            !confirmPassword ||
            !!usernameError ||
            !!passwordError ||
            !!confirmPasswordError ||
            !!emailError
          }
        >
          {isLoading ? <CircularProgress size={24} /> : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UserCreationStep({ onNext, onBack, isLastStep }: UserCreationStepProps) {
  const [createdUsers, setCreatedUsers] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async (user: UserCreateRequest) => {
    setIsCreating(true);
    setError(null);
    try {
      await api.users.create(user);
      setCreatedUsers(prev => [...prev, user.username]);
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Failed to create user:", error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to create user");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create additional user accounts for your team. You can always add more users later.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Created Users
          </Typography>
          {createdUsers.length > 0 ? (
            <List>
              {createdUsers.map((username) => (
                <ListItem key={username}>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">person</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={username}
                    secondary="User account created successfully"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No additional users created yet. You can add team members now or later from the User Management page.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Team Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create user accounts for your team members to give them access to the system.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setShowCreateDialog(true)}
            startIcon={<span className="material-symbols-outlined">person_add</span>}
          >
            Add User
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        {onBack && (
          <Button onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onNext}
          sx={{ ml: "auto" }}
        >
          {isLastStep ? "Complete Setup" : "Next"}
        </Button>
      </Box>

      <CreateAdditionalUserDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateUser}
        isLoading={isCreating}
      />
    </Box>
  );
}