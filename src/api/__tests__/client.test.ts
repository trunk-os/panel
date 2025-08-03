import { describe, test, expect, beforeEach, mock, spyOn } from "bun:test";
import * as cbor from "cbor2";
import { fetchApi, api } from "../client";
import { ApiError } from "../errors";
import { mockStatusResponse, mockUserData, mockUserCreateRequest } from "./mocks";
import type { UserUpdateRequest, Login } from "../types";

// Mock the auth store
const mockAuthStore = {
  getState: () => ({
    getToken: () => null,
    clearToken: () => {},
  }),
};

// Mock the auth store module
mock.module("@/store/authStore", () => ({
  useAuthStore: mockAuthStore,
}));

// Utility function for test failures
function fail(message: string): never {
  throw new Error(message);
}

// Helper function to create mock responses
function createMockResponse(status: number, data: any, headers: Record<string, string> = {}) {
  // Always use at least an empty object for CBOR encoding (null causes decoding issues)
  const mockBody = cbor.encode(data === null ? {} : data);

  return new Response(mockBody, {
    status,
    headers: {
      "Content-Type": "application/cbor",
      ...headers,
    },
  });
}

describe("API Client", () => {
  // Reset mocks before each test
  beforeEach(() => {
    globalThis.fetch = mock(() => Promise.resolve(createMockResponse(200, { success: true })));
  });

  describe("fetchApi", () => {
    test("should make a request with correct URL and headers (no body)", async () => {
      const mockFetch = mock((url, options) =>
        Promise.resolve(createMockResponse(200, { data: "test" }))
      );
      globalThis.fetch = mockFetch;

      await fetchApi("/users", { method: "GET" });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
      expect(calledUrl.endsWith("/users")).toBe(true);
      expect(calledOptions.headers).toEqual({
        Accept: "application/cbor, application/json",
      });
    });

    test("should use absolute URL when provided", async () => {
      const mockFetch = mock((url, options) =>
        Promise.resolve(createMockResponse(200, { data: "test" }))
      );
      globalThis.fetch = mockFetch;

      await fetchApi("https://example.com/api/users");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("https://example.com/api/users", expect.anything());
    });

    test("should encode request body as CBOR when body is provided", async () => {
      const requestBody = { name: "Test User", email: "test@example.com" };

      const cborModule = await import("cbor2");
      const encodeSpy = spyOn(cborModule, "encode");

      const mockFetch = mock((url, options) =>
        Promise.resolve(createMockResponse(200, { success: true }))
      );
      globalThis.fetch = mockFetch;

      await fetchApi("/users", {
        method: "POST",
        body: requestBody,
      });

      const encodeCallArgs = encodeSpy.mock.calls.map((call) => call[0]);
      expect(encodeCallArgs).toContain(requestBody);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Content-Type"]).toBe("application/cbor");
    });

    test("should decode CBOR response", async () => {
      const responseData = { id: 1, name: "Test User" };
      const mockFetch = mock(() => Promise.resolve(createMockResponse(200, responseData)));
      globalThis.fetch = mockFetch;

      const cborModule = await import("cbor2");
      const decodeSpy = spyOn(cborModule, "decode").mockImplementationOnce(() =>
        Promise.resolve(responseData)
      );

      const result = await fetchApi("/users/1");

      expect(decodeSpy).toHaveBeenCalled();
      expect(result).toEqual({ data: responseData, statusCode: 200 });
    });

    test("should throw ApiError for non-OK responses", async () => {
      const errorData = {
        message: "User not found",
        code: "NOT_FOUND",
        details: { id: 1 },
      };

      const mockFetch = mock((_url, _options) => {
        const response = new Response(JSON.stringify(errorData), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
        return Promise.resolve(response);
      });
      globalThis.fetch = mockFetch;

      await expect(fetchApi("/users/1")).rejects.toThrow(ApiError);

      globalThis.fetch = mock((_url, _options) => {
        const response = new Response(JSON.stringify(errorData), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
        return Promise.resolve(response);
      });

      try {
        await fetchApi("/users/1");
        fail("Expected fetchApi to throw an error");
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe("User not found");
        } else {
          fail("Error is not an ApiError");
        }
      }
    });

    test("should handle parse errors in error responses", async () => {
      const createBadResponse = () =>
        new Response(JSON.stringify({ message: "Bad Request" }), {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        });

      const mockFetch = mock(() => Promise.resolve(createBadResponse()));
      globalThis.fetch = mockFetch;

      await expect(fetchApi("/bad-request")).rejects.toThrow(ApiError);

      globalThis.fetch = mock(() => Promise.resolve(createBadResponse()));

      try {
        await fetchApi("/bad-request");
        fail("Expected fetchApi to throw an error");
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(400);
          expect(error.message).toBe("Bad Request");
        } else {
          fail("Error is not an ApiError");
        }
      }
    });

    test("should handle network errors", async () => {
      const networkError = new Error("Network failure");
      const mockFetch = mock(() => Promise.reject(networkError));
      globalThis.fetch = mockFetch;

      await expect(fetchApi("/users")).rejects.toThrow(ApiError);
      await expect(fetchApi("/users")).rejects.toMatchObject({
        message: "Network failure",
        statusCode: 0,
      });
    });

    test("should pass through ApiError instances", async () => {
      const apiError = new ApiError("Custom error", 422);
      const mockFetch = mock(() => Promise.reject(apiError));
      globalThis.fetch = mockFetch;

      await expect(fetchApi("/users")).rejects.toBe(apiError);
    });

    test("should call clearToken on 401 status code", async () => {
      const clearTokenSpy = mock(() => {});
      mockAuthStore.getState = () => ({
        getToken: () => null,
        clearToken: clearTokenSpy,
      });

      const mockFetch = mock(() => Promise.resolve(new Response("Unauthorized", { status: 401 })));
      globalThis.fetch = mockFetch;

      try {
        await fetchApi("/users");
      } catch {
        // Expected to throw
      }

      expect(clearTokenSpy).toHaveBeenCalled();
    });

    test("should call clearToken on 401 in ProblemDetails", async () => {
      const clearTokenSpy = mock(() => {});
      mockAuthStore.getState = () => ({
        getToken: () => null,
        clearToken: clearTokenSpy,
      });

      const errorData = { status: 401, message: "Token expired" };
      const mockFetch = mock(() => 
        Promise.resolve(new Response(JSON.stringify(errorData), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }))
      );
      globalThis.fetch = mockFetch;

      try {
        await fetchApi("/users");
      } catch {
        // Expected to throw
      }

      expect(clearTokenSpy).toHaveBeenCalled();
    });
  });


  describe("API convenience methods", () => {
    test("api.status.ping should return status", async () => {
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(mockStatusResponse);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.status.ping();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.data.status).toBe("ok");
      expect(result.statusCode).toBe(200);
    });

    test("api.get should call fetch with GET method", async () => {
      const responseData = { users: [{ id: 1, name: "User 1" }] };
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(responseData);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.get("/users");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/users");
      expect(options.method).toBe("GET");

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(responseData);
    });

    test("api.post should call fetch with POST method and data", async () => {
      const responseData = { id: 1, name: "New User", email: "user@example.com" };
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(responseData);
        return Promise.resolve(
          new Response(responseBody, {
            status: 201,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const userData = { name: "New User", email: "user@example.com" };
      const result = await api.post("/users", userData);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/users");
      expect(options.method).toBe("POST");

      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(responseData);
    });
  });

  describe("User management API", () => {
    test("api.users.list should fetch all users", async () => {
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(mockUserData);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.users.list();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith("/users")).toBe(true);
      expect(options.method).toBe("POST");
      expect(result.data).toEqual(mockUserData);
      expect(result.statusCode).toBe(200);
    });

    test("api.users.list should accept pagination parameters", async () => {
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(mockUserData);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const pagination = { page: 2, per_page: 10 };
      const result = await api.users.list(pagination);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith("/users")).toBe(true);
      expect(options.method).toBe("POST");
      expect(result.data).toEqual(mockUserData);
      expect(result.statusCode).toBe(200);
    });

    test("api.users.create should add a new user", async () => {
      const newUser = { ...mockUserCreateRequest };
      const createdUser = {
        id: "4",
        username: newUser.username,
        realname: newUser.realname,
        email: newUser.email,
        phone: newUser.phone,
      };

      const mockFetch = mock(() => {
        const responseBody = cbor.encode(createdUser);
        return Promise.resolve(
          new Response(responseBody, {
            status: 201,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.users.create(newUser);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith("/users")).toBe(true);
      expect(options.method).toBe("PUT");

      // Verify that the request body would be encoded with the user data
      // We're not directly testing the encoding since that's handled by our mock
      expect(result.data).toEqual(createdUser);
      expect(result.statusCode).toBe(201);
    });

    test("api.users.get should fetch a specific user", async () => {
      const userId = 1;
      const user = { ...mockUserData[0] };

      const mockFetch = mock(() => {
        const responseBody = cbor.encode(user);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.users.get(userId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith(`/user/${userId}`)).toBe(true);
      expect(options.method).toBe("GET");
      expect(result.data).toEqual(user);
      expect(result.statusCode).toBe(200);
    });

    test("api.users.destroy should delete a user", async () => {
      const userId = 1;

      const mockFetch = mock(() => {
        return Promise.resolve(
          new Response(null, {
            status: 204,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.users.destroy(userId);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith(`/user/${userId}`)).toBe(true);
      expect(options.method).toBe("DELETE");
      expect(result.data).toBeNull();
      expect(result.statusCode).toBe(204);
    });

    test("api.users.update should update an existing user", async () => {
      const updatedUser: UserUpdateRequest = {
        id: 1,
        username: "johndoe",
        realname: "John Updated Doe",
        email: "john.updated@example.com",
        phone: "+9876543210",
      };

      const mockFetch = mock(() => {
        const responseBody = cbor.encode(updatedUser);
        return Promise.resolve(
          new Response(responseBody, {
            status: 200,
            headers: { "Content-Type": "application/cbor" },
          })
        );
      });
      globalThis.fetch = mockFetch;

      const result = await api.users.update(updatedUser);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith(`/user/${updatedUser.id}`)).toBe(true);
      expect(options.method).toBe("POST");
      expect(result.data).toEqual(updatedUser);
      expect(result.statusCode).toBe(200);
    });

    test("api.users.update should handle errors properly", async () => {
      const updatedUser: UserUpdateRequest = {
        id: 1,
        username: "johndoe",
        realname: "John Updated Doe",
        email: "john.updated@example.com",
        phone: "+9876543210",
      };

      const errorData = {
        message: "User not found",
        code: "NOT_FOUND",
        details: { id: updatedUser.id },
      };

      const mockFetch = mock(() => {
        const response = new Response(JSON.stringify(errorData), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
        return Promise.resolve(response);
      });
      globalThis.fetch = mockFetch;

      await expect(api.users.update(updatedUser)).rejects.toThrow(ApiError);

      // Create a fresh mock for the second assertion
      const mockFetch2 = mock(() => {
        const response = new Response(JSON.stringify(errorData), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
        return Promise.resolve(response);
      });
      globalThis.fetch = mockFetch2;

      try {
        await api.users.update(updatedUser);
        fail("Expected api.users.update to throw an error");
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe("User not found");
        } else {
          fail("Error is not an ApiError");
        }
      }
    });

    test("api.users.update should handle validation errors", async () => {
      const updatedUser: UserUpdateRequest = {
        id: 1,
        username: "johndoe",
        // Missing required fields to trigger validation error
        realname: "",
        email: "invalid-email",
      };

      const validationErrorData = {
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        details: {
          fields: {
            email: "Invalid email format",
            realname: "Realname cannot be empty",
          },
        },
      };

      const mockFetch = mock(() => {
        // Make sure we're using the property names expected by the ApiError constructor
        const response = new Response(
          JSON.stringify({
            message: "Validation failed",
            errorCode: "VALIDATION_ERROR",
            details: validationErrorData.details,
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
        return Promise.resolve(response);
      });
      globalThis.fetch = mockFetch;

      await expect(api.users.update(updatedUser)).rejects.toThrow(ApiError);

      // Create a fresh mock for the detailed assertion
      const mockFetch2 = mock(() => {
        // Make sure we're using the property names expected by the ApiError constructor
        const response = new Response(
          JSON.stringify({
            message: "Validation failed",
            errorCode: "VALIDATION_ERROR",
            details: validationErrorData.details,
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
        return Promise.resolve(response);
      });
      globalThis.fetch = mockFetch2;

      try {
        await api.users.update(updatedUser);
        fail("Expected api.users.update to throw a validation error");
      } catch (error) {
        expect(error instanceof ApiError).toBe(true);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(422);
          expect(error.message).toBe("Validation failed");
          expect(error.errorCode).toBe("VALIDATION_ERROR");
          expect(error.details).toEqual(validationErrorData.details);
        } else {
          fail("Error is not an ApiError");
        }
      }
    });
  });

  describe("Session management API", () => {
    test("api.session.login should send CBOR data and return token", async () => {
      const tokenResponse = { token: "test-jwt-token" };
      const mockFetch = mock(() => {
        const responseBody = cbor.encode(tokenResponse);
        return Promise.resolve(new Response(responseBody, {
          status: 200,
          headers: { "Content-Type": "application/cbor" }
        }));
      });
      globalThis.fetch = mockFetch;

      const loginData: Login = { username: "testuser", password: "testpass" };
      const result = await api.session.login(loginData);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url.endsWith("/session/login")).toBe(true);
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/cbor");
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(tokenResponse);
    });
  });

  describe("ApiError", () => {
    test("should create an ApiError with minimal params", () => {
      const error = new ApiError("Test error", 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ApiError");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
    });

    test("should create an ApiError with all params", () => {
      const details = { field: "email", issue: "required" };
      const error = new ApiError("Validation error", 422, "VALIDATION_FAILED", details);

      expect(error.message).toBe("Validation error");
      expect(error.statusCode).toBe(422);
      expect(error.errorCode).toBe("VALIDATION_FAILED");
      expect(error.details).toBe(details);
    });
  });
});
