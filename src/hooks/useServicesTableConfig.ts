import { useState, useEffect, useCallback } from "react";
import type { ServiceColumn } from "@/components/services/types";
import { DEFAULT_VISIBLE_COLUMNS, DEFAULT_COLUMN_ORDER } from "@/components/services/types";

const STORAGE_KEY = "services-table-config";

interface ServicesTableStorageConfig {
  visibleColumns: ServiceColumn[];
  columnOrder: ServiceColumn[];
}

export function useServicesTableConfig() {
  const [visibleColumns, setVisibleColumns] = useState<ServiceColumn[]>(DEFAULT_VISIBLE_COLUMNS);
  const [columnOrder, setColumnOrder] = useState<ServiceColumn[]>(DEFAULT_COLUMN_ORDER);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config: ServicesTableStorageConfig = JSON.parse(stored);

        // Validate that stored columns are still valid
        const validColumns = config.visibleColumns?.filter((col) =>
          DEFAULT_COLUMN_ORDER.includes(col)
        );
        const validOrder = config.columnOrder?.filter((col) => DEFAULT_COLUMN_ORDER.includes(col));

        if (validColumns?.length > 0) {
          setVisibleColumns(validColumns);
        }

        if (validOrder?.length > 0) {
          // Ensure all default columns are in the order, even if not in stored config
          const completeOrder = [
            ...validOrder,
            ...DEFAULT_COLUMN_ORDER.filter((col) => !validOrder.includes(col)),
          ];
          setColumnOrder(completeOrder);
        }
      }
    } catch (error) {
      console.warn("Failed to load services table config from localStorage:", error);
      // Continue with defaults
    }
  }, []);

  // Save config to localStorage whenever it changes
  const saveConfig = useCallback(
    (newVisibleColumns: ServiceColumn[], newColumnOrder: ServiceColumn[]) => {
      try {
        const config: ServicesTableStorageConfig = {
          visibleColumns: newVisibleColumns,
          columnOrder: newColumnOrder,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.warn("Failed to save services table config to localStorage:", error);
      }
    },
    []
  );

  const updateVisibleColumns = useCallback(
    (newColumns: ServiceColumn[]) => {
      setVisibleColumns(newColumns);
      saveConfig(newColumns, columnOrder);
    },
    [columnOrder, saveConfig]
  );

  const updateColumnOrder = useCallback(
    (newOrder: ServiceColumn[]) => {
      setColumnOrder(newOrder);
      saveConfig(visibleColumns, newOrder);
    },
    [visibleColumns, saveConfig]
  );

  const resetToDefaults = useCallback(() => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    setColumnOrder(DEFAULT_COLUMN_ORDER);
    saveConfig(DEFAULT_VISIBLE_COLUMNS, DEFAULT_COLUMN_ORDER);
  }, [saveConfig]);

  const clearStoredConfig = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
      setColumnOrder(DEFAULT_COLUMN_ORDER);
    } catch (error) {
      console.warn("Failed to clear services table config from localStorage:", error);
    }
  }, []);

  return {
    visibleColumns,
    columnOrder,
    updateVisibleColumns,
    updateColumnOrder,
    resetToDefaults,
    clearStoredConfig,
  };
}
