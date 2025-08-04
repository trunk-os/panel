import { describe, test, expect, mock, spyOn } from "bun:test";
import { validateStoredToken, AUTH_ERROR_MESSAGES } from "../authValidation";
import { ApiError } from "@/api/errors";
import type { api } from "@/api/client";

type ApiClient = typeof api;

// Mock API client
const createMockApiClient = (
  shouldSucceed: boolean,
  statusCode?: number
): Pick<ApiClient, "session"> => ({
  session: {
    me: mock(() => {
      if (shouldSucceed) {
        return Promise.resolve({ data: { id: 1, username: "test" } });
      }
      throw new ApiError("Auth failed", statusCode || 401);
    }),
  },
});

describe("authValidation", () => {
  describe("validateStoredToken", () => {
    test("should return invalid when no token provided", async () => {
      const mockApi = createMockApiClient(true);
      const result = await validateStoredToken(null, mockApi as Pick<ApiClient, "session">);

      expect(result).toEqual({
        isValid: false,
        isExpired: false,
        needsRefresh: false,
      });
    });

    test("should return valid when token validation succeeds", async () => {
      const mockApi = createMockApiClient(true);
      const result = await validateStoredToken(
        "valid-token",
        mockApi as Pick<ApiClient, "session">
      );

      expect(result).toEqual({
        isValid: true,
        isExpired: false,
        needsRefresh: false,
      });
    });

    test("should return expired when 401 error occurs", async () => {
      const mockApi = createMockApiClient(false, 401);
      const result = await validateStoredToken(
        "expired-token",
        mockApi as Pick<ApiClient, "session">
      );

      expect(result).toEqual({
        isValid: false,
        isExpired: true,
        needsRefresh: false,
      });
    });

    test("should return invalid with error when 403 error occurs", async () => {
      const mockApi = createMockApiClient(false, 403);
      const result = await validateStoredToken(
        "forbidden-token",
        mockApi as Pick<ApiClient, "session">
      );

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(false);
      expect(result.error).toBe(AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS);
    });

    test("should handle network errors", async () => {
      const mockApi: Pick<ApiClient, "session"> = {
        session: {
          me: mock(() => Promise.reject(new Error("Network error"))),
        },
      };

      const result = await validateStoredToken("token", mockApi);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  // Note: showAuthErrorMessage tests removed to avoid global mock pollution
  // The function is tested through integration tests in the main application
});
