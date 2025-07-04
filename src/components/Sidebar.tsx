import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const drawerWidth = 240;

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Packages",
    path: "/packages",
    icon: "inventory_2",
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

const advancedMenuItems = [
  {
    label: "Services",
    path: "/services",
    icon: "apps",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleAdvancedToggle = () => {
    setAdvancedOpen(!advancedOpen);
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
        <ListItem disablePadding>
          <ListItemButton onClick={handleAdvancedToggle}>
            <ListItemIcon>
              <span className="material-symbols-outlined">tune</span>
            </ListItemIcon>
            <ListItemText primary="Advanced" />
            <span className="material-symbols-outlined">
              {advancedOpen ? "expand_less" : "expand_more"}
            </span>
          </ListItemButton>
        </ListItem>
        <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {advancedMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={RouterLink} to={item.path} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          marginTop: "64px",
          height: "calc(100% - 64px)",
          position: isMobile ? "fixed" : "absolute",
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}