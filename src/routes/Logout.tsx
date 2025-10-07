import React from "react";
import defaultClient from "../lib/client.ts";
import { useNavigate } from "react-router";

export default function Logout() {
  const navigate = useNavigate();

  React.useEffect(() => {
    defaultClient().logout();

    navigate("/");
  }, []);

  return <></>;
}
