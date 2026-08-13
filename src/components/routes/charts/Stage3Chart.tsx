import { useMemo } from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { COMBO_ATTACKS, pickLocalized } from "../../../data/comboAttacks";
import { ELEMENT_IDS } from "../../../types";
import type { ElementId } from "../../../types";
import { useCurrentLanguage } from "../../../hooks/useCurrentLanguage";
import type { ComboTreeNode } from "../../../utils/combo";
import ElementNode from "../../elements/ElementNode";

interface Stage3ChartProps {
  roots: ComboTreeNode[];
}

interface RouteLine {
  stage1: ElementId;
  stage2: ElementId;
  stage3: ElementId;
  attackName: string;
  /** Damage multiplier; undefined when the attack data is unavailable. */
  direct: number | null;
}

/**
 * Target-stage chart: grouped by the FINAL (stage 3) element, showing every
 * (stage 1 → stage 2) opening that can produce it. Answers "I want Fire on
 * the third hit — which openings work?" Shows pure game data, independent of
 * any party configuration. Two-column grid fits all 8 groups on one screen.
 */
export default function Stage3Chart({ roots }: Stage3ChartProps) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();

  const groups = useMemo(() => {
    const map = new Map<ElementId, RouteLine[]>();
    for (const stage1 of roots) {
      for (const stage2 of stage1.children) {
        for (const leaf of stage2.children) {
          if (!leaf.route) continue;
          const attack = COMBO_ATTACKS[leaf.route.id];
          const line: RouteLine = {
            stage1: leaf.path[0],
            stage2: leaf.path[1],
            stage3: leaf.element,
            attackName: attack ? pickLocalized(attack.name, lang) : "",
            direct: attack?.direct ?? null,
          };
          const list = map.get(leaf.element) ?? [];
          list.push(line);
          map.set(leaf.element, list);
        }
      }
    }
    return map;
  }, [roots, lang]);

  return (
    <Grid container spacing={1.5}>
      {ELEMENT_IDS.map((target) => {
        const lines = groups.get(target) ?? [];
        return (
          <Grid key={target} size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
              <Box sx={{ mb: 1 }}>
                <ElementNode element={target} size={16} />
              </Box>
              {lines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t("routes.charts.noRoutes")}
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {lines.map((line, index) => (
                    <Stack
                      key={`${line.stage1}-${line.stage2}-${index}`}
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      <ElementNode element={line.stage1} size={13} />
                      <ArrowForwardIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <ElementNode element={line.stage2} size={13} />
                      <ArrowForwardIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t(`elements.${line.stage3}`)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {line.attackName
                          ? `${line.attackName} · ${line.direct}%`
                          : t("routes.charts.noData")}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
