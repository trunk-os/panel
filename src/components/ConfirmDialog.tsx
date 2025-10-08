import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

export default function ConfirmDialog(props) {
  return (
    <Dialog open={props.open}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <IconButton
          color="success"
          onClick={(event) => {
            if (props.onSuccess) {
              props.onSuccess(event);
            }

            if (props.onComplete) {
              props.onComplete(event);
            }

            event.preventDefault();
          }}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={(event) => {
            if (props.onCancel) {
              props.onCancel(event);
            }

            if (props.onComplete) {
              props.onComplete(event);
            }

            event.preventDefault();
          }}
        >
          <CancelIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
