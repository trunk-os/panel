import { useState } from "react";
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
  useTheme,
  Box,
  Grid,
  Container,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import trunkLogo from "@/assets/logos/new_trunk_header.png";
import Sidebar from "./Sidebar";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  backgroundColor: theme.palette.background.default,
  height: "100vh",
  width: "100%",
  boxSizing: "border-box",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  ...(open && {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const toolbarHeight = 64;


export default function Layout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
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
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "100%",
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
                  sx={{ mr: 1, display: { md: "none" } }}
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
      <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} />
      <Main sx={{ pl: 0, ml: 10 }} open={sidebarOpen}>
        <Box sx={{ height: toolbarHeight, flexShrink: 0 }} />
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "left",
            overflow: "visible",
            pl: 10,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1400px",
              pr: 15,
              overflow: "visible",
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Main>
    </Box>
  );
}
