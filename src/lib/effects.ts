import { useEffect } from "react";
import defaultClient from "./client.ts";

export function periodicCallWithState(call, args, setState) {
  const clientCall = () => {
    defaultClient()
      [call](args)
      .then((response) => {
        if (response.ok && response.response) {
          setState(response.response);
        }
      });
  };

  useEffect(() => {
    const id = setInterval(clientCall, 5000);
    clientCall();
    return () => clearInterval(id);
  }, []);
}

export function defaultEffects(inputs) {
  useEffect(() => {
    const clientCall = () => {
      defaultClient()
        .me()
        .then((response) => {
          if (response.ok && !response.response) {
            defaultClient.logout();
            // logged out, send to home
            window.location = "/";
          }
        });
    };

    const id = setInterval(clientCall, 5000);
    clientCall();
    return () => clearInterval(id);
  }, []);
}
