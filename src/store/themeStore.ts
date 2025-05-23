import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
};

const initialTheme = getSystemTheme();

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  syncWithSystemTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: initialTheme,
      toggleTheme: () => set((state) => ({ mode: state.mode === "light" ? "dark" : "light" })),
      setTheme: (mode) => set({ mode }),
      syncWithSystemTheme: () => set({ mode: getSystemTheme() }),
    }),
    {
      name: "trunk-admin-theme",
    }
  )
);

if (typeof window !== "undefined" && window.matchMedia) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleThemeChange = () => {
    useThemeStore.getState().syncWithSystemTheme();
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleThemeChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleThemeChange);
  }
}
