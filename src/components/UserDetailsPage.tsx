import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Button,
  Divider,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { UserData, UserUpdateRequest } from "@/api/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

function EditUserDialog({
  open,
  onClose,
  onSubmit,
  user,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: UserUpdateRequest) => void;
  user: UserData | null;
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

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRealname(user.realname || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPassword(""); // Don't populate password for security reasons
      setConfirmPassword("");
    }
  }, [user]);

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError("");
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
      setPasswordError("");
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
      setConfirmPasswordError("");
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
    validatePasswordMatch(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validatePasswordMatch(password, value);
  };

  const handleSubmit = () => {
    if (
      usernameError ||
      emailError ||
      (password && passwordError) ||
      (password && !confirmPassword) ||
      confirmPasswordError ||
      !username ||
      !user
    )
      return;

    const updatedUser: UserUpdateRequest = {
      id: user.id,
      username,
      realname: realname || undefined,
      email: email || undefined,
      phone: phone || undefined,
    };

    if (password) {
      updatedUser.password = password;
    }

    onSubmit(updatedUser);
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <DialogContentText>Edit user account information.</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="username-edit"
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
          id="password-edit"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={handlePasswordChange}
          error={!!passwordError}
          helperText={passwordError || "Leave empty to keep current password"}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="confirm-password-edit"
          label="Confirm Password"
          type="password"
          fullWidth
          variant="outlined"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError || "Re-enter your password if changing"}
          sx={{ mb: 2 }}
          disabled={!password}
        />
        <TextField
          margin="dense"
          id="realname-edit"
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
          id="email-edit"
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
          id="phone-edit"
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
            !!usernameError ||
            !!passwordError ||
            (password && !confirmPassword) ||
            !!confirmPasswordError ||
            !!emailError
          }
        >
          {isLoading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteUserConfirmationDialog({
  open,
  onClose,
  onConfirm,
  user,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the user <strong>{user?.username}</strong>? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await api.users.get(Number(userId));
      setUser(response.data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps don't change in component
  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

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

  const goBack = () => {
    navigate("/users");
  };

  const handleEditUser = async (updatedUser: UserUpdateRequest) => {
    setIsEditingUser(true);
    try {
      await api.users.update(updatedUser);
      fetchUserDetails();
      setEditDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId || !user) return;

    setIsDeletingUser(true);
    try {
      await api.users.destroy(Number(userId));
      setDeleteDialogOpen(false);
      // Navigate back to users list after successful deletion
      navigate("/users");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeletingUser(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user && !isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box>
          <Typography variant="h2">User Not Found</Typography>
          <Button variant="outlined" onClick={goBack} sx={{ mt: 2 }}>
            Back to User Management
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h2">User Details</Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage user information
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<span className="material-symbols-outlined">edit</span>}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<span className="material-symbols-outlined">delete</span>}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
          <Button variant="outlined" onClick={goBack}>
            Back
          </Button>
        </Box>
      </Box>

      {user && (
        <>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                User Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">{user.username}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">{user.id}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Real Name
                  </Typography>
                  <Typography variant="body1">{user.realname || "-"}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user.email || "-"}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{user.phone || "-"}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                User Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "150px",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  User actions history will be implemented in a future update
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </>
      )}

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

      {/* Dialogs */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditUser}
        user={user}
        isLoading={isEditingUser}
      />

      <DeleteUserConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        user={user}
        isLoading={isDeletingUser}
      />
    </Box>
  );
}
