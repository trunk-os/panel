import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "ZFS",
    path: "/zfs",
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

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        position: { xs: "fixed", md: "sticky" },
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          height: "100%",
          position: {
            xs: "fixed",
            md: "sticky",
          },
          top: 0,
          zIndex: 100,
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Typography variant="h5">Trunk Admin</Typography>
      </Box>
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
    </Drawer>
  );
}
