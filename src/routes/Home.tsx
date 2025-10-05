import React from "react";
import { NavLink } from "react-router";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import CenterForm from "../components/CenterForm.tsx";
import defaultClient from "../lib/client.ts";

async function performLogin(form) {
  const client = defaultClient();
  try {
    const response = await client.login(
      form.username.value,
      form.password.value
    );
    return response.ok;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export default function Home() {
  let [loginState, setLoginState] = React.useState(null);

  return (
    <CenterForm>
      <div>
        <form
          id="login-form"
          autoComplete="off"
          onSubmit={(event) => {
            performLogin(event.target.elements)
              .then((success) => {
                setLoginState(success);
                event.preventDefault();
              })
              .catch((e) => console.log(e));
          }}
        >
          {loginState === null || loginState === true ? (
            <></>
          ) : (
            <div className="login-item">
              <Alert style={{ width: "100%" }} severity="error">
                Invalid Login
              </Alert>
            </div>
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
