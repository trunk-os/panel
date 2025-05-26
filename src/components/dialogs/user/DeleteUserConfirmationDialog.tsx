import { useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Paper,
  Box,
  Typography,
  Checkbox,
} from "@mui/material";
import type { UserData } from "@/api/types";

export function DeleteUserConfirmationDialog({
  open,
  onClose,
  onConfirm,
  user,
  currentUser,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  currentUser: UserData | null;
  isLoading: boolean;
}) {
  const [warningUnderstood, setWarningUnderstood] = useState<boolean>(false);

  const sameUser = currentUser?.username === user?.username;

  const handleCheckboxChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setWarningUnderstood(checked);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the user <strong>{user?.username}</strong>? This action
          cannot be undone.
        </DialogContentText>
        {sameUser && (
          <Paper square sx={{ padding: 2, margin: 2 }}>
            <Box sx={{ display: "grid", justifyItems: "left" }}>
              <Typography variant="subtitle1" sx={{ color: "orange" }}>
                WARNING: This is the Current User. You will immediately lose access to the
                application if you delete yourself.
              </Typography>

              <Box>
                <Checkbox
                  sx={{ paddingLeft: 0, marginLeft: 0 }}
                  onChange={handleCheckboxChange}
                  required
                  inputProps={{ "aria-label": "Warning understood" }}
                />{" "}
                I have read and understood the above warning.
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading || (sameUser && !warningUnderstood)}
        >
          {isLoading ? <CircularProgress size={24} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}