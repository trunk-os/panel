// Mock data for API client tests
import type { SystemStatusResponse, UserData, UserCreateRequest } from "../types";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Mock user data based on the app's UserData type
export const mockUserData: UserData[] = [
  {
    id: 1,
    username: "johndoe",
    realname: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
  },
  {
    id: 2,
    username: "janesmith",
    realname: "Jane Smith",
    email: "jane.smith@example.com",
  },
  {
    id: 3,
    username: "robert_johnson",
    realname: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "+9876543210",
  },
];

// Mock user create request
export const mockUserCreateRequest: UserCreateRequest = {
  username: "newuser",
  password: "password123",
  realname: "New User",
  email: "new.user@example.com",
  phone: "+11223344556",
};

export const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "user",
  },
];

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export const mockErrors = {
  notFound: {
    message: "Resource not found",
    code: "NOT_FOUND",
  },
  unauthorized: {
    message: "Authentication required",
    code: "UNAUTHORIZED",
  },
  validation: {
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    details: {
      fields: {
        email: "Email is required",
        password: "Password must be at least 8 characters",
      },
    },
  },
  server: {
    message: "Internal server error",
    code: "SERVER_ERROR",
  },
};

// System status mocks
export const mockStatusResponse: SystemStatusResponse = {
  status: "ok",
  message: "All systems operational",
  uptime: 1209600, // 2 weeks in seconds
  version: "1.0.0",
  services: [
    {
      name: "Database",
      status: "ok",
    },
    {
      name: "Storage",
      status: "ok",
    },
    {
      name: "Authentication",
      status: "ok",
    },
  ],
  timestamp: new Date().toISOString(),
};

// Mock warning state
export const mockStatusWarningResponse: SystemStatusResponse = {
  status: "warning",
  message: "Some services experiencing degraded performance",
  uptime: 86400, // 1 day in seconds
  version: "1.0.0",
  services: [
    {
      name: "Database",
      status: "ok",
    },
    {
      name: "Storage",
      status: "warning",
      message: "High latency detected",
    },
    {
      name: "Authentication",
      status: "ok",
    },
  ],
  timestamp: new Date().toISOString(),
};

// Mock error state
export const mockStatusErrorResponse: SystemStatusResponse = {
  status: "error",
  message: "Critical system failure detected",
  uptime: 3600, // 1 hour in seconds
  version: "1.0.0",
  services: [
    {
      name: "Database",
      status: "error",
      message: "Connection failed",
    },
    {
      name: "Storage",
      status: "warning",
      message: "High latency detected",
    },
    {
      name: "Authentication",
      status: "ok",
    },
  ],
  timestamp: new Date().toISOString(),
};

// Helper to create mock response objects
export function createMockResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
