import { useMemo, useState } from "react";
import { Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { useTranslation } from "react-i18next";
import { COMBO_ATTACKS, pickLocalized } from "../../../data/comboAttacks";
import { ELEMENT_META } from "../../../data/elements";
import { useCurrentLanguage } from "../../../hooks/useCurrentLanguage";
import type { ComboTreeNode } from "../../../utils/combo";

interface TreeChartProps {
  roots: ComboTreeNode[];
}

const NODE_HEIGHT = 32;
const LEVEL_GAP = 220;
const ROW_GAP = 12;
const PADDING = 24;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

interface Positioned {
  node: ComboTreeNode;
  x: number;
  y: number;
  width: number;
  parent: Positioned | null;
}

/** Classic tidy tree rendered with SVG bezier links, fit-to-width with zoom. */
export default function TreeChart({ roots }: TreeChartProps) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const zh = lang.startsWith("zh");
  const [zoom, setZoom] = useState(1);

  const { nodes, width, height } = useMemo(() => {
    const estimateWidth = (node: ComboTreeNode): number => {
      const label = (() => {
        if (node.children.length === 0) {
          const attack = node.route ? COMBO_ATTACKS[node.route.id] : undefined;
          const attackName = attack ? ` · ${pickLocalized(attack.name, lang)}` : "";
          const dmg = attack ? ` · ${attack.direct}%` : "";
          return `${t(`elements.${node.element}`)}${attackName}${dmg}`;
        }
        return t(`elements.${node.element}`);
      })();
      return Math.min(340, label.length * (zh ? 13 : 7.6) + 44);
    };

    // Uniform width per stage: the widest label of that stage, so all nodes
    // in the same column align visually.
    const naturalWidths = new Map<ComboTreeNode, number>();
    const collect = (node: ComboTreeNode): void => {
      naturalWidths.set(node, estimateWidth(node));
      for (const child of node.children) collect(child);
    };
    for (const root of roots) collect(root);
    const stageWidths = { 1: 0, 2: 0, 3: 0 };
    for (const [node, w] of naturalWidths) {
      stageWidths[node.stage] = Math.max(stageWidths[node.stage], w);
    }

    const all: Positioned[] = [];
    // Start at PADDING so the first root node's half-height never clips.
    let leafY = PADDING;

    const visit = (node: ComboTreeNode, depth: number): Positioned => {
      const x = PADDING + depth * LEVEL_GAP;
      if (node.children.length === 0) {
        const pos: Positioned = {
          node,
          x,
          y: leafY,
          width: stageWidths[3],
          parent: null,
        };
        leafY += NODE_HEIGHT + ROW_GAP;
        all.push(pos);
        return pos;
      }
      const childPos = node.children.map((child) => visit(child, depth + 1));
      const y = (childPos[0].y + childPos[childPos.length - 1].y) / 2;
      const pos: Positioned = {
        node,
        x,
        y,
        width: stageWidths[node.stage],
        parent: null,
      };
      childPos.forEach((child) => {
        child.parent = pos;
      });
      all.push(pos);
      return pos;
    };

    for (const root of roots) visit(root, 0);
    const width = all.reduce((m, p) => Math.max(m, p.x + p.width), 0) + PADDING;
    const height = Math.max(leafY - ROW_GAP, 1) + PADDING;
    return { nodes: all, width, height };
  }, [roots, t, lang, zh]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", mb: 1 }}>
        <Tooltip title={t("routes.charts.zoomOut")}>
          <span>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.25).toFixed(2)))}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("routes.charts.zoomIn")}>
          <span>
            <IconButton
              size="small"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.25).toFixed(2)))}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("routes.charts.fit")}>
          <span>
            <IconButton size="small" onClick={() => setZoom(1)} disabled={zoom === 1}>
              <ZoomOutMapIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ overflow: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            // Fit: never enlarge beyond the tree's natural size, shrink when the
            // container is narrower. Zoom > 1 uses pixel sizing and scrolls.
            width: zoom === 1 ? `min(100%, ${width}px)` : `${Math.round(width * zoom)}px`,
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
        >
          {/* Links */}
          {nodes.map((pos) =>
            pos.parent
              ? (() => {
                  const fx = pos.parent.x + pos.parent.width;
                  const fy = pos.parent.y;
                  const tx = pos.x;
                  const ty = pos.y;
                  const mx = (fx + tx) / 2;
                  return (
                    <path
                      key={`link-${pos.node.path.join("-")}`}
                      d={`M ${fx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${tx} ${ty}`}
                      fill="none"
                      stroke="var(--mui-palette-divider)"
                      strokeWidth={1.5}
                    />
                  );
                })()
              : null,
          )}
          {/* Nodes */}
          {nodes.map((pos) => (
            <NodeShape key={`node-${pos.node.path.join("-")}`} pos={pos} t={t} lang={lang} />
          ))}
        </svg>
      </Box>
    </Paper>
  );
}

function NodeShape({
  pos,
  t,
  lang,
}: {
  pos: Positioned;
  t: (key: string) => string;
  lang: string;
}) {
  const { node } = pos;
  const meta = ELEMENT_META[node.element];
  const isLeaf = node.children.length === 0;
  const attack = node.route ? COMBO_ATTACKS[node.route.id] : undefined;

  const label = (() => {
    if (isLeaf) {
      const attackName = attack ? ` · ${pickLocalized(attack.name, lang)}` : "";
      const dmg = attack ? ` · ${attack.direct}%` : "";
      return `${t(`elements.${node.element}`)}${attackName}${dmg}`;
    }
    return t(`elements.${node.element}`);
  })();

  const fontSize = isLeaf ? 11 : 12;
  const cy = pos.y;
  const iconX = pos.x + 10;
  const textX = iconX + 22;

  const tooltipLines = [
    attack ? `${pickLocalized(attack.name, lang)} · ${attack.direct}%` : "",
    node.route ? t(`seals.${node.route.seal}`) : "",
    node.assignment?.assignments.length
      ? node.assignment.assignments.map((id, i) => `${t(`routes.stage${i + 1}`)}: ${id}`).join(", ")
      : "",
    node.recommended ? t("routes.recommendedHint") : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <g>
      <title>{tooltipLines || label}</title>
      <rect
        x={pos.x}
        y={cy - NODE_HEIGHT / 2}
        width={pos.width}
        height={NODE_HEIGHT}
        rx={8}
        fill={meta.color}
        stroke={node.recommended ? "#f6b93b" : "none"}
        strokeWidth={node.recommended ? 2 : 0}
      />
      <image
        href={meta.icon}
        x={iconX}
        y={cy - 8}
        width={16}
        height={16}
        preserveAspectRatio="xMidYMid meet"
      />
      <text
        x={textX}
        y={cy + fontSize * 0.35}
        textAnchor="start"
        fontSize={fontSize}
        fontWeight={700}
        fill={meta.textColor}
      >
        {label}
      </text>
      {node.assignment?.optimal ? (
        <circle cx={pos.x + pos.width - 6} cy={cy - NODE_HEIGHT / 2 + 6} r={3.5} fill="#4caf50" />
      ) : null}
    </g>
  );
}
