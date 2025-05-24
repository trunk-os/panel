// API response types

export interface SystemStatusResponse {
  status: "ok" | "error" | "warning";
  message?: string;
  uptime?: number;
  version?: string;
  services?: {
    name: string;
    status: "ok" | "error" | "warning";
    message?: string;
  }[];
  timestamp: string;
}

export interface SystemStatus {
  status: "ok" | "error" | "warning";
  message?: string;
  uptime?: number;
  version?: string;
  services?: {
    name: string;
    status: "ok" | "error" | "warning";
    message?: string;
  }[];
  timestamp: Date;
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
  quota?: string;
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
