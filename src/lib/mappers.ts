/**
 * Mapping functions for converting backend state strings to frontend state representations
 */

/**
 * Maps runtime state strings from buckle backend to systemd active state
 */
export function mapRuntimeStateToActiveState(runtimeState: string): string {
  switch (runtimeState) {
    case "Started":
      return "active";
    case "Stopped":
      return "inactive";
    case "Restarted":
      return "active";
    case "Reloaded":
      return "active";
    default:
      return "inactive";
  }
}

/**
 * Maps enabled state strings to systemd load state
 */
export function mapEnabledStateToLoadState(enabledState: string): string {
  switch (enabledState) {
    case "Enabled":
      return "enabled";
    case "Disabled":
      return "disabled";
    case "Failed":
      return "failed";
    default:
      return "disabled";
  }
}

/**
 * Maps last run state to systemd sub state
 */
export function mapLastRunStateToSubState(lastRunState: string): string {
  switch (lastRunState) {
    case "Failed":
      return "failed";
    case "Dead":
      return "dead";
    case "Mounted":
      return "mounted";
    case "Running":
      return "running";
    case "Listening":
      return "listening";
    case "Plugged":
      return "plugged";
    case "Exited":
      return "exited";
    case "Active":
      return "running"; // Active services should be considered "running"
    case "Waiting":
      return "waiting";
    default:
      return "dead";
  }
}

/**
 * Maps systemd states to service status for UI representation
 */
export function mapSystemdStateToServiceStatus(
  activeState: string,
  subState: string
): "running" | "stopped" | "error" | "installing" | "configuring" {
  switch (activeState) {
    case "active":
      return subState === "running" ? "running" : "configuring";
    case "inactive":
      return "stopped";
    case "failed":
      return "error";
    case "activating":
      return "installing";
    case "deactivating":
      return "configuring";
    default:
      return "stopped";
  }
}

/**
 * Extracts package name from systemd unit name
 */
export function extractPackageNameFromUnit(unitName: string): string {
  return unitName.replace(/\.(service|timer|socket|target)$/, "");
}

/**
 * Maps systemd journal priority numbers to log levels
 */
export function mapPriorityToLevel(priority?: number): "info" | "warn" | "error" | "debug" {
  if (!priority) return "info";

  // Systemd journal priorities (RFC 3164)
  // 0-2: error, 3: error, 4: warn, 5-6: info, 7: debug
  if (priority <= 3) return "error";
  if (priority === 4) return "warn";
  if (priority <= 6) return "info";
  return "debug";
}
