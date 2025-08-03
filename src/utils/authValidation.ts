import { ApiError } from "@/api/errors";
import type { api } from "@/api/client";
import { useToastStore } from "@/store/toastStore";

type ApiClient = typeof api;

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  error?: string;
}

export const AUTH_ERROR_MESSAGES = {
  EXPIRED_TOKEN: "Your session has expired. Please log in again.",
  INVALID_CREDENTIALS: "Invalid username or password.",
  SERVER_RESTART: "Server was restarted. Please log in again.",
  NETWORK_ERROR: "Unable to connect to server. Please check your connection.",
  UNKNOWN_ERROR: "Authentication failed. Please try again.",
} as const;

export async function validateStoredToken(
  token: string | null,
  apiClient: ApiClient
): Promise<TokenValidationResult> {
  if (!token) {
    return { 
      isValid: false, 
      isExpired: false, 
      needsRefresh: false 
    };
  }

  try {
    await apiClient.session.me();
    return { 
      isValid: true, 
      isExpired: false, 
      needsRefresh: false 
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        return { 
          isValid: false, 
          isExpired: true, 
          needsRefresh: false 
        };
      }
      
      if (error.statusCode === 403) {
        return { 
          isValid: false, 
          isExpired: false, 
          needsRefresh: false,
          error: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
        };
      }
    }
    
    // Network or server errors
    return { 
      isValid: false, 
      isExpired: false, 
      needsRefresh: false, 
      error: error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.UNKNOWN_ERROR
    };
  }
}

export function showAuthErrorMessage(validation: TokenValidationResult): void {
  const { showToast } = useToastStore.getState();
  
  if (validation.isExpired) {
    showToast({
      severity: "info",
      message: AUTH_ERROR_MESSAGES.EXPIRED_TOKEN,
      autoHideDuration: 5000,
    });
  } else if (validation.error) {
    const message = validation.error.includes("ERR_CONNECTION_REFUSED") ||
                   validation.error.includes("ECONNREFUSED") ||
                   validation.error.includes("ERR_NETWORK") ||
                   validation.error.includes("Failed to fetch")
                     ? AUTH_ERROR_MESSAGES.NETWORK_ERROR
                     : validation.error;
                     
    showToast({
      severity: "error",
      message,
      autoHideDuration: 7000,
    });
  }
}