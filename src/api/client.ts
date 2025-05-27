import { decode, encode } from "cbor2";
import type {
  ApiResponse,
  ZFSList,
  ZFSDataset,
  ZFSVolume,
  ZFSModifyDataset,
  ZFSModifyVolume,
  UserCreateRequest,
  UserList,
  UserData,
  UserUpdateRequest,
  Login,
  Token,
  SystemStatusResult,
  AuditLog,
  Pagination,
} from "./types";
import { ApiError, handleApiErrorResponse } from "./errors";
import { useAuthStore } from "@/store/authStore";
import { useConnectionStore } from "@/store/connectionStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5309";

const handleErrorResponse = async (response: Response) => {
  await handleApiErrorResponse(response, useAuthStore.getState().clearToken);
};

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/cbor, application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = useAuthStore.getState().getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  console.log("[fetchApi] Sending:", endpoint, options.method, options.body);

  try {
    if (options.body !== undefined) {
      requestOptions.body = encode(options.body);
      requestOptions.headers = {
        ...headers,
        "Content-Type": "application/cbor",
      };
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return { data: null as unknown as T, statusCode: response.status };
    }

    const contentType = response.headers.get("Content-Type") || "";
    let data: T;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("application/cbor")) {
      const buffer = await response.arrayBuffer();
      data = await decode(new Uint8Array(buffer));
    } else {
      const text = await response.text();
      data = (text.trim() === "" ? {} : text) as T;
    }
    console.log("[fetchApi] got ", response.status, data);
    return { data, statusCode: response.status };
  } catch (error) {
    // Check if this is a genuine connection refused error (server completely unreachable)
    if (error instanceof Error && 
        (error.message.includes("ERR_CONNECTION_REFUSED") || 
         error.message.includes("ECONNREFUSED") ||
         error.message.includes("ERR_NETWORK") ||
         (error.message.includes("Failed to fetch") && !error.message.includes("404") && !error.message.includes("401")))) {
      console.log("[fetchApi] Connection error detected:", error.message);
      useConnectionStore.getState().setConnectionError();
    }
    
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : "Network error", 0);
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: "POST", body: data as BodyInit }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: "PUT", body: data as BodyInit }),

  delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),

  status: {
    ping: () => api.get<SystemStatusResult>("/status/ping"),
    log: (pagination: Pagination, options?: RequestInit) =>
      api.post<AuditLog[]>("/status/log", pagination, options),
  },

  zfs: {
    list: (filter = "", options?: RequestInit) => api.post<ZFSList>("/zfs/list", filter, options),
    createDataset: (dataset: ZFSDataset, options?: RequestInit) =>
      api.post<void>("/zfs/create_dataset", dataset, options),
    createVolume: (volume: ZFSVolume, options?: RequestInit) =>
      api.post<void>("/zfs/create_volume", volume, options),
    modifyDataset: (request: ZFSModifyDataset, options?: RequestInit) =>
      api.post<void>("/zfs/modify_dataset", request, options),
    modifyVolume: (request: ZFSModifyVolume, options?: RequestInit) =>
      api.post<void>("/zfs/modify_volume", request, options),
    destroy: (name: string, options?: RequestInit) => api.post<void>("/zfs/destroy", name, options),
  },
  users: {
    list: (options?: RequestInit) => api.get<UserList>("/users", options),
    create: (user: UserCreateRequest, options?: RequestInit) =>
      api.put<UserData>("/users", { id: 0, ...user }, options),
    update: (user: UserUpdateRequest, options?: RequestInit) =>
      api.post<UserUpdateRequest>(`/user/${user.id}`, user, options),
    get: (userId: number, options?: RequestInit) => api.get<UserData>(`/user/${userId}`, options),
    destroy: (userId: number, options?: RequestInit) => api.delete(`/user/${userId}`, options),
  },
  session: {
    login: (login: Login, options?: RequestInit) =>
      api.post<Token>("/session/login", login, options),
    me: (options?: RequestInit) => api.get<UserData>("/session/me", options),
  },
};
