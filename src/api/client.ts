import { decode, encode } from "cbor2";
import type {
  ApiResponse,
  ZFSEntry,
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
  AuditLog,
  Pagination,
  PingResult,
} from "./types";
import type {
  Service,
  SystemdUnit,
  UnitSettings,
  LogParameters,
  LogMessage,
  Package,
  PackageTitle,
  PromptCollection,
  Prompt,
  PromptResponses,
  PromptResponsesWithName,
  ServiceLog,
  PackageSearchParams,
} from "@/types/services";
import { ApiError, handleApiErrorResponse } from "./errors";
import { useAuthStore } from "@/store/authStore";
import { useConnectionStore } from "@/store/connectionStore";
import {
  mapRuntimeStateToActiveState,
  mapEnabledStateToLoadState,
  mapLastRunStateToSubState,
  mapSystemdStateToServiceStatus,
  extractPackageNameFromUnit,
  mapPriorityToLevel,
} from "@/lib/mappers";

import { config } from '@/config';

const API_BASE_URL = config.API_BASE_URL || "http://localhost:5309";

// Backend unit structure (as actually received)
interface BackendUnit {
  name: string;
  description: string;
  enabled_state: string;
  object_path: string;
  status: {
    runtime_state: string;
    last_run_state: string;
  };
}


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
    if (
      error instanceof Error &&
      (error.message.includes("ERR_CONNECTION_REFUSED") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ERR_NETWORK") ||
        (error.message.includes("Failed to fetch") &&
          !error.message.includes("404") &&
          !error.message.includes("401")))
    ) {
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
    ping: () => api.get<PingResult | null>("/status/ping"),
    log: (pagination: Pagination, options?: RequestInit) =>
      api.post<AuditLog[]>("/status/log", pagination, options),
  },

  zfs: {
    list: (filter = "", options?: RequestInit) =>
      api.post<ZFSEntry[]>("/zfs/list", filter, options),
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
    list: (pagination?: Pagination, options?: RequestInit) =>
      api.post<UserList>("/users", pagination || {}, options),
    create: (user: UserCreateRequest, options?: RequestInit) =>
      api.put<UserData>("/users", { id: 0, ...user }, options),
    update: (user: UserUpdateRequest, options?: RequestInit) =>
      api.post<UserUpdateRequest>(`/user/${user.id}`, user, options),
    get: (userId: number, options?: RequestInit) => api.get<UserData>(`/user/${userId}`, options),
    destroy: (userId: number, options?: RequestInit) => api.delete(`/user/${userId}`, options),
    restore: (userId: number, options?: RequestInit) =>
      api.post<UserData>(`/user/${userId}/restore`, {}, options),
  },
  session: {
    login: (login: Login, options?: RequestInit) =>
      api.post<Token>("/session/login", login, options),
    me: (options?: RequestInit) => api.get<UserData>("/session/me", options),
  },

  services: {
    list: async (options?: RequestInit): Promise<ApiResponse<Service[]>> => {
      // Convert systemd units to services
      const unitsResponse = await api.post<BackendUnit[]>("/systemd/list", null, options);
      
      console.log(`[DEBUG] Backend returned ${unitsResponse.data.length} units total`);
      
      // Filter and log container services specifically
      const containerUnits = unitsResponse.data.filter(unit => 
        unit.name.includes('libpod-') || 
        unit.name.includes('gild') || 
        unit.name.includes('charond') || 
        unit.name.includes('buckled') ||
        unit.name.includes('caddy')
      );
      console.log(`[DEBUG] Found ${containerUnits.length} container units:`, containerUnits.map(u => u.name));
      
      const services: Service[] = unitsResponse.data.map((unit) => {
        
        // Try to access the actual structure
        const runtimeState = unit.status?.runtime_state;
        const lastRunState = unit.status?.last_run_state;
        
        // Log container services specifically
        if (unit.name.includes('libpod-') || unit.name.includes('gild') || unit.name.includes('charond') || unit.name.includes('buckled') || unit.name.includes('caddy')) {
          console.log(`[DEBUG] CONTAINER Unit ${unit.name}:`, {
            name: unit.name,
            description: unit.description,
            enabled_state: unit.enabled_state,
            object_path: unit.object_path,
            runtime_state: runtimeState,
            last_run_state: lastRunState
          });
        }
        
        // Map enum values to systemd state strings
        const activeState = mapRuntimeStateToActiveState(runtimeState);
        const subState = mapLastRunStateToSubState(lastRunState);
        
        const finalStatus = mapSystemdStateToServiceStatus(activeState, subState);
        
        const service = {
          ...unit,
          id: unit.name,
          load_state: mapEnabledStateToLoadState(unit.enabled_state || "Disabled"),
          active_state: activeState,
          sub_state: subState,
          status: finalStatus,
          packageName: extractPackageNameFromUnit(unit.name),
        };
        
        // Log container services after transformation
        if (unit.name.includes('libpod-') || unit.name.includes('gild') || unit.name.includes('charond') || unit.name.includes('buckled') || unit.name.includes('caddy')) {
          console.log("[DEBUG] CONTAINER Service transformed:", service);
        }
        
        return service;
      });
      
      console.log(`[DEBUG] Returning ${services.length} services total`);
      const containerServices = services.filter(s => 
        s.name.includes('libpod-') || 
        s.name.includes('gild') || 
        s.name.includes('charond') || 
        s.name.includes('buckled') ||
        s.name.includes('caddy')
      );
      console.log(`[DEBUG] Container services in final array: ${containerServices.length}`, containerServices.map(s => s.name));
      
      return { data: services, statusCode: unitsResponse.statusCode };
    },
    
    start: (serviceId: string, options?: RequestInit) =>
      api.post<void>("/systemd/set_unit", { name: serviceId, action: "start" }, options),
    
    stop: (serviceId: string, options?: RequestInit) =>
      api.post<void>("/systemd/set_unit", { name: serviceId, action: "stop" }, options),
    
    restart: (serviceId: string, options?: RequestInit) =>
      api.post<void>("/systemd/set_unit", { name: serviceId, action: "restart" }, options),
    
    delete: async (serviceId: string, options?: RequestInit): Promise<ApiResponse<void>> => {
      // Extract package info from service name and uninstall
      const packageName = extractPackageNameFromUnit(serviceId);
      const version = "latest"; // Default version, could be extracted from unit metadata
      return api.post<void>("/packages/uninstall", { name: packageName, version }, options);
    },
    
    logs: async (serviceId: string, count = 10, cursor?: string, direction?: "forward" | "backward", options?: RequestInit): Promise<ApiResponse<ServiceLog[]>> => {
      const logsResponse = await api.post<LogMessage[]>("/systemd/log", { 
        name: serviceId, 
        count,
        cursor,
        direction 
      }, options);
      const serviceLogs: ServiceLog[] = logsResponse.data.map(log => ({
        timestamp: log.timestamp,
        level: mapPriorityToLevel(log.priority),
        message: log.message,
        source: log.unit,
      }));
      return { data: serviceLogs, statusCode: logsResponse.statusCode };
    },
  },

  packages: {
    getPrompts: (pkg: PackageTitle, options?: RequestInit) =>
      api.post<PromptCollection>("/packages/prompts", pkg, options),
    setResponses: (responses: PromptResponsesWithName, options?: RequestInit) =>
      api.post<void>("/packages/set_responses", responses, options),
    getResponses: (pkg: PackageTitle, options?: RequestInit) =>
      api.post<PromptResponses>("/packages/get_responses", pkg, options),
    listInstalled: (options?: RequestInit) =>
      api.get<PackageTitle[]>("/packages/list_installed", options),
    installed: (pkg: PackageTitle, options?: RequestInit) =>
      api.post<boolean>("/packages/installed", pkg, options),
    install: (pkg: PackageTitle, options?: RequestInit) =>
      api.post<void>("/packages/install", pkg, options),
    uninstall: (pkg: PackageTitle, options?: RequestInit) =>
      api.post<void>("/packages/uninstall", pkg, options),
  },
};

export const systemd = {
  listUnits: (filter?: string, options?: RequestInit) =>
    api.post<SystemdUnit[]>("/systemd/list", filter || null, options),
  setUnit: (settings: UnitSettings, options?: RequestInit) =>
    api.post<void>("/systemd/set_unit", settings, options),
  unitLog: (params: LogParameters, options?: RequestInit) =>
    api.post<LogMessage[]>("/systemd/log", params, options),
};
