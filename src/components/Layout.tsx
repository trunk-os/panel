import { useState } from "react";
import ApiStatusIndicator from "./ApiStatusIndicator";
import { Outlet, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
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
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import trunkLogo from "@/assets/logos/new_trunk_header.png";
import { useNavigate } from "react-router-dom";

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

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Disk",
    path: "/disk",
    icon: "storage",
  },
  {
    label: "Users",
    path: "/users",
    icon: "group",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "settings",
  },
];

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

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  const drawer = (
    <>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemIcon>
                <span className="material-symbols-outlined">{item.icon}</span>
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

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

              <Grid item>
                <ApiStatusIndicator />
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
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            marginTop: "64px", // Height of AppBar/Toolbar
            height: "calc(100% - 64px)", // Subtract AppBar height
            position: isMobile ? "fixed" : "absolute",
          },
        }}
      >
        {drawer}
      </Drawer>
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
