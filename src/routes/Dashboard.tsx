import defaultEffects from "../lib/effects.ts";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Logout from "@mui/icons-material/Logout";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Dashboard() {
  defaultEffects();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography>Trunk Control Panel</Typography>
        <Button
          startIcon={<Logout />}
          variant="outlined"
          style={{ color: "white" }}
          href="/logout"
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
