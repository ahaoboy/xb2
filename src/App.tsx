import { useEffect, useState } from "react";
import { Container, CssBaseline, Divider, Stack } from "@mui/material";
import { CssVarsProvider, useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import AppHeader from "./components/AppHeader";
import CharacterPanel from "./components/characters/CharacterPanel";
import ComboResults from "./components/routes/ComboResults";
import { useResolvedThemeMode } from "./hooks/useResolvedThemeMode";
import { useResponsiveScale } from "./hooks/useResponsiveScale";
import i18n from "./i18n";
import ChartsPage, { type ChartMode } from "./pages/ChartsPage";
import { useSettingsStore } from "./store/settingsStore";
import { appTheme } from "./theme/theme";

/** Top-level page navigation: planner or one of the chart views. */
export type AppView = "planner" | ChartMode;

/**
 * Keeps MUI color scheme, i18next language, document metadata
 * (`<html lang>`, title), and the root font size in sync.
 */
function SettingsSync() {
  const language = useSettingsStore((state) => state.language);
  const resolvedMode = useResolvedThemeMode();
  const scale = useResponsiveScale();
  const { setMode } = useColorScheme();
  const { t } = useTranslation();

  useEffect(() => {
    setMode(resolvedMode);
  }, [resolvedMode, setMode]);

  useEffect(() => {
    // Scale all rem-based MUI text on large screens.
    document.documentElement.style.fontSize = `${16 * scale}px`;
  }, [scale]);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t("app.title");
  }, [language, t]);

  return null;
}

export default function App() {
  const [view, setView] = useState<AppView>("planner");

  return (
    <CssVarsProvider theme={appTheme}>
      <SettingsSync />
      <CssBaseline />
      <AppHeader view={view} onViewChange={setView} />
      {/* Chart views use full width and minimal padding so they can fill
          large screens; the planner keeps its comfortable spacing. */}
      <Container
        maxWidth={view === "planner" ? "xl" : false}
        sx={view === "planner" ? { py: 3 } : { p: 1 }}
      >
        {view === "planner" ? (
          <Stack spacing={4}>
            <CharacterPanel />
            <Divider />
            <ComboResults />
          </Stack>
        ) : (
          <ChartsPage chart={view} />
        )}
      </Container>
    </CssVarsProvider>
  );
}
