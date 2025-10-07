import React from "react";
import Button from "@mui/material/Button";
import Table from "../components/Table.tsx";

import { periodicCallWithState } from "../lib/effects.ts";

export default function UserManagement(props) {
  let [userList, setUserList] = React.useState([]);

  periodicCallWithState("list_users", setUserList, {
    args: { page: props.page },
    requiredState: [props.page],
    defaultState: [],
  });

  return (
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
        edit_user: () => <Button variant="outlined">Edit User</Button>,
      }}
    />
  );
}
