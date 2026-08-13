import { useMediaQuery } from "@mui/material";

/**
 * Scales UI and charts up on large screens so content stays readable.
 * - 1440px+: 1.15×
 * - 1920px+: 1.3×
 * - 4K (2560px+): 1.5×
 */
export function useResponsiveScale(): number {
  const uhd = useMediaQuery("(min-width: 2560px)");
  const xl = useMediaQuery("(min-width: 1920px)");
  const lg = useMediaQuery("(min-width: 1440px)");
  return uhd ? 1.5 : xl ? 1.3 : lg ? 1.15 : 1;
}
