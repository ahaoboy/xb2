import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserLanguage, type Language } from "../i18n";
import type { AutofillStrategy } from "../utils/autofill";

export type ThemeMode = "system" | "light" | "dark";

/** Range for the user-adjustable UI scale. */
export const UI_SCALE_MIN = 0.5;
export const UI_SCALE_MAX = 2.5;
/** Step for the +/- scale stepper. */
export const UI_SCALE_STEP = 0.1;

interface SettingsState {
  /** Preferred color theme; 'system' follows the browser configuration. */
  themeMode: ThemeMode;
  /** Preferred UI language; defaults to the browser configuration. */
  language: Language;
  /** Auto-fill optimization preference. */
  autofillStrategy: AutofillStrategy;
  /** Use the plan page's party data in the charts (markers/highlights). */
  chartsUsePlanData: boolean;
  /** User-adjusted UI scale (1 = default). Replaces the auto media-query scale. */
  uiScale: number;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setAutofillStrategy: (strategy: AutofillStrategy) => void;
  setChartsUsePlanData: (use: boolean) => void;
  setUiScale: (scale: number) => void;
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
      chartsUsePlanData: false,
      uiScale: 1,
      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setAutofillStrategy: (autofillStrategy) => set({ autofillStrategy }),
      setChartsUsePlanData: (chartsUsePlanData) => set({ chartsUsePlanData }),
      setUiScale: (uiScale) =>
        set({ uiScale: Math.min(UI_SCALE_MAX, Math.max(UI_SCALE_MIN, uiScale)) }),
    }),
    {
      name: "xb2-settings",
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        autofillStrategy: state.autofillStrategy,
        chartsUsePlanData: state.chartsUsePlanData,
        uiScale: state.uiScale,
      }),
    },
  ),
);
