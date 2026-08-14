import {
  AppBar,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import GitHubIcon from "@mui/icons-material/GitHub";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridViewIcon from "@mui/icons-material/GridView";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import type { MouseEvent, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { AppView } from "../App";
import {
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_STEP,
  useSettingsStore,
} from "../store/settingsStore";
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
  const chartsUsePlanData = useSettingsStore((state) => state.chartsUsePlanData);
  const setChartsUsePlanData = useSettingsStore((state) => state.setChartsUsePlanData);
  const uiScale = useSettingsStore((state) => state.uiScale);
  const setUiScale = useSettingsStore((state) => state.setUiScale);

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
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={chartsUsePlanData}
              onChange={(event) => setChartsUsePlanData(event.target.checked)}
            />
          }
          label={t("app.usePlanData")}
          sx={{ ml: 1, "& .MuiTypography-root": { fontSize: 13 } }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {/* User-adjustable UI scale stepper (±0.1 per click) */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              {t("app.scale")}
            </Typography>
            <Tooltip title={t("app.scaleDecrease")}>
              <span>
                <IconButton
                  size="small"
                  aria-label={t("app.scaleDecrease")}
                  disabled={uiScale <= UI_SCALE_MIN}
                  onClick={() => setUiScale(+(uiScale - UI_SCALE_STEP).toFixed(2))}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 44, textAlign: "center" }}>
              {uiScale.toFixed(1)}×
            </Typography>
            <Tooltip title={t("app.scaleIncrease")}>
              <span>
                <IconButton
                  size="small"
                  aria-label={t("app.scaleIncrease")}
                  disabled={uiScale >= UI_SCALE_MAX}
                  onClick={() => setUiScale(+(uiScale + UI_SCALE_STEP).toFixed(2))}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
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
