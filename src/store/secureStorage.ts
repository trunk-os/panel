import secureLocalStorage from "react-secure-storage";
import type { PersistStorage, StorageValue } from "zustand/middleware";

export const createSecureStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): StorageValue<T> | null => {
    try {
      const value = secureLocalStorage.getItem(name);
      return value ? (String(value) as unknown as StorageValue<T>) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<T>): void => {
    try {
      secureLocalStorage.setItem(name, value as unknown as string);
    } catch {
      // Silently fail
    }
  },
  removeItem: (name: string): void => {
    try {
      secureLocalStorage.removeItem(name);
    } catch {
      // Silently fail
    }
  },
});