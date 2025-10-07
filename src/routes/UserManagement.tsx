import React from "react";
import { periodicCallWithState } from "../lib/effects.ts";

export default function UserManagement(props) {
  let [userList, setUserList] = React.useState([]);

  periodicCallWithState("list_users", setUserList, { defaultState: [] });

  return <div>User Management Page!</div>;
}
