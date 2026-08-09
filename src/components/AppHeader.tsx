import { AppBar, IconButton, Stack, Toolbar, Tooltip } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTranslation } from "react-i18next";
import LanguageMenu from "./LanguageMenu";
import ThemeModeToggle from "./ThemeModeToggle";

/** Sticky app bar with the theme/language/source controls. */
export default function AppHeader() {
  const { t } = useTranslation();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={{
        bgcolor: "background.default",
        backgroundImage: "none",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1, justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ThemeModeToggle />
          <LanguageMenu />
          <Tooltip title={t("app.sourceCode")}>
            <IconButton
              component="a"
              href="https://github.com/ahaoboy/xb2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("app.sourceCode")}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
