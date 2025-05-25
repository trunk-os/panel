import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { UserData, UserCreateRequest, UserList, UserUpdateRequest } from "@/api/types";
import { CreateUserDialog } from "./CreateUserDialog";
import { useAuthStore } from "@/store/authStore";

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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the user <strong>{user?.username}</strong>? This action
          cannot be undone.
          {currentUser?.username === user?.username && (
            <Box>
              <Typography variant="subtitle1" sx={{ color: "orangered" }}>
                WARNING: This is the Current User. You will immediately lose access to the
                application if you delete yourself.
              </Typography>
            </Box>
          )}
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

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState<UserList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const { user } = useAuthStore();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.users.list();
      console.log("[fetchUsers] ", response);
      setUsers(
        Array.isArray(response.data) ? response.data : response.data ? [response.data].flat() : []
      );
    } catch (error) {
      handleApiError(error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchUsers();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchUsers is defined in the component and doesn't change
  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = async (_user: UserCreateRequest) => {
    refetch();
    setCreateUserOpen(false);
  };

  const handleEditUser = async (user: UserUpdateRequest) => {
    setIsEditingUser(true);
    try {
      await api.users.update(user);
      refetch();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      setIsDeletingUser(true);
      try {
        await api.users.destroy(Number(selectedUser.id));
        refetch();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsDeletingUser(false);
      }
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const viewUserDetails = (userId: number) => {
    console.log(`[viewUserDetails] got ${userId}`);
    navigate(`/users/${userId}`);
  };
  console.log("[UserManagmentPage] ", users);
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(filter.toLowerCase()) ||
      user.realname?.toLowerCase().includes(filter.toLowerCase()) ||
      user.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h2">User Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users
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
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by username, name, or email"
              sx={{ width: 300 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => setCreateUserOpen(true)}>
                Create User
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Real Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
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
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.realname || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => viewUserDetails(user.id)}
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(user)}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {filter ? "No matching users found" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        onUserCreated={handleCreateUser}
      />

      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditUser}
        user={selectedUser}
        isLoading={isEditingUser}
      />

      <DeleteUserConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        user={selectedUser}
        currentUser={user}
        isLoading={isDeletingUser}
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
