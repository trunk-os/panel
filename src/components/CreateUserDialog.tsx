import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { UserCreateRequest } from "@/api/types";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: (user: UserCreateRequest) => void;
}

export function CreateUserDialog({ open, onClose, onUserCreated }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: "",
    password: "",
    realname: "",
    email: "",
    phone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPasswordError("");

    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      await api.users.create(formData);
      onUserCreated(formData);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserCreateRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
      realname: "",
      email: "",
      phone: "",
    });
    setConfirmPassword("");
    setError("");
    setPasswordError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              type="text"
              value={formData.username}
              onChange={handleInputChange("username")}
              placeholder="Enter username"
              required
              autoComplete="username"
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              placeholder="Enter password"
              required
              autoComplete="new-password"
              fullWidth
              error={!!passwordError}
              helperText={passwordError || "At least 8 characters"}
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              fullWidth
              error={!!passwordError}
              helperText={passwordError ? "" : "Re-enter your password"}
            />

            <TextField
              label="Real Name"
              type="text"
              value={formData.realname}
              onChange={handleInputChange("realname")}
              placeholder="Enter real name"
              autoComplete="name"
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="Enter email address"
              autoComplete="email"
              fullWidth
            />

            <TextField
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              placeholder="Enter phone number"
              autoComplete="tel"
              fullWidth
            />

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.username || !formData.password || !confirmPassword || formData.password !== confirmPassword}
                variant="contained"
                fullWidth
              >
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}