import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";

interface DestroyConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  isLoading: boolean;
}

export default function DestroyConfirmationDialog({
  open,
  onClose,
  onConfirm,
  name,
  isLoading,
}: DestroyConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Destruction</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to destroy the dataset/volume <strong>{name}</strong>? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Destroy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
