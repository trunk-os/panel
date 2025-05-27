import { create } from "zustand";

interface ConnectionState {
  lastConnectionError: Date | null;
  setConnectionError: () => void;
  clearConnectionError: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  lastConnectionError: null,

  setConnectionError: () => {
    set({ lastConnectionError: new Date() });
  },

  clearConnectionError: () => {
    set({ lastConnectionError: null });
  },
}));