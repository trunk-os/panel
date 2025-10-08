import React from "react";
import moment from "moment";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Logout from "@mui/icons-material/Logout";
import Toolbar from "@mui/material/Toolbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";

import ConfirmDialog from "../components/ConfirmDialog.tsx";
import AuditLog from "../components/AuditLog.tsx";
import ServerStats from "../components/ServerStats.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState, defaultEffects } from "../lib/effects.ts";

const MENU_STATS = [
  "uptime",
  "available_memory",
  "load_average",
  "available_disk",
];

function ServiceStatus(props) {
  return (
    <Alert
      style={{ width: "100%" }}
      severity={props.latency !== null ? "success" : "error"}
    >
      {props.label}: {props.latency !== null ? `${props.latency}ms` : "down"}
    </Alert>
  );
}

export default function Dashboard(props) {
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [pingResults, setPingResults] = React.useState({});

  defaultEffects();
  periodicCallWithState("ping", setPingResults, {});

  const buckleLatency =
    pingResults && pingResults.health && pingResults.health.buckle
      ? pingResults.health.buckle.latency
      : null;

  const charonLatency =
    pingResults && pingResults.health && pingResults.health.charon
      ? pingResults.health.charon.latency
      : null;

  return (
    <>
      <ConfirmDialog open={true} title="Hello">
        All glory to the hypnotoad
      </ConfirmDialog>
      <AppBar position="sticky">
        <Toolbar>
          <Button
            style={{ color: "white" }}
            variant="outlined"
            href="/dashboard"
          >
            Home
          </Button>
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
                latency={buckleLatency}
                label="System Controller"
              />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuInfo({ status: false });
              }}
            >
              <ServiceStatus latency={charonLatency} label="Package Manager" />
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
      <Grid container spacing={2}>
        <Grid size={2}></Grid>
        <Grid size={8}>{props.children}</Grid>
        <Grid size={2}></Grid>
      </Grid>
    </>
  );
}
