import React from "react";
import defaultClient from "../lib/client.ts";

export default function Logout() {
  React.useEffect(() => {
    defaultClient().logout();

    window.location = "/";
  }, []);

  return <></>;
}
