import { extendTheme } from "@mui/material/styles";

/**
 * Single source of truth for the app theme.
 * Both light and dark color schemes are defined here (MUI CSS variables
 * best practice); the active scheme is controlled by CssVarsProvider.
 */
export const appTheme = extendTheme({
  // "data" selector: theme mode is applied via [data-mui-color-scheme] on
  // <html>, so the header toggle works. Do NOT use "class" — React Flow's
  // canvas container has a `light`/`dark` class that would match MUI's
  // `.light` rule and pin every CSS variable inside the canvas to the light
  // values, breaking dark mode inside the trees.
  colorSchemeSelector: "data",
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2f6fb2" },
        secondary: { main: "#7d4fa8" },
        background: {
          default: "#f4f7fb",
          paper: "#ffffff",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#8ab4e8" },
        secondary: { main: "#b39ddb" },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      "Roboto",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: 2,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiChip: {
      defaultProps: {
        size: "small",
      },
    },
  },
});
