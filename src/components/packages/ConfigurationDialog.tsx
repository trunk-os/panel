import { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import { useConfiguration } from "@/hooks/useConfiguration";
import { usePackages } from "@/hooks/usePackages";
import { ConfigurationForm } from "./ConfigurationForm";
import type { Package } from "@/types/services";

interface ConfigurationDialogProps {
  open: boolean;
  package: Package | null;
  onClose: () => void;
}

export function ConfigurationDialog({ open, package: pkg, onClose }: ConfigurationDialogProps) {
  const {
    prompts,
    responses,
    currentStep,
    loading,
    error,
    isFirstStep,
    isLastStep,
    canProceed,
    fetchPrompts,
    setResponse,
    validateResponse,
    nextStep,
    previousStep,
    submitConfiguration,
    reset,
  } = useConfiguration();

  const { installPackage } = usePackages();

  useEffect(() => {
    if (open && pkg) {
      fetchPrompts(pkg.name, pkg.version);
    } else if (!open) {
      reset();
    }
  }, [open, pkg, fetchPrompts, reset]);

  const handleNext = () => {
    if (isLastStep) {
      handleInstall();
    } else {
      nextStep();
    }
  };

  const handleInstall = async () => {
    if (!pkg) return;

    try {
      if (prompts.length > 0) {
        await submitConfiguration(pkg.name);
      }
      await installPackage(pkg.name, pkg.version);
      onClose();
    } catch (error) {
      console.error("Installation failed:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Install {pkg.name}
        {prompts.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            Configuration required
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : prompts.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography>No configuration required. Click Install to proceed.</Typography>
          </Box>
        ) : (
          <Box>
            <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
              {prompts.map((_prompt, index) => (
                <Step key={`step-${index}`}>
                  <StepLabel>{`Step ${index + 1}`}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <ConfigurationForm
              prompt={prompts[currentStep]}
              step={currentStep}
              totalSteps={prompts.length}
              responses={responses}
              setResponse={setResponse}
              validateResponse={validateResponse}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        {prompts.length > 0 && !isFirstStep && (
          <Button onClick={previousStep} disabled={loading}>
            Previous
          </Button>
        )}

        {prompts.length === 0 ? (
          <Button onClick={handleInstall} variant="contained" disabled={loading}>
            Install
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained" disabled={loading || !canProceed}>
            {isLastStep ? "Install" : "Next"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
