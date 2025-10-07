import React from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import CloseIcon from "@mui/icons-material/Close";

import Table from "../components/Table.tsx";
import CenterForm from "../components/CenterForm.tsx";

import defaultClient from "../lib/client.ts";
import { periodicCallWithState } from "../lib/effects.ts";

async function updateUser(form) {
  if (form.password.value !== form.password2.value) {
    return {
      ok: false,
      error_detail: {
        title: "Password Error",
        detail: "Passwords do not match",
      },
    };
  }

  const client = defaultClient();

  const response = await client.update_user(form.id.value, {
    username: form.username.value,
    password: form.password.value.length > 0 ? form.password.value : null,
    realname: form.realname.value.length > 0 ? form.realname.value : null,
    phone: form.phone.value.length > 0 ? form.phone.value : null,
    email: form.email.value.length > 0 ? form.email.value : null,
  });

  return response;
}

function EditUser(props) {
  let [editUserStatus, setEditUserStatus] = React.useState({
    status: null,
    error_detail: {},
  });

  return (
    <div>
      <form
        id="edit-user-form"
        autoComplete="off"
        onSubmit={(event) => {
          updateUser(event.target.elements).then((response) => {
            setEditUserStatus({
              status: response.ok,
              error_detail: response.error_detail,
            });

            if (response.ok) {
              props.setUser({});
            }
          });
          event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={props.user.id} />
        {editUserStatus.status !== null ? (
          <>
            <div className="login-item">
              <Alert severity={editUserStatus.status ? "success" : "error"}>
                {editUserStatus.status
                  ? "User Modified Successfully."
                  : `[ERROR]: ${editUserStatus.error_detail.title}: ${editUserStatus.error_detail.detail}`}
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
            label="User Name"
            id="username"
            defaultValue={props.user.username}
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="Password"
            id="password"
            type="password"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="Repeat Password"
            id="password2"
            type="password"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] Real Name"
            id="realname"
            defaultValue={props.user.realname}
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] Phone Number"
            id="phone"
            defaultValue={props.user.phone}
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] E-Mail Address"
            id="email"
            defaultValue={props.user.email}
          />
        </div>
        <div style={{ height: "2em" }}></div>
        <div className="login-item">
          <Button style={{ width: "100%" }} variant="contained" type="submit">
            Modify User
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function UserManagement(props) {
  let [userList, setUserList] = React.useState([]);
  let [editUser, setEditUser] = React.useState({});

  periodicCallWithState("list_users", setUserList, {
    args: { page: props.page },
    requiredState: [props.page],
    defaultState: [],
  });

  return (
    <>
      <Modal open={editUser && editUser.id}>
        <CenterForm>
          <Card>
            <CardHeader
              title="Edit a User"
              subheader={`ID: ${editUser.id}, User Name: ${editUser.username}`}
              action={
                <IconButton onClick={() => setEditUser({})}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent>
              <EditUser user={editUser} setUser={setEditUser} />
            </CardContent>
          </Card>
        </CenterForm>
      </Modal>
      <Table
        page={props.page}
        setPage={props.setPage}
        list={userList}
        headings={[
          "User ID",
          "User Name",
          "Real Name",
          "Phone",
          "E-Mail",
          "Edit User",
        ]}
        values={["id", "username", "realname", "phone", "email", "edit_user"]}
        transforms={{
          realname: (x) => (x ? x : "<none>"),
          phone: (x) => (x ? x : "<none>"),
          email: (x) => (x ? x : "<none>"),
          edit_user: (_, record) => (
            <Button variant="outlined" onClick={() => setEditUser(record)}>
              Edit User
            </Button>
          ),
        }}
      />
    </>
  );
}
