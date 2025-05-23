/**
 * API error handling classes and response types
 */

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
 * Standard API response wrapper with data and status code
 */
export type ApiResponse<T> = {
  data: T;
  statusCode: number;
};

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
