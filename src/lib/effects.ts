import { useEffect } from "react";
import defaultClient from "./client.ts";
import { useNavigate } from "react-router";

export function periodicCallWithState(
  call,
  setState,
  { args, requiredState, defaultState }
) {
  const clientCall = () => {
    defaultClient()
      [call](args)
      .then((response) => {
        if (response.ok) {
          setState(response.response);
        } else if (!response.ok && defaultState) {
          setState(defaultState);
        }
      });
  };

  useEffect(() => {
    const id = setInterval(clientCall, 5000);
    clientCall();
    return () => clearInterval(id);
  }, requiredState || []);
}

export function defaultEffects(inputs) {
  const navigate = useNavigate();

  useEffect(() => {
    const clientCall = () => {
      defaultClient()
        .me()
        .then((response) => {
          if (response.ok && !response.response) {
            defaultClient.logout();
            // logged out, send to home
            navigate("/");
          }
        });
    };

    const id = setInterval(clientCall, 5000);
    clientCall();
    return () => clearInterval(id);
  }, []);
}
