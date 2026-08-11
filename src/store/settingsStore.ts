import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserLanguage, type Language } from "../i18n";
import type { AutofillStrategy } from "../utils/autofill";

export type ThemeMode = "system" | "light" | "dark";

interface SettingsState {
  /** Preferred color theme; 'system' follows the browser configuration. */
  themeMode: ThemeMode;
  /** Preferred UI language; defaults to the browser configuration. */
  language: Language;
  /** Auto-fill optimization preference. */
  autofillStrategy: AutofillStrategy;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setAutofillStrategy: (strategy: AutofillStrategy) => void;
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
      autofillStrategy: "perfect",
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setAutofillStrategy: (autofillStrategy) => set({ autofillStrategy }),
    }),
    {
      name: "xb2-settings",
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        autofillStrategy: state.autofillStrategy,
      }),
    },
  ),
);
