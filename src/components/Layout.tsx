import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useMediaQuery,
  Box,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import trunkLogo from "@/assets/logos/new_trunk_header.png";
import Sidebar from "./Sidebar";

const toolbarHeight = 64;

export default function Layout() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  // Only show sidebar by default on very large screens (1600px+)
  const isVeryLargeScreen = useMediaQuery("(min-width: 1600px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auto-open sidebar on very large screens, close on smaller screens
  useEffect(() => {
    console.log('Layout: isVeryLargeScreen:', isVeryLargeScreen, 'window.innerWidth:', window.innerWidth);
    setSidebarOpen(isVeryLargeScreen);
  }, [isVeryLargeScreen]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Grid container>
            <Grid item xs={10} container alignItems="center" spacing={1}>
              <Grid item>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1, display: isVeryLargeScreen ? "none" : "block" }}
                >
                  <span className="material-symbols-outlined">menu</span>
                </IconButton>
              </Grid>

              <Grid item>
                <Box
                  component="img"
                  src={trunkLogo}
                  alt="Trunk"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                  sx={{
                    height: 30,
                    mr: 1,
                    display: { xs: "none", sm: "block" },
                  }}
                />
              </Grid>

              <Grid item>
                <Typography variant="h6" noWrap component="div">
                  Trunk Admin
                </Typography>
              </Grid>
            </Grid>

            <Grid item xs={2} container justifyContent="flex-end" gap={1}>
              <Tooltip title={`Toggle theme (currently: ${mode})`}>
                <IconButton color="inherit" onClick={toggleTheme}>
                  <span className="material-symbols-outlined">
                    {mode === "light" ? "dark_mode" : "light_mode"}
                  </span>
                </IconButton>
              </Tooltip>
              <Tooltip title={user?.username || "User"}>
                <IconButton
                  color="inherit"
                  onClick={handleUserMenuClick}
                  aria-controls={anchorEl ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={anchorEl ? "true" : undefined}
                >
                  <span className="material-symbols-outlined">account_circle</span>
                </IconButton>
              </Tooltip>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                MenuListProps={{
                  "aria-labelledby": "user-button",
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleUserMenuClose} disabled>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">person</span>
                  </ListItemIcon>
                  <ListItemText primary={user?.username || "User"} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">logout</span>
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth={false} disableGutters sx={{ height: "100vh", display: "flex" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid item sx={{ display: isVeryLargeScreen && sidebarOpen ? "block" : "none" }}>
            <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
          </Grid>
          <Grid item xs sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ height: toolbarHeight, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, padding: "10px", backgroundColor: "background.default" }}>
              <Outlet />
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {(!isVeryLargeScreen || !sidebarOpen) && (
        <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
      )}
    </>
  );
}
