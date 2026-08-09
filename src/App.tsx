import { useEffect } from "react";
import { Container, CssBaseline, Divider, Stack } from "@mui/material";
import { CssVarsProvider, useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import AppHeader from "./components/AppHeader";
import CharacterPanel from "./components/characters/CharacterPanel";
import ComboResults from "./components/routes/ComboResults";
import { useResolvedThemeMode } from "./hooks/useResolvedThemeMode";
import i18n from "./i18n";
import { useSettingsStore } from "./store/settingsStore";
import { appTheme } from "./theme/theme";

/**
 * Keeps MUI color scheme, i18next language, and document metadata
 * (`<html lang>`, title) in sync with the persisted settings store.
 */
function SettingsSync() {
  const language = useSettingsStore((state) => state.language);
  const resolvedMode = useResolvedThemeMode();
  const { setMode } = useColorScheme();
  const { t } = useTranslation();

  useEffect(() => {
    setMode(resolvedMode);
  }, [resolvedMode, setMode]);

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
  return (
    <CssVarsProvider theme={appTheme}>
      <SettingsSync />
      <CssBaseline />
      <AppHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={4}>
          <CharacterPanel />
          <Divider />
          <ComboResults />
        </Stack>
      </Container>
    </CssVarsProvider>
  );
}
