import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthStore } from "@/store/authStore";
import { useSetupStore } from "@/store/setupStore";
import { ApiError } from "@/api/errors";
import { api } from "@/api/client";
import type { Login, UserCreateRequest } from "@/api/types";
import { CreateUserDialog } from "./dialogs/user/CreateUserDialog";
import ApiStatusIndicator from "./ApiStatusIndicator";

export function LoginPage() {
  const [formData, setFormData] = useState<Login>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCreateUser, setShowCreateUser] = useState(false);

  const { login, isAuthenticated } = useAuthStore();
  const { needsSetup } = useSetupStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    const checkNeedsSetup = async () => {
      if (isAuthenticated) {
        const requires = await needsSetup(api);
        console.log("[checkNeedsSetup] Requires: ", requires);
        if (requires) {
          navigate("/setup", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    };
    checkNeedsSetup();
  }, [isAuthenticated, navigate, from, needsSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ username: formData.username, password: formData.password }, api);
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

  const handleInputChange = (field: keyof Login) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUserCreated = (user: UserCreateRequest) => {
    setFormData({
      username: user.username,
      password: user.password,
    });
    setShowCreateUser(false);
  };

  return (
    <Paper
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400, px: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Box textAlign="center">
                <Typography variant="h4" component="h1">
                  Welcome to Trunk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to your account
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    API Status:
                  </Typography>
                  <ApiStatusIndicator />
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    fullWidth
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    fullWidth
                  />

                  {error && (
                    <Typography variant="body2" color="error">
                      Authentication failed
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              <Divider>or</Divider>

              <Box textAlign="center">
                <Typography variant="body2">
                  First time?{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setShowCreateUser(true)}
                    variant="body2"
                    sx={{ cursor: "pointer" }}
                  >
                    Click here
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <CreateUserDialog
        open={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onUserCreated={handleUserCreated}
      />
    </Paper>
  );
}
