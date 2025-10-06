import React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Logout from "@mui/icons-material/Logout";
import Toolbar from "@mui/material/Toolbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import ServerStats from "../components/ServerStats.tsx";

import defaultClient from "../lib/client.ts";
import defaultEffects from "../lib/effects.ts";

const MENU_STATS = [
  "uptime",
  "available_memory",
  "load_average",
  "available_disk",
];

function ServiceStatus(props) {
  return props.show ? (
    <Alert
      style={{ width: "100%" }}
      severity={props.latency !== null ? "success" : "error"}
    >
      {props.label}: {props.latency !== null ? `${props.latency}ms` : "down"}
    </Alert>
  ) : (
    <></>
  );
}

export default function Dashboard() {
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [pingResults, setPingResults] = React.useState({});

  defaultEffects();

  React.useEffect(() => {
    const id = setInterval(() => {
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

  const buckleLatency =
    pingResults && pingResults.health && pingResults.health.buckle
      ? pingResults.health.buckle.latency
      : null;

  const charonLatency =
    pingResults && pingResults.health && pingResults.health.charon
      ? pingResults.health.charon.latency
      : null;

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography>Trunk Control Panel</Typography>
        <Button
          variant="outlined"
          style={{ color: "white" }}
          onClick={(event) => {
            setMenuInfo({
              status: menuInfo.status ? false : event.currentTarget,
            });
          }}
        >
          Status
        </Button>
        <Menu
          anchorEl={menuInfo.status || undefined}
          onClose={() => {
            setMenuInfo({ status: false });
          }}
          open={!!menuInfo.status}
        >
          <MenuItem
            onClick={() => {
              setMenuInfo({ status: false });
            }}
          >
            <ServiceStatus
              show={pingResults}
              latency={buckleLatency}
              label="Buckle"
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuInfo({ status: false });
            }}
          >
            <ServiceStatus
              show={pingResults}
              latency={charonLatency}
              label="Charon"
            />
          </MenuItem>
          <MenuItem
            onClick={(event) => {
              setMenuInfo({
                status: false,
              });
            }}
          >
            <ServerStats stats={pingResults.info} include={MENU_STATS} />
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
