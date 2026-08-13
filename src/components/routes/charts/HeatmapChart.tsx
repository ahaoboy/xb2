import { useMemo } from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ELEMENT_IDS } from "../../../types";
import type { ElementId } from "../../../types";
import type { ComboTreeNode } from "../../../utils/combo";
import ElementDot from "../../elements/ElementDot";

interface HeatmapChartProps {
  roots: ComboTreeNode[];
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
export default function HeatmapChart({ roots }: HeatmapChartProps) {
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
          gridTemplateColumns: `44px repeat(${ELEMENT_IDS.length}, minmax(64px, 1fr))`,
          gap: 0.5,
          minWidth: 620,
        }}
      >
        {/* Corner + column headers */}
        <Box />
        {ELEMENT_IDS.map((element) => (
          <ColumnHeader key={element} element={element} />
        ))}

        {/* Rows */}
        {ELEMENT_IDS.map((stage1) => (
          <Row key={stage1} stage1={stage1} cells={cells} maxCount={maxCount} />
        ))}
      </Box>
    </Paper>
  );
}

function ColumnHeader({ element }: { element: ElementId }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
      <ElementDot element={element} size={14} />
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
}: {
  stage1: ElementId;
  cells: Map<string, CellData>;
  maxCount: number;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ElementDot element={stage1} size={14} />
        <Typography variant="caption" noWrap>
          {t(`elements.${stage1}`)}
        </Typography>
      </Box>
      {ELEMENT_IDS.map((stage2) => {
        const cell = cells.get(`${stage1}-${stage2}`);
        return (
          <Cell key={stage2} cell={cell} maxCount={maxCount} stage1={stage1} stage2={stage2} />
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
}: {
  cell: CellData | undefined;
  maxCount: number;
  stage1: ElementId;
  stage2: ElementId;
}) {
  const { t } = useTranslation();

  if (!cell) {
    return (
      <Box
        sx={{
          minHeight: 52,
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
      (leaf) =>
        `${t(`elements.${leaf.element}`)}${leaf.recommended ? " ⭐" : ""}${leaf.assignment?.optimal ? " ✔" : ""}`,
    ),
  ].join("\n");

  return (
    <Tooltip title={tooltipLines} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      <Box
        sx={{
          minHeight: 52,
          borderRadius: 1,
          border: cell.recommendedCount > 0 ? 1.5 : 1,
          borderColor: cell.recommendedCount > 0 ? "warning.main" : "divider",
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
            <ElementDot key={leaf.element} element={leaf.element} size={12} />
          ))}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {cell.count}
        </Typography>
      </Box>
    </Tooltip>
  );
}
