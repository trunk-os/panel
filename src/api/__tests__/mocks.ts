// Mock data for API client tests
import type { UserData, UserCreateRequest } from "../types";
import type { Service, Package, ServiceLog, Prompt, PromptType } from "@/types/services";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface SystemStatusResponse {
  status: string;
  message: string;
  uptime: number;
  version: string;
  services: Array<{
    name: string;
    status: string;
    message?: string;
  }>;
  timestamp: string;
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

// Mock services data
export const mockServices: Service[] = [
  {
    id: "web-server-1",
    name: "nginx-web.service",
    load_state: "loaded",
    active_state: "active",
    sub_state: "running",
    description: "High-performance HTTP server and reverse proxy",
    object_path: "/org/freedesktop/systemd1/unit/nginx_2dweb_2eservice",
    version: "1.21.6",
    status: "running",
    uptime: 86400,
    createdAt: "2024-01-15T10:30:00Z",
    lastStarted: "2024-01-15T10:30:00Z",
    volumeRoot: "/var/lib/services/nginx-web",
    packageName: "nginx",
  },
  {
    id: "db-postgres-1",
    name: "postgres-main.service",
    load_state: "loaded",
    active_state: "active",
    sub_state: "running",
    description: "Advanced open-source relational database",
    object_path: "/org/freedesktop/systemd1/unit/postgres_2dmain_2eservice",
    version: "14.9",
    status: "running",
    uptime: 172800,
    createdAt: "2024-01-10T08:15:00Z",
    lastStarted: "2024-01-12T14:20:00Z",
    volumeRoot: "/var/lib/services/postgres-main",
    packageName: "postgresql",
  },
  {
    id: "redis-cache-1",
    name: "redis-cache.service",
    load_state: "loaded",
    active_state: "inactive",
    sub_state: "dead",
    description: "In-memory data structure store, used as database, cache, and message broker",
    object_path: "/org/freedesktop/systemd1/unit/redis_2dcache_2eservice",
    version: "7.0.12",
    status: "stopped",
    uptime: 0,
    createdAt: "2024-01-18T16:45:00Z",
    volumeRoot: "/var/lib/services/redis-cache",
    packageName: "redis",
  },
  {
    id: "monitoring-1",
    name: "prometheus.service",
    load_state: "loaded",
    active_state: "failed",
    sub_state: "failed",
    description: "Systems monitoring and alerting toolkit",
    object_path: "/org/freedesktop/systemd1/unit/prometheus_2eservice",
    version: "2.40.0",
    status: "error",
    uptime: 0,
    createdAt: "2024-01-20T12:00:00Z",
    lastStarted: "2024-01-20T12:00:00Z",
    volumeRoot: "/var/lib/services/prometheus",
    packageName: "prometheus",
  },
];

// Mock packages data
export const mockPackages: Package[] = [
  {
    name: "nginx",
    description: "High-performance HTTP server and reverse proxy",
    version: "1.21.6",
    category: "Web Server",
  },
  {
    name: "postgresql",
    description: "Advanced open-source relational database",
    version: "14.9",
    category: "Database",
  },
  {
    name: "redis",
    description: "In-memory data structure store, used as database, cache, and message broker",
    version: "7.0.12",
    category: "Cache",
  },
  {
    name: "prometheus",
    description: "Systems monitoring and alerting toolkit",
    version: "2.40.0",
    category: "Monitoring",
  },
  {
    name: "grafana",
    description: "Open observability platform for monitoring and alerting",
    version: "9.5.0",
    category: "Monitoring",
  },
  {
    name: "docker-registry",
    description: "Docker image registry for private container storage",
    version: "2.8.2",
    category: "Container",
  },
];

// Mock service logs
export const mockServiceLogs: ServiceLog[] = [
  {
    timestamp: "2024-01-22T10:30:15Z",
    level: "info",
    message: "Server started successfully on port 80",
    source: "nginx",
  },
  {
    timestamp: "2024-01-22T10:30:20Z",
    level: "info",
    message: "Configuration loaded from /etc/nginx/nginx.conf",
    source: "nginx",
  },
  {
    timestamp: "2024-01-22T11:15:30Z",
    level: "warn",
    message: "High memory usage detected: 85%",
    source: "system",
  },
  {
    timestamp: "2024-01-22T11:45:00Z",
    level: "error",
    message: "Failed to connect to upstream server",
    source: "nginx",
  },
  {
    timestamp: "2024-01-22T12:00:00Z",
    level: "info",
    message: "Upstream server connection restored",
    source: "nginx",
  },
];

// Mock configuration prompts
export const mockPrompts: Record<string, Prompt[]> = {
  postgresql: [
    {
      template: "database_name",
      question: "Database name",
      input_type: 2, // String
    },
    {
      template: "port",
      question: "Port number",
      input_type: 0, // Integer
    },
    {
      template: "max_connections",
      question: "Maximum connections",
      input_type: 0, // Integer
    },
    {
      template: "enable_ssl",
      question: "Enable SSL encryption",
      input_type: 3, // Boolean
    },
  ],
  nginx: [
    {
      template: "server_name",
      question: "Server name (domain)",
      input_type: 2, // String
    },
    {
      template: "port",
      question: "Listen port",
      input_type: 0, // Integer
    },
    {
      template: "enable_ssl",
      question: "Enable HTTPS",
      input_type: 3, // Boolean
    },
  ],
  redis: [
    {
      template: "port",
      question: "Redis port",
      input_type: 0, // Integer
    },
    {
      template: "max_memory",
      question: "Maximum memory (MB)",
      input_type: 0, // Integer
    },
    {
      template: "enable_persistence",
      question: "Enable data persistence",
      input_type: 3, // Boolean
    },
  ],
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
