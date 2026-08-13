import { useMemo } from "react";
import { Box, Grid, Paper, Stack, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { COMBO_ATTACKS, pickLocalized } from "../../../data/comboAttacks";
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
 * Mutually countering element pairs (from the XC2 element chart):
 * fire ⇄ water, earth ⇄ electric, wind ⇄ ice, light ⇄ dark.
 */
const COUNTER_PAIRS: [ElementId, ElementId][] = [
  ["fire", "water"],
  ["earth", "electric"],
  ["wind", "ice"],
  ["light", "dark"],
];

/**
 * Target-stage chart: grouped by the FINAL (stage 3) element, showing every
 * (stage 1 → stage 2) opening that can produce it. Each row pairs two
 * mutually countering elements in a symmetric left/right layout, so all 8
 * groups fit on one screen.
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
    <Stack spacing={1}>
      {COUNTER_PAIRS.map(([left, right]) => (
        <Grid key={`${left}-${right}`} container spacing={1}>
          {/* Left card: mirrored (stage 3 ← stage 2 ← stage 1), right-aligned. */}
          <Grid size={6}>
            <TargetCard target={left} lines={groups.get(left) ?? []} t={t} mirrored />
          </Grid>
          {/* Right card: forward order (stage 1 → stage 2 → stage 3). */}
          <Grid size={6}>
            <TargetCard target={right} lines={groups.get(right) ?? []} t={t} />
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
}

function TargetCard({
  target,
  lines,
  t,
  mirrored = false,
}: {
  target: ElementId;
  lines: RouteLine[];
  t: (key: string) => string;
  /** When true, routes render in reverse with left arrows, right-aligned. */
  mirrored?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1, height: "100%" }}>
      <Box sx={{ mb: 0.75, display: "flex", justifyContent: mirrored ? "flex-end" : "flex-start" }}>
        <ElementNode element={target} size={14} />
      </Box>
      {lines.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("routes.charts.noRoutes")}
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {lines.map((line, index) => (
            <Tooltip
              key={`${line.stage1}-${line.stage2}-${index}`}
              title={
                line.attackName ? `${line.attackName} · ${line.direct}%` : t("routes.charts.noData")
              }
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: "center",
                  cursor: "help",
                  justifyContent: mirrored ? "flex-end" : "flex-start",
                }}
              >
                {mirrored ? (
                  <>
                    <ElementNode element={line.stage3} size={11} />
                    <ArrowBackIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                    <ElementNode element={line.stage2} size={11} />
                    <ArrowBackIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                    <ElementNode element={line.stage1} size={11} />
                  </>
                ) : (
                  <>
                    <ElementNode element={line.stage1} size={11} />
                    <ArrowForwardIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                    <ElementNode element={line.stage2} size={11} />
                    <ArrowForwardIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                    <ElementNode element={line.stage3} size={11} />
                  </>
                )}
              </Stack>
            </Tooltip>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
