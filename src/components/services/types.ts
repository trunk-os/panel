import type { Service } from "@/types/services";

export type ServiceColumn = keyof Service | "actions";

export interface ColumnConfig {
  key: ServiceColumn;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (service: Service) => React.ReactNode;
}

export interface ServicesTableConfig {
  visibleColumns: ServiceColumn[];
  columnOrder: ServiceColumn[];
  columnConfigs: Record<ServiceColumn, ColumnConfig>;
}

export const DEFAULT_VISIBLE_COLUMNS: ServiceColumn[] = ["status", "description", "actions"];

export const DEFAULT_COLUMN_ORDER: ServiceColumn[] = [
  "status",
  "name",
  "description",
  "version",
  "uptime",
  "createdAt",
  "lastStarted",
  "packageName",
  "id",
  "volumeRoot",
  "load_state",
  "active_state",
  "sub_state",
  "following",
  "object_path",
  "job_id",
  "job_type",
  "job_object_path",
  "actions",
];

export const ALL_AVAILABLE_COLUMNS: ServiceColumn[] = [
  "status",
  "name",
  "description",
  "version",
  "uptime",
  "createdAt",
  "lastStarted",
  "packageName",
  "id",
  "volumeRoot",
  "load_state",
  "active_state",
  "sub_state",
  "following",
  "object_path",
  "job_id",
  "job_type",
  "job_object_path",
  "actions",
];

export const COLUMN_LABELS: Record<ServiceColumn, string> = {
  id: "ID",
  name: "Name",
  version: "Version",
  description: "Description",
  status: "Status",
  uptime: "Uptime",
  createdAt: "Created",
  lastStarted: "Last Started",
  volumeRoot: "Volume Root",
  packageName: "Package",
  load_state: "Load State",
  active_state: "Active State",
  sub_state: "Sub State",
  following: "Following",
  object_path: "Object Path",
  job_id: "Job ID",
  job_type: "Job Type",
  job_object_path: "Job Object Path",
  actions: "Actions",
};
