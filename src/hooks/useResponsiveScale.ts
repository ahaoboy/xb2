import { useSettingsStore } from "../store/settingsStore";

/**
 * Returns the user-adjustable UI scale (1 = default). The scale is set from
 * the header slider and drives the root font size plus chart layouts, so
 * users can tune everything to their screen.
 */
export function useResponsiveScale(): number {
  return useSettingsStore((state) => state.uiScale);
}
