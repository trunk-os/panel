import { useEffect } from "react";
import defaultClient from "./client.ts";

export default function defaultEffects(inputs) {
  useEffect(() => {
    defaultClient()
      .me()
      .then((response) => {
        if (response.ok && !response.response) {
          // logged out, send to home
          window.location = "/";
        }
      });
  }, [inputs]);
}
