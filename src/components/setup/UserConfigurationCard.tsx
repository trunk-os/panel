import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  TextField,
  Button,
  Alert,
  Collapse,
  Chip,
} from "@mui/material";
import type { UserCreateRequest } from "@/api/types";

export interface SetupUser extends UserCreateRequest {
  id: string;
  isTemporary?: boolean;
  role?: "admin" | "user";
}

interface UserConfigurationCardProps {
  user: SetupUser;
  onEdit: (user: SetupUser) => void;
  onDelete: (userId: string) => void;
  onValidationChange: (userId: string, isValid: boolean, errors: string[]) => void;
  readOnly?: boolean;
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

export function UserConfigurationCard({
  user,
  onEdit,
  onDelete,
  onValidationChange,
  readOnly = false,
}: UserConfigurationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<SetupUser>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUser = (userToValidate: SetupUser): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!userToValidate.username) {
      validationErrors.push("Username is required");
      fieldErrors.username = "Username is required";
    } else if (!isValidUsername(userToValidate.username)) {
      validationErrors.push("Invalid username format");
      fieldErrors.username = "Username must be 3-32 characters, alphanumeric, underscore, hyphen";
    }

    if (!userToValidate.password) {
      validationErrors.push("Password is required");
      fieldErrors.password = "Password is required";
    } else if (!isValidPassword(userToValidate.password)) {
      validationErrors.push("Password too short");
      fieldErrors.password = "Password must be at least 8 characters";
    }

    if (userToValidate.email && !isValidEmail(userToValidate.email)) {
      validationErrors.push("Invalid email format");
      fieldErrors.email = "Please enter a valid email address";
    }

    setErrors(fieldErrors);
    return { isValid: validationErrors.length === 0, errors: validationErrors };
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditingUser({ ...user });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingUser(user);
    setErrors({});
  };

  const handleSaveEdit = () => {
    const validation = validateUser(editingUser);
    onValidationChange(user.id, validation.isValid, validation.errors);

    if (validation.isValid) {
      onEdit(editingUser);
      setIsEditing(false);
    }
  };

  const handleFieldChange = (field: keyof SetupUser, value: string) => {
    const updatedUser = { ...editingUser, [field]: value };
    setEditingUser(updatedUser);

    // Real-time validation
    validateUser(updatedUser);
  };

  const handleDelete = () => {
    onDelete(user.id);
  };

  if (isEditing) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <Typography variant="h6">Edit User</Typography>
            <Box>
              <Button onClick={handleCancelEdit} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveEdit}
                disabled={Object.keys(errors).length > 0}
              >
                Save
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <TextField
              label="Username"
              value={editingUser.username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
              error={!!errors.username}
              helperText={errors.username || "3-32 characters, alphanumeric, underscore, hyphen"}
              required
              fullWidth
            />
            <TextField
              label="Real Name"
              value={editingUser.realname || ""}
              onChange={(e) => handleFieldChange("realname", e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={editingUser.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password || "At least 8 characters"}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editingUser.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />
            <TextField
              label="Phone"
              type="tel"
              value={editingUser.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              fullWidth
              sx={{ gridColumn: { md: "span 2" } }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6">{user.username}</Typography>
              {user.isTemporary && <Chip label="Pending" size="small" color="warning" />}
              {user.role === "admin" && <Chip label="Admin" size="small" color="primary" />}
            </Box>

            {user.realname && (
              <Typography variant="body2" color="text.secondary">
                {user.realname}
              </Typography>
            )}

            {user.email && (
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            )}

            {user.phone && (
              <Typography variant="body2" color="text.secondary">
                {user.phone}
              </Typography>
            )}
          </Box>

          {!readOnly && (
            <Box>
              <IconButton onClick={handleStartEdit} size="small">
                <span className="material-symbols-outlined">edit</span>
              </IconButton>
              <IconButton onClick={handleDelete} size="small" color="error">
                <span className="material-symbols-outlined">delete</span>
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
