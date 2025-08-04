import { Snackbar, Alert, type AlertColor, Button, Box } from "@mui/material";
import { useToastStore } from "@/store/toastStore";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ErrorDetailModal } from "./ErrorDetailModal";

interface ToastContentProps {
  message: string;
  errorId?: string;
  onShowDetails: (errorId: string) => void;
  showDetailsButton?: boolean;
}

function ToastContent({
  message,
  errorId,
  onShowDetails,
  showDetailsButton = true,
}: ToastContentProps) {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
    >
      <Box sx={{ flexGrow: 1, mr: 1 }}>{message}</Box>
      {errorId && showDetailsButton && (
        <Button
          variant="contained"
          size="small"
          onClick={() => onShowDetails(errorId)}
          sx={{
            minWidth: "auto",
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "inherit",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          Details
        </Button>
      )}
    </Box>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const location = useLocation();

  const isOnLoginPage = location.pathname === "/login";

  const handleShowDetails = (errorId: string) => {
    if (!isOnLoginPage) {
      setSelectedErrorId(errorId);
      setErrorModalOpen(true);
    }
  };

  // Show only the most recent toast
  const currentToast = toasts[toasts.length - 1];

  return (
    <>
      {currentToast && !isOnLoginPage && (
        <Snackbar
          key={currentToast.id}
          open={true}
          autoHideDuration={currentToast.autoHideDuration || 4000}
          onClose={() => removeToast(currentToast.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => removeToast(currentToast.id)}
            severity={currentToast.severity as AlertColor}
            variant="filled"
            sx={{ width: "100%" }}
          >
            <ToastContent
              message={currentToast.message}
              errorId={currentToast.errorId}
              onShowDetails={handleShowDetails}
              showDetailsButton={!isOnLoginPage}
            />
          </Alert>
        </Snackbar>
      )}

      {!isOnLoginPage && (
        <ErrorDetailModal
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            setSelectedErrorId(null);
          }}
          errorId={selectedErrorId}
        />
      )}
    </>
  );
}
