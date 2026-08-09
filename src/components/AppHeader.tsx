import { AppBar, Stack, Toolbar } from "@mui/material";
import LanguageMenu from "./LanguageMenu";
import ThemeModeToggle from "./ThemeModeToggle";

/** Sticky app bar with the theme/language controls. */
export default function AppHeader() {
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
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
