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
import { PromptType } from "@/types/services";

interface ConfigurationFormProps {
  prompt: Prompt;
  step: number;
  totalSteps: number;
  responses: PromptResponse[];
  setResponse: (template: string, response: string) => void;
  validateResponse: (value: string, type: PromptType | number) => boolean;
}

export function ConfigurationForm({ 
  prompt, 
  step, 
  totalSteps, 
  responses, 
  setResponse, 
  validateResponse 
}: ConfigurationFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");


  const existingResponse = responses.find(r => r.template === prompt.template);

  useEffect(() => {
    if (existingResponse) {
      setValue(existingResponse.response);
    } else {
      // Set default values based on prompt type
      const defaultValue = prompt.input_type === PromptType.Boolean ? "false" : "";
      setValue(defaultValue);
      // Set the default response for boolean fields
      if (prompt.input_type === PromptType.Boolean) {
        setResponse(prompt.template, defaultValue);
      }
    }
    setError("");
  }, [existingResponse, prompt.template, prompt.input_type, setResponse]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setError("");

    // Always set the response so the hook can track it
    setResponse(prompt.template, newValue);

    const isValid = validateResponse(newValue, prompt.input_type);

    // Show validation error if value is invalid and not empty
    if (newValue.trim() !== "" && !isValid) {
      setError(getValidationError(prompt.input_type));
    }
  };

  const getValidationError = (type: PromptType): string => {
    switch (type) {
      case PromptType.Integer:
        return "Please enter a valid positive integer";
      case PromptType.SignedInteger:
        return "Please enter a valid integer";
      case PromptType.String:
        return "This field is required";
      case PromptType.Boolean:
        return "Please select true or false";
      default:
        return "Invalid value";
    }
  };

  const renderInput = () => {
    switch (prompt.input_type) {
      case PromptType.Integer:
      case PromptType.SignedInteger:
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
              min: prompt.input_type === PromptType.Integer ? 0 : undefined,
            }}
          />
        );

      case PromptType.String:
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

      case PromptType.Boolean:
        return (
          <Box sx={{ mt: 2, mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value === "true"}
                  onChange={(e) => handleValueChange(e.target.checked ? "true" : "false")}
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