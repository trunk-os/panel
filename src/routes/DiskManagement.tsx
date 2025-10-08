import React from "react";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Table from "../components/Table.tsx";
import ConfirmDialog from "../components/ConfirmDialog.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";
import { toGB } from "../lib/units.ts";

export default function DiskManagement(props) {
  let [zfsFilter, setZfsFilter] = React.useState(null);
  let [zfsList, setZfsList] = React.useState([]);
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [confirmName, setConfirmName] = React.useState(null);

  periodicCallWithState("zfs_list", setZfsList, {
    args: zfsFilter,
    defaultState: [],
  });

  zfsList.sort((a, b) => a.name > b.name);

  return (
    <div>
      <ConfirmDialog
        open={confirmName}
        title="Confirm Volume Deletion?"
        onSuccess={(event) => {
          defaultClient()
            .zfs_destroy(confirmName)
            .then((x) => x);
        }}
        onComplete={() => {
          setConfirmName(null);
        }}
      >
        Delete Volume <code>{confirmName}</code>?
      </ConfirmDialog>
      <Table
        title={
          <>
            <Button
              color="success"
              variant="contained"
              onClick={(event) => {
                setMenuInfo({
                  status: menuInfo.status ? false : event.currentTarget,
                });
              }}
            >
              <AddIcon />
              Storage
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
                <Button>Dataset</Button>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuInfo({ status: false });
                }}
              >
                <Button>Volume</Button>
              </MenuItem>
            </Menu>
          </>
        }
        list={zfsList}
        headings={[
          "Name",
          "Kind",
          "Total Size",
          "Used Size",
          "Modify",
          "Delete",
        ]}
        values={["name", "kind", "size", "used", "modify", "delete"]}
        transforms={{
          name: (x) => <div style={{ textAlign: "justify" }}>{x}</div>,
          size: toGB,
          used: toGB,
          modify: (_, record) => <Button variant="outlined">Modify</Button>,
          delete: (_, record) => (
            <IconButton
              color="error"
              onClick={(event) => {
                setConfirmName(record.name);
                event.preventDefault();
              }}
            >
              <DeleteIcon />
            </IconButton>
          ),
        }}
      />
    </div>
  );
}
