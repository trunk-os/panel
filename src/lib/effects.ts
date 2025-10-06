import { useEffect } from "react";
import defaultClient from "./client.ts";

export default function defaultEffects(inputs) {
  useEffect(() => {
    const id = setTimeout(() => {
      defaultClient()
        .me()
        .then((response) => {
          if (response.ok && !response.response) {
            // logged out, send to home
            window.location = "/";
          }
        });
    }, 5000);
    return () => clearTimeout(id);
  });
}
