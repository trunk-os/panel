interface MetricHistory {
  cpuHistory: number[];
  memoryHistory: number[];
}

interface StoredMetricHistory extends MetricHistory {
  lastUpdated: number;
  version: number;
}

const STORAGE_KEY = "trunk_admin_metric_history";
const STORAGE_VERSION = 1;
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes - data older than this is considered stale

export class MetricHistoryStorage {
  static save(metricHistory: MetricHistory): void {
    try {
      const dataToStore: StoredMetricHistory = {
        ...metricHistory,
        lastUpdated: Date.now(),
        version: STORAGE_VERSION,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn("Failed to save metric history to localStorage:", error);
    }
  }

  static load(): MetricHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getEmptyHistory();
      }

      const data: StoredMetricHistory = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== STORAGE_VERSION) {
        console.warn("Metric history version mismatch, clearing storage");
        this.clear();
        return this.getEmptyHistory();
      }

      // Check if data is too old
      const age = Date.now() - data.lastUpdated;
      if (age > MAX_AGE_MS) {
        console.info("Metric history is stale, clearing storage");
        this.clear();
        return this.getEmptyHistory();
      }

      // Validate data structure
      if (!Array.isArray(data.cpuHistory) || !Array.isArray(data.memoryHistory)) {
        console.warn("Invalid metric history data structure, clearing storage");
        this.clear();
        return this.getEmptyHistory();
      }

      return {
        cpuHistory: data.cpuHistory,
        memoryHistory: data.memoryHistory,
      };
    } catch (error) {
      console.warn("Failed to load metric history from localStorage:", error);
      this.clear();
      return this.getEmptyHistory();
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear metric history from localStorage:", error);
    }
  }

  static getStorageSize(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Blob([stored]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  private static getEmptyHistory(): MetricHistory {
    return {
      cpuHistory: [],
      memoryHistory: [],
    };
  }

  static isDataFresh(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const data: StoredMetricHistory = JSON.parse(stored);
      const age = Date.now() - data.lastUpdated;
      return age <= MAX_AGE_MS;
    } catch (error) {
      return false;
    }
  }
}