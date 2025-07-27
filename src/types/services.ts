export interface SystemdUnit {
  name: string;
  load_state: string;
  active_state: string;
  sub_state: string;
  description: string;
  following?: string;
  object_path: string;
  job_id?: number;
  job_type?: string;
  job_object_path?: string;
}

export interface Service extends SystemdUnit {
  id: string;
  version?: string;
  uptime?: number;
  createdAt?: string;
  lastStarted?: string;
  volumeRoot?: string;
  packageName?: string;
  status: "running" | "stopped" | "error" | "installing" | "configuring";
}

export interface UnitSettings {
  name: string;
  action: "start" | "stop" | "restart" | "enable" | "disable" | "reload";
}

export interface LogParameters {
  name: string;
  count: number;
  cursor?: string;
  direction?: "forward" | "backward";
}

export interface LogMessage {
  timestamp: string;
  message: string;
  priority?: number;
  unit?: string;
}

export interface PackageTitle {
  name: string;
  version: string;
}

export interface Package {
  name: string;
  version: string;
  description: string;
  category?: string;
}

export interface PromptCollection {
  prompts: Prompt[];
}

export enum PromptType {
  Integer = 0,
  SignedInteger = 1,
  String = 2,
  Boolean = 3,
}

export interface Prompt {
  template: string;
  question: string;
  input_type: string;
}

export interface PromptResponse {
  template: string;
  response: string;
}

export interface PromptResponses {
  responses: PromptResponse[];
}

export interface PromptResponsesWithName {
  name: string;
  responses: PromptResponse[];
}

export interface ServiceLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  source?: string;
}

export interface PackageSearchParams {
  query?: string;
  category?: string;
  page?: number;
  per_page?: number;
}

export interface ServiceAction {
  type: "start" | "stop" | "restart" | "delete";
  serviceId: string;
}
