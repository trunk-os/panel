import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
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

export function EditUserDialog({
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
      deleted_at: user.deleted_at,
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
