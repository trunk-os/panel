import React from "react";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import Table from "../components/Table.tsx";
import ConfirmDialog from "../components/ConfirmDialog.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";
import { toGB } from "../lib/units.ts";

async function modifyDisk({ name, create, kind, size }) {
  const client = defaultClient();

  switch (kind) {
    case "Dataset": {
      if (create) {
        return await client.zfs_create_dataset(name, size > 0 ? size : null);
      } else {
        return await client.zfs_modify_dataset(
          name,
          name,
          size > 0 ? size : null
        );
      }
      break;
    }
    case "Volume": {
      if (create) {
        return await client.zfs_create_volume(name, size);
      } else {
        return await client.zfs_modify_volume(name, name, size);
      }
      break;
    }
  }
}

function DiskProperties(props) {
  let [editDiskStatus, setEditDiskStatus] = React.useState({
    status: null,
    error_detail: {},
  });

  return (
    <form
      id="edit-disk-form"
      autoComplete="off"
      onSubmit={(event) => {
        modifyDisk({
          name: event.target.elements.name.value,
          create: props.create,
          kind: props.kind,
          size: parseInt(event.target.elements.size.value),
        }).then((response) => {
          props.setDiskProperties({ open: false });
          setEditDiskStatus({
            status: response.ok,
            error_detail: response.error_detail,
          });
        });
        event.preventDefault();
      }}
    >
      {editDiskStatus.status !== null ? (
        <>
          <div className="login-item">
            <Alert severity={editDiskStatus.status ? "success" : "error"}>
              {editDiskStatus.status
                ? "Disk " +
                  (props.create ? "Created" : "Modified") +
                  " Successfully."
                : `[ERROR]: ${editDiskStatus.error_detail.title}: ${editDiskStatus.error_detail.detail}`}
            </Alert>
          </div>
          <div style={{ height: "1em" }}></div>
        </>
      ) : (
        <></>
      )}
      <div className="login-item">
        <TextField
          style={{ width: "100%" }}
          label="Disk Name"
          id="name"
          defaultValue={props.disk ? props.disk.name : null}
          disabled={!props.create}
        />
      </div>
      <div style={{ height: "1em" }}></div>
      <div className="login-item">
        <TextField
          style={{ width: "100%" }}
          label="Size (in bytes)"
          id="size"
        />
      </div>
      <div style={{ height: "2em" }}></div>
      <div className="login-item">
        <Button style={{ width: "100%" }} variant="contained" type="submit">
          Modify Disk
        </Button>
      </div>
    </form>
  );
}

export default function DiskManagement(props) {
  let [zfsFilter, setZfsFilter] = React.useState(null);
  let [zfsList, setZfsList] = React.useState([]);
  let [menuInfo, setMenuInfo] = React.useState({ status: false });
  let [confirmName, setConfirmName] = React.useState(null);
  let [editDisk, setEditDisk] = React.useState({ open: false });

  periodicCallWithState("zfs_list", setZfsList, {
    args: zfsFilter,
    defaultState: [],
  });

  zfsList.sort((a, b) => (a.name > b.name ? 1 : a.name === b.name ? 0 : -1));

  return (
    <div>
      <Dialog open={editDisk.open}>
        <DialogTitle>
          {(editDisk.create ? "Create" : "Modify") + " Disk"}
        </DialogTitle>
        <DialogContent>
          <DiskProperties
            setDiskProperties={setEditDisk}
            create={editDisk.create}
            kind={editDisk.kind}
            disk={{ name: editDisk.name }}
          />
        </DialogContent>
      </Dialog>
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
                  setEditDisk({ open: true, create: true, kind: "Dataset" });
                  setMenuInfo({ status: false });
                }}
              >
                <Button>Dataset</Button>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setEditDisk({ open: true, create: true, kind: "Volume" });
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
          modify: (_, record) => (
            <Button
              variant="outlined"
              onClick={() => {
                setEditDisk({
                  open: true,
                  create: false,
                  name: record.name,
                  kind: record.kind,
                });
              }}
            >
              Modify
            </Button>
          ),
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
