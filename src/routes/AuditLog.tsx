import React from "react";
import moment from "moment";
import Alert from "@mui/material/Alert";

import Table from "../components/Table.tsx";
import { periodicCallWithState } from "../lib/effects.ts";

export default function AuditLog(props) {
  let [auditLog, setAuditLog] = React.useState([]);

  periodicCallWithState("audit_log", setAuditLog, {
    args: { page: props.page },
    requiredState: [props.page],
    defaultState: [],
  });

  return (
    <Table
      title="Audit Log"
      sort="ascending"
      page={props.page}
      setPage={props.setPage}
      list={auditLog}
      headings={[
        "Entry ID",
        "Time",
        "Activity",
        "API Endpoint",
        "User",
        "Status",
      ]}
      values={["id", "time", "entry", "endpoint", "user", "error"]}
      transforms={{
        id: (x) => <div style={{ textAlign: "left" }}>{x}</div>,
        time: (t) => (
          <div style={{ textAlign: "left" }}>
            {moment(t).format("YYYY/MM/DD HH:MM:ss")}
          </div>
        ),
        entry: (x) => <div style={{ textAlign: "left" }}>{x}</div>,
        endpoint: (x) => <div style={{ textAlign: "left" }}>{x}</div>,
        user: (user) => (user ? user.username : "<none>"),
        error: (error) => {
          let msg = "Success";

          if (error) {
            let errorMsg = JSON.parse(error);
            msg = `${errorMsg.title || "Unknown"}: ${errorMsg.detail || "no detail for error"}`;
          }

          return (
            <Alert
              style={{ textAlign: "left" }}
              severity={error ? "error" : "success"}
            >
              {msg}
            </Alert>
          );
        },
      }}
    />
  );
}
