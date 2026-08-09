import { useMediaQuery } from "@mui/material";
import { useSettingsStore } from "../store/settingsStore";

export type ResolvedThemeMode = "light" | "dark";

/**
 * Resolves the active color scheme. `system` follows the browser's
 * `prefers-color-scheme` setting and stays reactive to OS changes.
 */
export function useResolvedThemeMode(): ResolvedThemeMode {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  return themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
}
