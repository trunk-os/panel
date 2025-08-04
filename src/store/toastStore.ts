import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  autoHideDuration?: number;
  errorId?: string;
}

export interface StoredError {
  id: string;
  timestamp: number;
  title?: string;
  detail?: string;
  type?: string;
  status?: number;
  fullData: unknown;
}

interface ToastStore {
  toasts: Toast[];
  errors: StoredError[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  storeError: (error: StoredError) => void;
  getError: (id: string) => StoredError | undefined;
}

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  errors: [],
  showToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: generateId(),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
  storeError: (error) =>
    set((state) => ({
      errors: [error, ...state.errors.slice(0, 49)], // Keep last 50 errors
    })),
  getError: (id) => get().errors.find((error) => error.id === id),
}));
