import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMemo } from "react";
import Dashboard from "@/components/Dashboard";
import Layout from "@/components/Layout";
import NotFound from "@/components/NotFound";
import ZFSPage from "@/components/ZFSPage";
import UserManagementPage from "@/components/UserManagementPage";
import { LoginPage } from "@/components/LoginPage";
import { AuthGuard } from "@/components/AuthGuard";
import { SetupGuard } from "@/components/SetupGuard";
import { AuthInitializer } from "@/components/AuthInitializer";
import { Favicon } from "@/components/Favicon";
import { useThemeStore } from "@/store/themeStore";
import FirstTimeSetup from "@/components/FirstTimeSetup";
import { ToastContainer } from "@/components/ToastContainer";
import { ApiStatusNavigator } from "@/components/ApiStatusNavigator";

export function App() {
  const { mode } = useThemeStore();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
          },
        },
        typography: {
          fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "sans-serif",
          ].join(","),
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Favicon />
      <AuthInitializer />
      <ApiStatusNavigator />
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/setup"
          element={
            <AuthGuard>
              <SetupGuard>
                <FirstTimeSetup />
              </SetupGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="disk" element={<ZFSPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
