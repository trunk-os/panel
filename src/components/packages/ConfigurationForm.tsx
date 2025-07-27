import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
} from "@mui/material";
import type { Prompt, PromptResponse } from "@/types/services";

interface ConfigurationFormProps {
  prompt: Prompt;
  step: number;
  totalSteps: number;
  responses: PromptResponse[];
  setResponse: (template: string, input: string) => void;
  validateResponse: (value: string, type: string) => boolean;
}

export function ConfigurationForm({
  prompt,
  step,
  totalSteps,
  responses,
  setResponse,
  validateResponse,
}: ConfigurationFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const existingResponse = responses.find(
    (r) => r.template === prompt.template
  );

  useEffect(() => {
    if (existingResponse) {
      setValue(existingResponse.input[prompt.input_type]);
    } else {
      // Set default values based on prompt type
      let defaultValue = "";
      switch (prompt.input_type) {
        case "boolean":
          defaultValue = "false";
        case "integer":
        case "signed_integer":
          defaultValue = 0;
      }
      setValue(defaultValue);
    }
    setError("");
  }, [existingResponse, prompt.template, prompt.input_type, setResponse]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setError("");

    // Always set the response so the hook can track it
    setResponse(prompt.template, prompt.input_type, newValue);

    const isValid = validateResponse(existingResponse.input, prompt.input_type);

    // Show validation error if value is invalid and not empty
    if (!isValid) {
      setError(getValidationError(prompt.input_type));
    }
  };

  const getValidationError = (type: string): string => {
    switch (type) {
      case "integer":
        return "Please enter a valid positive integer";
      case "signed_integer":
        return "Please enter a valid integer";
      case "string":
        return "This field is required";
      case "boolean":
        return "Please select true or false";
      default:
        return "Invalid value";
    }
  };

  const renderInput = () => {
    switch (prompt.input_type) {
      case "integer":
      case "signed_integer":
        return (
          <TextField
            label={prompt.question}
            type="number"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={!!error}
            helperText={error || "Enter a numeric value"}
            fullWidth
            margin="normal"
            inputProps={{
              min: 0,
            }}
          />
        );

      case "string":
        return (
          <TextField
            label={prompt.question}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            error={!!error}
            helperText={error || "Enter a text value"}
            fullWidth
            margin="normal"
            multiline={prompt.question.toLowerCase().includes("description")}
            rows={prompt.question.toLowerCase().includes("description") ? 3 : 1}
          />
        );

      case "boolean":
        return (
          <Box sx={{ mt: 2, mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value === "true"}
                  onChange={(e) =>
                    handleValueChange(e.target.checked ? "true" : "false")
                  }
                />
              }
              label={prompt.question}
            />
            {error && (
              <Typography variant="caption" color="error" display="block">
                {error}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Alert severity="error">
            Unsupported input type: {prompt.input_type}
          </Alert>
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step {step + 1} of {totalSteps}
      </Typography>

      {prompt.template && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configuration: {prompt.template}
        </Typography>
      )}

      {renderInput()}
    </Box>
  );
}
