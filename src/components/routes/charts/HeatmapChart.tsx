import { useMemo } from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useResponsiveScale } from "../../../hooks/useResponsiveScale";
import { ELEMENT_IDS } from "../../../types";
import type { ElementId } from "../../../types";
import type { ComboTreeNode } from "../../../utils/combo";
import ElementDot from "../../elements/ElementDot";

interface HeatmapChartProps {
  roots: ComboTreeNode[];
  /** Highlight cells containing ⭐ recommended routes (plan data mode). */
  highlight?: boolean;
}

interface CellData {
  leaves: ComboTreeNode[];
  count: number;
  recommendedCount: number;
  optimalCount: number;
  /** 0..1 quality from recommended/optimal ratio. */
  quality: number;
}

/** Matrix heatmap: rows = stage 1, columns = stage 2, intensity = route quality. */
export default function HeatmapChart({ roots, highlight = false }: HeatmapChartProps) {
  const { t } = useTranslation();
  const scale = useResponsiveScale();

  const cells = useMemo(() => {
    const map = new Map<string, CellData>();
    for (const root of roots) {
      for (const stage2 of root.children) {
        const key = `${root.element}-${stage2.element}`;
        const leaves = stage2.children.filter((leaf) => leaf.route);
        if (leaves.length === 0) continue;
        const recommendedCount = leaves.filter((leaf) => leaf.recommended).length;
        const optimalCount = leaves.filter((leaf) => leaf.assignment?.optimal).length;
        const count = leaves.length;
        map.set(key, {
          leaves,
          count,
          recommendedCount,
          optimalCount,
          quality: (recommendedCount * 2 + optimalCount) / (count * 2),
        });
      }
    }
    return map;
  }, [roots]);

  const maxCount = Math.max(1, ...[...cells.values()].map((cell) => cell.count));

  return (
    <Paper variant="outlined" sx={{ p: 2, overflow: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `${44 * scale}px repeat(${ELEMENT_IDS.length}, minmax(${64 * scale}px, 1fr))`,
          gap: 0.5,
          minWidth: 620 * scale,
        }}
      >
        {/* Corner: explains which axis each stage maps to */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontSize: 10, lineHeight: 1.3, fontWeight: 700 }}
            noWrap
          >
            {t("routes.stage1")} ↓
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: 10, lineHeight: 1.3, fontWeight: 700 }}
            noWrap
          >
            {t("routes.stage2")} →
          </Typography>
        </Box>
        {ELEMENT_IDS.map((element) => (
          <ColumnHeader key={element} element={element} />
        ))}

        {/* Rows */}
        {ELEMENT_IDS.map((stage1) => (
          <Row
            key={stage1}
            stage1={stage1}
            cells={cells}
            maxCount={maxCount}
            highlight={highlight}
          />
        ))}
      </Box>
    </Paper>
  );
}

function ColumnHeader({ element }: { element: ElementId }) {
  const { t } = useTranslation();
  const scale = useResponsiveScale();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
      <ElementDot element={element} size={14 * scale} />
      <Typography variant="caption" noWrap>
        {t(`elements.${element}`)}
      </Typography>
    </Box>
  );
}

function Row({
  stage1,
  cells,
  maxCount,
  highlight,
}: {
  stage1: ElementId;
  cells: Map<string, CellData>;
  maxCount: number;
  highlight: boolean;
}) {
  const { t } = useTranslation();
  const scale = useResponsiveScale();
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ElementDot element={stage1} size={14 * scale} />
        <Typography variant="caption" noWrap>
          {t(`elements.${stage1}`)}
        </Typography>
      </Box>
      {ELEMENT_IDS.map((stage2) => {
        const cell = cells.get(`${stage1}-${stage2}`);
        return (
          <Cell
            key={stage2}
            cell={cell}
            maxCount={maxCount}
            stage1={stage1}
            stage2={stage2}
            highlight={highlight}
          />
        );
      })}
    </>
  );
}

function Cell({
  cell,
  maxCount,
  stage1,
  stage2,
  highlight,
}: {
  cell: CellData | undefined;
  maxCount: number;
  stage1: ElementId;
  stage2: ElementId;
  highlight: boolean;
}) {
  const { t } = useTranslation();
  const scale = useResponsiveScale();

  if (!cell) {
    return (
      <Box
        sx={{
          minHeight: 52 * scale,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.disabled">
          -
        </Typography>
      </Box>
    );
  }

  const intensity = cell.count / maxCount;

  const tooltipLines = [
    `${t(`elements.${stage1}`)} → ${t(`elements.${stage2}`)} · ${cell.count}`,
    ...cell.leaves.map(
      (leaf) => `${t(`elements.${leaf.element}`)}${leaf.assignment?.optimal ? " ✔" : ""}`,
    ),
  ].join("\n");

  return (
    <Tooltip title={tooltipLines} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      <Box
        sx={{
          minHeight: 52 * scale,
          borderRadius: 1,
          border: highlight && cell.recommendedCount > 0 ? 1.5 : 1,
          borderColor: highlight && cell.recommendedCount > 0 ? "warning.main" : "divider",
          bgcolor: `color-mix(in srgb, var(--mui-palette-primary-main) ${Math.round(
            8 + intensity * 22,
          )}%, transparent)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.25,
          cursor: "help",
        }}
      >
        <Box sx={{ display: "flex", gap: 0.25 }}>
          {cell.leaves.slice(0, 3).map((leaf) => (
            <ElementDot key={leaf.element} element={leaf.element} size={12 * scale} />
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
}
