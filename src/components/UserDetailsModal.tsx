import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Paper,
  Checkbox,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { api } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
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
  currentUser,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  currentUser: UserData | null;
  isLoading: boolean;
}) {
  const [warningUnderstood, setWarningUnderstood] = useState<boolean>(false);

  const sameUser = currentUser?.username === user?.username;

  const handleCheckboxChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setWarningUnderstood(checked);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the user <strong>{user?.username}</strong>? This action
          cannot be undone.
        </DialogContentText>
        {sameUser && (
          <Paper square sx={{ padding: 2, margin: 2 }}>
            <Box sx={{ display: "grid", justifyItems: "left" }}>
              <Typography variant="subtitle1" sx={{ color: "orange" }}>
                WARNING: This is the Current User. You will immediately lose access to the
                application if you delete yourself.
              </Typography>

              <Box>
                <Checkbox
                  sx={{ paddingLeft: 0, marginLeft: 0 }}
                  onChange={handleCheckboxChange}
                  required
                  inputProps={{ "aria-label": "Warning understood" }}
                />{" "}
                I have read and understood the above warning.
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading || (sameUser && !warningUnderstood)}
        >
          {isLoading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  onUserUpdated?: () => void;
  onUserDeleted?: () => void;
}

export function UserDetailsModal({
  open,
  onClose,
  userId,
  onUserUpdated,
  onUserDeleted,
}: UserDetailsModalProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const { user: currentUser } = useAuthStore();

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await api.users.get(userId);
      setUser(response.data);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [open, userId, fetchUserDetails]);

  const handleEditUser = async (updatedUser: UserUpdateRequest) => {
    setIsEditingUser(true);
    try {
      await api.users.update(updatedUser);
      fetchUserDetails();
      setEditDialogOpen(false);
      onUserUpdated?.();
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId || !user) return;

    setIsDeletingUser(true);
    try {
      await api.users.destroy(userId);
      setDeleteDialogOpen(false);
      onUserDeleted?.();
      onClose();
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          User Details
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : !user ? (
          <Typography color="error">User not found</Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1">{user.username}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body1">{user.id}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Real Name
                </Typography>
                <Typography variant="body1">{user.realname || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email || "-"}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{user.phone || "-"}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {user && (
          <>
            <Button variant="outlined" color="primary" onClick={() => setEditDialogOpen(true)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)}>
              Delete
            </Button>
          </>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

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
        currentUser={currentUser}
        isLoading={isDeletingUser}
      />
    </Dialog>
  );
}
