import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserLanguage, type Language } from "../i18n";

export type ThemeMode = "system" | "light" | "dark";

interface SettingsState {
  /** Preferred color theme; 'system' follows the browser configuration. */
  themeMode: ThemeMode;
  /** Preferred UI language; defaults to the browser configuration. */
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
}

/**
 * Global app settings. Persisted to localStorage; defaults follow the
 * browser configuration (prefers-color-scheme / navigator.language).
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      language: detectBrowserLanguage(),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "xb2-settings",
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
      }),
    },
  ),
);
