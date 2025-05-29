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
import { useAuthStore } from "@/store/authStore";

export function DeleteUserConfirmationDialog({
  open,
  onClose,
  onConfirm,
  user,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  isLoading: boolean;
}) {
  const [warningUnderstood, setWarningUnderstood] = useState<boolean>(false);
  const { currentUser } = useAuthStore();
  const sameUser = currentUser()?.id === user?.id;

  const handleCheckboxChange = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setWarningUnderstood(checked);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user?.deleted_at ? "Confirm Restoration" : "Confirm Suspension"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {user?.deleted_at
            ? `Are you sure you want to restore the user ${user?.username}? This will give them access to the system again.`
            : `Are you sure you want to suspend the user ${user?.username}? They will lose access to the system but can be restored later.`}
        </DialogContentText>
        {sameUser && (
          <Paper square sx={{ padding: 2, margin: 2 }}>
            <Box sx={{ display: "grid", justifyItems: "left" }}>
              <Typography variant="subtitle1" sx={{ color: "orange" }}>
                WARNING: This is the Current User. You will immediately lose access to the
                application if you suspend yourself.
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
          color={user?.deleted_at ? "success" : "warning"}
          disabled={isLoading || (sameUser && !warningUnderstood)}
        >
          {isLoading ? <CircularProgress size={24} /> : user?.deleted_at ? "Restore" : "Suspend"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
