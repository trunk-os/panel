import React from "react";
import moment from "moment";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { periodicCallWithState } from "../lib/effects.ts";

export default function AuditLog(props) {
  let [auditLog, setAuditLog] = React.useState([]);

  periodicCallWithState("audit_log", setAuditLog, {
    args: { page: props.page },
    requiredState: [props.page],
    defaultState: [],
  });

  return (
    <>
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          height: "3em",
          width: "30%",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Audit Log</h1>
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
          {auditLog.toReversed().map((entry, i) => (
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
          ))}
        </tbody>
      </table>
    </>
  );
}
