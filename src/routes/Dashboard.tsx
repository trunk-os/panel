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
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import moment from "moment";
import { sprintf } from "sprintf-js";
import HumanElapsed from "human-elapsed";

import defaultClient from "../lib/client.ts";
import defaultEffects from "../lib/effects.ts";

function toGB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024))}GB`;
}

function toTB(m) {
  return `${sprintf("%0.02f", m / (1024 * 1024 * 1024 * 1024))}TB`;
}

const STAT_TO_NAME = {
  uptime: "System Uptime",
  available_memory: "Available System Memory",
  total_memory: "Total System Memory",
  cpus: "Physical CPUs",
  cpu_usage: "CPU Usage",
  host_name: "Machine Name",
  kernel_version: "Linux Kernel Version",
  load_average: "Load Average",
  processes: "Server Processes",
  total_disk: "Total Storage Available",
  available_disk: "Unused Storage Available",
};

const UNIT_CONVERTER = {
  uptime: HumanElapsed,
  available_memory: toGB,
  total_memory: toGB,
  cpus: (x) => x / 2,
  cpu_usage: (x) => `${Math.floor(x)}%`,
  load_average: ([one, five, fifteen]) =>
    `[ 1m: ${one}, 5m: ${five}, 15m: ${fifteen} ]`,
  total_disk: toTB,
  available_disk: toTB,
};

const MENU_STATS = [
  "uptime",
  "available_memory",
  "load_average",
  "available_disk",
];

function ServerStats(props) {
  return (
    <Card>
      <CardHeader
        title="Server Health Information"
        subheader={"Time: " + moment().format("HH:MM:SS (ZZ), YYYY/MM/DD")}
      />
      <CardContent>
        {props.stats ? (
          (props.include ? props.include : Object.keys(props.stats)).map(
            (k, i) => (
              <div
                style={{
                  padding: "0.5em",
                  backgroundColor: i % 2 == 0 ? null : "#eee",
                }}
              >
                {STAT_TO_NAME[k] + ": "}
                {UNIT_CONVERTER[k]
                  ? UNIT_CONVERTER[k](props.stats[k])
                  : props.stats[k]}
              </div>
            )
          )
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
}

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
