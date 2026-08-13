import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import GitHubIcon from "@mui/icons-material/GitHub";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridViewIcon from "@mui/icons-material/GridView";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import type { MouseEvent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { AppView } from "../App";
import LanguageMenu from "./LanguageMenu";
import ThemeModeToggle from "./ThemeModeToggle";

interface AppHeaderProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
}

const VIEWS: { value: AppView; icon: ReactElement; labelKey: string }[] = [
  { value: "planner", icon: <GridViewIcon fontSize="small" />, labelKey: "app.viewPlanner" },
  { value: "tree", icon: <AccountTreeIcon fontSize="small" />, labelKey: "routes.charts.tree" },
  {
    value: "sunburst",
    icon: <DonutLargeIcon fontSize="small" />,
    labelKey: "routes.charts.sunburst",
  },
  { value: "heatmap", icon: <GridOnIcon fontSize="small" />, labelKey: "routes.charts.heatmap" },
  { value: "stage3", icon: <MyLocationIcon fontSize="small" />, labelKey: "routes.charts.stage3" },
];

/** Sticky app bar with page navigation and the theme/language/source controls. */
export default function AppHeader({ view, onViewChange }: AppHeaderProps) {
  const { t } = useTranslation();

  const handleViewChange = (_event: MouseEvent<HTMLElement>, value: AppView | null) => {
    if (value !== null) onViewChange(value);
  };

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
      <Toolbar sx={{ gap: 1 }}>
        {/* Page navigation on the left */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={handleViewChange}
          aria-label={t("app.view")}
        >
          {VIEWS.map((item) => (
            <ToggleButton key={item.value} value={item.value} aria-label={t(item.labelKey)}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                {item.icon}
                <span>{t(item.labelKey)}</span>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ flexGrow: 1 }} />
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
