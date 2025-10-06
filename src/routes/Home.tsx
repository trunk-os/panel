import React from "react";
import { NavLink, redirect } from "react-router";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import CenterForm from "../components/CenterForm.tsx";
import defaultClient from "../lib/client.ts";

async function performLogin(form) {
  const response = await defaultClient().login(
    form.username.value,
    form.password.value
  );
  return response.ok;
}

export default function Home() {
  let [loginState, setLoginState] = React.useState(null);

  React.useEffect(() => {
    defaultClient()
      .me()
      .then((response) => {
        if (response.response) {
          // user struct came back; we are logged in
          window.location = "/dashboard";
        }
      });
  }, []);

  return (
    <CenterForm>
      <div>
        <form
          id="login-form"
          autoComplete="off"
          onSubmit={(event) => {
            performLogin(event.target.elements).then((success) => {
              setLoginState(success);

              if (success) {
                window.location = "/dashboard";
              }
            });
            event.preventDefault();
          }}
        >
          {loginState === null || loginState === true ? (
            <></>
          ) : (
            <div className="login-item">
              <Alert severity="error">Invalid Login</Alert>
            </div>
          )}
          <div style={{ height: "1em" }}></div>
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
              autoComplete="current-password"
              variant="filled"
            />
          </div>
          <div style={{ height: "2em" }}></div>
          <div className="login-item">
            <Button style={{ width: "100%" }} variant="contained" type="submit">
              Login
            </Button>
          </div>
          <div style={{ height: "2em" }}></div>
          <div className="login-item">
            <Paper
              style={{
                width: "100%",
                height: "3em",
                paddingTop: "1em",
                backgroundColor: "#eee",
                textAlign: "center",
                justifyContent: "center",
              }}
              elevation={2}
            >
              First Visit Here?{" "}
              <NavLink to="/user/create">Create a User</NavLink>
            </Paper>
          </div>
        </form>
      </div>
    </CenterForm>
  );
}
