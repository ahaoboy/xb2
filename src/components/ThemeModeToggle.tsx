import type { MouseEvent, ReactElement } from "react";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTranslation } from "react-i18next";
import { useSettingsStore, type ThemeMode } from "../store/settingsStore";

const OPTIONS: { value: ThemeMode; icon: ReactElement }[] = [
  { value: "system", icon: <BrightnessAutoIcon fontSize="small" /> },
  { value: "light", icon: <LightModeIcon fontSize="small" /> },
  { value: "dark", icon: <DarkModeIcon fontSize="small" /> },
];

/** Theme switch: System (browser default) / Light / Dark. */
export default function ThemeModeToggle() {
  const { t } = useTranslation();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  const handleChange = (_event: MouseEvent<HTMLElement>, value: ThemeMode | null) => {
    if (value !== null) {
      setThemeMode(value);
    }
  };

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={themeMode}
      onChange={handleChange}
      aria-label={t("theme.label")}
    >
      {OPTIONS.map((option) => (
        <Tooltip key={option.value} title={t(`theme.${option.value}`)}>
          <ToggleButton value={option.value}>{option.icon}</ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
