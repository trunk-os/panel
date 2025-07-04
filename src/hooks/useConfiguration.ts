import { useState, useCallback } from "react";
import { api } from "@/api/client";
import type { Prompt, PromptResponse, PromptResponses } from "@/types/services";
import { PromptType } from "@/types/services";
import { useToastStore } from "@/store/toastStore";

export function useConfiguration() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [responses, setResponses] = useState<PromptResponse[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastStore();

  const fetchPrompts = useCallback(async (packageName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.packages.getPrompts({ name: packageName, version: "latest" });
      setPrompts(response.data.prompts);
      setResponses([]);
      setCurrentStep(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch configuration prompts";
      setError(errorMessage);
      showToast({ message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const validateResponse = useCallback((value: string, type: PromptType | number): boolean => {
    // Convert number to enum if needed
    const enumType = typeof type === 'number' ? type as PromptType : type;
    
    const result = (() => {
      switch (enumType) {
        case PromptType.Integer:
        case 0:
          return /^\d+$/.test(value) && Number.parseInt(value, 10) >= 0;
        case PromptType.SignedInteger:
        case 1:
          return /^-?\d+$/.test(value);
        case PromptType.String:
        case 2:
          return value.trim().length > 0;
        case PromptType.Boolean:
        case 3:
          return value === "true" || value === "false";
        default:
          return false;
      }
    })();
    
    return result;
  }, []);

  const setResponse = useCallback((template: string, response: string) => {
    setResponses(prev => {
      const existing = prev.findIndex(r => r.template === template);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { template, response };
        return updated;
      }
      return [...prev, { template, response }];
    });
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < prompts.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, prompts.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const submitConfiguration = useCallback(async (packageName: string) => {
    try {
      setLoading(true);
      const configData: PromptResponses = {
        responses,
      };
      await api.packages.setResponses({ name: packageName, responses: configData.responses });
      showToast({ message: "Configuration submitted successfully", severity: "success" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit configuration";
      showToast({ message: errorMessage, severity: "error" });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [responses, showToast]);

  const reset = useCallback(() => {
    setPrompts([]);
    setResponses([]);
    setCurrentStep(0);
    setError(null);
  }, []);

  // Computed value for whether we can proceed
  const currentPrompt = prompts[currentStep];
  const currentResponse = responses.find(r => r.template === currentPrompt?.template);
  const isResponseValid = currentResponse && currentPrompt ? 
    validateResponse(currentResponse.response, currentPrompt.input_type) : false;
  const canProceed = prompts.length > 0 && 
    currentPrompt !== undefined && 
    currentResponse !== undefined && 
    isResponseValid;


  return {
    prompts,
    responses,
    currentStep,
    loading,
    error,
    fetchPrompts,
    validateResponse,
    setResponse,
    nextStep,
    previousStep,
    submitConfiguration,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === prompts.length - 1,
    canProceed,
  };
}