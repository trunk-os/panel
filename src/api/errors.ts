import { showErrorToast, isProblemDetails } from "./errorUtils";

/**
 * Standard API error class with status code and optional error details
 */
export class ApiError extends Error {
  statusCode?: number;
  errorCode?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * Problem Details (RFC7807)
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

/**
 * Handles API error responses with ProblemDetails parsing and toast notifications
 */
export async function handleApiErrorResponse(
  response: Response,
  clearToken: () => void
): Promise<never> {
  if (response.status === 401) {
    clearToken();
  }

  try {
    const contentType = response.headers.get("Content-Type") || "";
    let errorData: unknown;

    if (contentType.includes("application/json")) {
      errorData = await response.json();
    } else if (contentType.includes("application/cbor")) {
      const buffer = await response.arrayBuffer();
      const { decode } = await import("cbor2");
      errorData = await decode(new Uint8Array(buffer));
    } else {
      errorData = { detail: await response.text() };
    }

    if (isProblemDetails(errorData)) {
      if (errorData.status === 401) {
        clearToken();
      }
      showErrorToast(errorData);
      throw new ApiError(
        errorData.detail || errorData.title || response.statusText,
        response.status,
        errorData.type,
        errorData
      );
    }

    if (typeof errorData === "object" && errorData !== null) {
      const data = errorData as Record<string, unknown>;
      if (data?.status === 401) {
        clearToken();
      }
      
      const error = new ApiError(
        (data?.message as string) || response.statusText,
        response.status,
        data?.errorCode as string,
        data?.details as Record<string, unknown>
      );
      showErrorToast(error);
      throw error;
    }

    const error = new ApiError(response.statusText, response.status);
    showErrorToast(error);
    throw error;
  } catch (parseError) {
    if (parseError instanceof ApiError) {
      throw parseError;
    }
    const error = new ApiError(response.statusText, response.status);
    showErrorToast(error);
    throw error;
  }
}
