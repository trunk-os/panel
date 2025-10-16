import React from "react";
import Grid from "@mui/material/Grid";

export default function CenterForm(props) {
  let height = "10em";

  switch (props.ceiling) {
    case "high":
      height = "0.5em";
      break;
    case "medium":
      height = "5em";
      break;
    case "low":
      height = "10em";
      break;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={3} />
      <Grid size={6}>
        <div style={{ height }} />
        <div>{props.children}</div>
      </Grid>
      <Grid size={3} />
    </Grid>
  );
}
