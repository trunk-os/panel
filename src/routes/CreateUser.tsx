import React from "react";
import { NavLink } from "react-router";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";

import defaultClient from "../lib/client.ts";

async function createUser(form) {
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

  const response = await client.create_user({
    username: form.username.value,
    password: form.password.value,
    realname: form.realname.value.length > 0 ? form.realname.value : null,
    phone: form.phone.value.length > 0 ? form.phone.value : null,
    email: form.email.value.length > 0 ? form.email.value : null,
  });

  return response;
}

export default function Create() {
  let [createUserState, setCreateUserState] = React.useState({
    status: null,
  });

  return (
    <div>
      <form
        id="create-user-form"
        autoComplete="off"
        onSubmit={(event) => {
          createUser(event.target.elements).then((response) => {
            setCreateUserState({
              status: response.ok,
              error_detail: response.error_detail,
            });
          });
          event.preventDefault();
        }}
      >
        {createUserState.status !== null ? (
          <>
            <div className="login-item">
              <Alert severity={createUserState.status ? "success" : "error"}>
                {createUserState.status
                  ? "User Created Successfully."
                  : `[ERROR]: ${createUserState.error_detail.title}: ${createUserState.error_detail.detail}`}
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
            variant="filled"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="Password"
            id="password"
            type="password"
            variant="filled"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="Repeat Password"
            id="password2"
            type="password"
            variant="filled"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] Real Name"
            id="realname"
            variant="filled"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] Phone Number"
            id="phone"
            variant="filled"
          />
        </div>
        <div style={{ height: "1em" }}></div>
        <div className="login-item">
          <TextField
            style={{ width: "100%" }}
            label="[Optional] E-Mail Address"
            id="email"
            variant="filled"
          />
        </div>
        <div style={{ height: "2em" }}></div>
        <div className="login-item">
          <Button style={{ width: "100%" }} variant="contained" type="submit">
            Create a New User
          </Button>
        </div>
      </form>
    </div>
  );
}
