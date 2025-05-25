import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Paper,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { StorageSetupStep } from "./setup/StorageSetupStep";
import { UserCreationStep } from "./setup/UserCreationStep";
import { useSetupStore } from "@/store/setupStore";

interface SetupStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

const steps = ["Disk Configuration", "User Management"];

export default function FirstTimeSetup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const { markSetupComplete, setupProgress, updateSetupProgress } = useSetupStore();

  useEffect(() => {
    setActiveStep(setupProgress.currentStep);
  }, [setupProgress.currentStep]);

  const handleNext = () => {
    const newStep = activeStep + 1;
    const newCompletedSteps = [...setupProgress.completedSteps];

    if (!newCompletedSteps.includes(steps[activeStep])) {
      newCompletedSteps.push(steps[activeStep]);
    }

    if (newStep >= steps.length) {
      setIsComplete(true);
      markSetupComplete();
      navigate("/dashboard", { replace: true });
    } else {
      setActiveStep(newStep);
      updateSetupProgress(newStep, newCompletedSteps);
    }
  };

  const handleBack = () => {
    const newStep = activeStep - 1;
    setActiveStep(newStep);
    updateSetupProgress(newStep, setupProgress.completedSteps);
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsComplete(false);
    updateSetupProgress(0, []);
  };

  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const confirmSkip = () => {
    markSetupComplete();
    setShowSkipDialog(false);
    navigate("/dashboard");
  };

  const cancelSkip = () => {
    setShowSkipDialog(false);
  };

  const renderStepContent = (step: number) => {
    const stepProps: SetupStepProps = {
      onNext: handleNext,
      onBack: activeStep > 0 ? handleBack : undefined,
      isLastStep: activeStep === steps.length - 1,
    };

    switch (step) {
      case 0:
        return <StorageSetupStep {...stepProps} />;
      case 1:
        return <UserCreationStep {...stepProps} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  if (isComplete) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
          <Paper sx={{ p: 4, width: "100%", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Setup Complete!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your Trunk Admin system has been successfully configured. You can now access all
              features.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/dashboard")}>
              Continue to Dashboard
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography variant="h3" gutterBottom>
              Welcome to Trunk Admin
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Let's set up your system in a few simple steps
            </Typography>
          </Box>
          <Button variant="outlined" color="secondary" onClick={handleSkip} sx={{ ml: 2 }}>
            Skip Setup
          </Button>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label} completed={setupProgress.completedSteps.includes(label)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ p: 4 }}>{renderStepContent(activeStep)}</Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button onClick={handleReset}>Reset</Button>
          <Button variant="outlined" color="secondary" onClick={handleSkip}>
            Skip Setup
          </Button>
        </Box>

        <Dialog
          open={showSkipDialog}
          onClose={cancelSkip}
          aria-labelledby="skip-dialog-title"
          aria-describedby="skip-dialog-description"
        >
          <DialogTitle id="skip-dialog-title">Skip First-Time Setup?</DialogTitle>
          <DialogContent>
            <DialogContentText id="skip-dialog-description">
              Are you sure you want to skip the first-time setup? You will need to create storage,
              and possibly, users, through the management pages on your own.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelSkip}>Continue Setup</Button>
            <Button onClick={confirmSkip} variant="contained" color="primary">
              Skip Setup
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
