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
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import ServerStats from "../components/ServerStats.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState, defaultEffects } from "../lib/effects.ts";

const MENU_STATS = [
  "uptime",
  "available_memory",
  "load_average",
  "available_disk",
];

function AuditLog(props) {
  return (
    <>
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          height: "3em",
          //border: "1px solid black",
          width: "30%",
        }}
      >
        <div
          style={{
            minHeight: "3em",
            float: "left",
          }}
        >
          <Button
            onClick={() => {
              let page = props.page - 1;
              if (page < 0) {
                page = 0;
              }

              if (page != props.page) {
                props.pageSetter(page);
              }
            }}
          >
            &lt;&lt;
          </Button>
        </div>
        <div style={{ minHeight: "3em", float: "right" }}>
          <Button
            onClick={() => {
              let page = props.page + 1;
              if (page < 0) {
                page = 0;
              }

              if (page != props.page) {
                props.pageSetter(page);
              }
            }}
          >
            &gt;&gt;
          </Button>
        </div>
        <div
          style={{
            minHeight: "3em",
            marginTop: "1em",
            textAlign: "center",
          }}
        >
          Page: {props.page + 1}
        </div>
      </div>
      <div style={{ height: "1em" }} />
      <table style={{ width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>Entry ID</th>
            <th>Time</th>
            <th>Activity</th>
            <th>API Endpoint</th>
            <th>User ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {props.log ? (
            props.log.toReversed().map((entry, i) => (
              <tr
                key={entry.id}
                style={{ backgroundColor: i % 2 == 0 ? null : "#eee" }}
              >
                <td>{entry.id}</td>
                <td>{moment(entry.time).format("YYYY/MM/DD HH:MM:SS Z")}</td>
                <td>{entry.entry}</td>
                <td>{entry.endpoint}</td>
                <td>{entry.user_id ? entry.user_id : "<none>"}</td>
                <td>
                  <Alert severity={entry.error ? "error" : "success"}>
                    {entry.error ? `Error: ${entry.error}` : "Success"}
                  </Alert>
                </td>
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </>
  );
}

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

export default function Dashboard() {
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [pingResults, setPingResults] = React.useState({});
  let [auditLog, setAuditLog] = React.useState([]);
  let [auditLogPage, setAuditLogPage] = React.useState(0);

  defaultEffects();
  periodicCallWithState("ping", setPingResults, {});
  periodicCallWithState("audit_log", setAuditLog, {
    args: { page: auditLogPage },
    requiredState: [auditLogPage],
    defaultState: [],
  });

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
              <ServiceStatus latency={buckleLatency} label="Buckle" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuInfo({ status: false });
              }}
            >
              <ServiceStatus latency={charonLatency} label="Charon" />
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
        <Grid size={8}>
          <AuditLog
            log={auditLog}
            page={auditLogPage}
            pageSetter={setAuditLogPage}
          />
        </Grid>
        <Grid size={2}></Grid>
      </Grid>
    </>
  );
}
