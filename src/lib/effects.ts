import { useEffect } from "react";
import defaultClient from "./client.ts";

export function periodicCallWithState(call, args, setState) {
  useEffect(() => {
    const id = setInterval(() => {
      defaultClient()
        [call](args)
        .then((response) => {
          if (response.ok && response.response) {
            setState(response.response);
          }
        });
    }, 5000);

    return () => clearInterval(id);
  }, []);
}

export function defaultEffects(inputs) {
  useEffect(() => {
    const id = setInterval(() => {
      defaultClient()
        .me()
        .then((response) => {
          if (response.ok && !response.response) {
            defaultClient.logout();
            // logged out, send to home
            window.location = "/";
          }
        });
    }, 5000);

    return () => clearInterval(id);
  }, []);
}
