// API response types

/**
 * Standard API response wrapper with data and status code
 */
export type ApiResponse<T> = {
  data: T;
  statusCode: number;
};

export interface SystemStatus {
  uptime: number;
  available_memory: number;
  total_memory: number;
  cpus: number;
  cpu_usage: number;
  host_name: string;
  kernel_version: string;
  load_average: number[];
  processes: number;
  total_disk: number;
  available_disk: number;
}
export interface SystemStatusResult {
  info: SystemStatus;
}

export type ZFSType = "Dataset" | "Volume";

export interface ZFSEntry {
  kind: ZFSType;
  name: string;
  full_name: string;
  size: number;
  used: number;
  avail: number;
  refer: number;
  mountpoint?: string;
}

export interface ZFSListFilter {
  filter: string;
}

export interface ZFSList {
  entries: ZFSEntry[];
}

export interface ZFSName {
  name: string;
}

export interface ZFSDataset {
  name: string;
  quota?: number;
}

export interface ZFSVolume {
  name: string;
  size: number;
}

export interface UserData {
  id: number;
  username: string;
  realname?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface UserCreateRequest extends Omit<UserData, "id"> {
  password: string;
}

export interface UserUpdateRequest extends UserData {
  password?: string;
}

export type UserList = Array<UserData>;

export interface Login {
  username: string;
  password: string;
}

export interface Token {
  token: string;
}
