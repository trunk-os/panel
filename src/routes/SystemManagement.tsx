import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

import Table from "../components/Table.tsx";
import ConfirmDialog from "../components/ConfirmDialog.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";

export default function SystemManagement(props) {
  let [unitList, setUnitList] = React.useState([]);
  let [unitFilter, setUnitFilter] = React.useState(null);

  periodicCallWithState("list_units", setUnitList, {
    args: unitFilter,
    defaultState: [],
    transform: (payload) =>
      payload
        .filter((x) => x.name.endsWith(".service"))
        .map((x) => ({
          name: x.name,
          description: x.description,
          enabled: x.enabled_state === "Enabled",
          desired_state: x.status.runtime_state,
          last_run_state: x.status.last_run_state,
        })),
  });

  unitList.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
        ? 0
        : -1
  );

  return (
    <Table
      title="Services"
      list={unitList}
      headings={[
        "Name",
        "Description",
        "Enabled",
        "Desired State",
        "Last Run State",
      ]}
      values={[
        "name",
        "description",
        "enabled",
        "desired_state",
        "last_run_state",
      ]}
      transforms={{
        name: (x) => {
          let name = x.replace(".service", "");
          name =
            name.substr(0, name.length < 25 ? name.length : 25) +
            (name.length > 22 ? "..." : "");

          return <div style={{ textAlign: "left" }}>{name}</div>;
        },
        description: (x, record) =>
          x === record.name ? (
            ""
          ) : (
            <div style={{ textAlign: "left" }}>
              {x.substr(0, x.length < 25 ? x.length : 25) +
                (x.length > 22 ? "..." : "")}
            </div>
          ),
        enabled: (x) =>
          x ? (
            <CheckIcon style={{ color: "green" }} />
          ) : (
            <CancelIcon style={{ color: "red" }} />
          ),
      }}
    />
  );
}
