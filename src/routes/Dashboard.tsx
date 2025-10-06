import React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Logout from "@mui/icons-material/Logout";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import defaultClient from "../lib/client.ts";
import defaultEffects from "../lib/effects.ts";

export default function Dashboard() {
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [pingResults, setPingResults] = React.useState({});

  defaultEffects();

  React.useEffect(() => {
    const id = setInterval(async () => {
      defaultClient()
        .ping()
        .then((response) => {
          if (response.ok && response.response) {
            setPingResults(response.response);
          }
        });
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography>Trunk Control Panel</Typography>
        <Button
          variant="outlined"
          style={{ color: "white" }}
          onClick={(event) => {
            menuInfo.status = event.currentTarget;
            setMenuInfo(menuInfo);
          }}
        >
          Status
        </Button>
        <Menu
          anchorEl={menuInfo.status}
          onClose={() => {
            menuInfo.status = false;
            setMenuInfo(menuInfo);
          }}
          open={!!menuInfo.status}
        >
          <MenuItem
            onClick={() => {
              menuInfo.status = false;
              setMenuInfo(menuInfo);
            }}
          >
            hello
          </MenuItem>
          <MenuItem
            onClick={() => {
              menuInfo.status = false;
              setMenuInfo(menuInfo);
            }}
          >
            there
          </MenuItem>
        </Menu>
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
