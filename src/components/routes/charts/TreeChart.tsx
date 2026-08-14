import { useMemo } from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "../../../hooks/useCurrentLanguage";
import { useFontsReady } from "../../../hooks/useFontsReady";
import { useResponsiveScale } from "../../../hooks/useResponsiveScale";
import type { ElementId } from "../../../types";
import type { ComboTreeNode } from "../../../utils/combo";
import RouteFlow from "../flow/RouteFlow";
import { layoutTree } from "../flow/treeLayout";

interface TreeChartProps {
  roots: ComboTreeNode[];
  /** Character id → display name, used in assignment tooltip lines. */
  names?: Map<string, string>;
  /** Show ⭐/✔ markers on leaf nodes (plan data mode). */
  showMarkers?: boolean;
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
 * Eight equal cards, one per starting element. Every card shares the same
 * canvas dimensions (the widest/tallest tree) and therefore the same zoom,
 * so all trees render at an identical scale, centered in identical cards —
 * visually aligned and uniform. The left card of each pair is mirrored:
 * its start element sits on the right, growing leftwards toward the axis.
 */
export default function TreeChart({ roots, names, showMarkers = false }: TreeChartProps) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const zh = lang.startsWith("zh");
  const scale = useResponsiveScale();
  const fontsReady = useFontsReady();

  const { rootByElement, maxW, maxH } = useMemo(() => {
    const layouts = roots.map((root) =>
      layoutTree(root, {
        t,
        lang,
        zh,
        scale,
        showMarkers,
        names,
        fontVersion: fontsReady,
        idPrefix: `${root.element}-`,
      }),
    );
    return {
      rootByElement: new Map(roots.map((root) => [root.element, root])),
      maxW: Math.max(...layouts.map((layout) => layout.width), 1),
      maxH: Math.max(...layouts.map((layout) => layout.height), 1),
    };
  }, [roots, t, lang, zh, scale, showMarkers, names, fontsReady]);

  return (
    <Stack spacing={2}>
      {COUNTER_PAIRS.map(([left, right]) => (
        <Grid key={`${left}-${right}`} container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TreeCard
              root={rootByElement.get(left)}
              maxW={maxW}
              maxH={maxH}
              mirrored
              align="right"
              names={names}
              showMarkers={showMarkers}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TreeCard
              root={rootByElement.get(right)}
              maxW={maxW}
              maxH={maxH}
              align="left"
              names={names}
              showMarkers={showMarkers}
            />
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
}

/** One uniform card: a single tree canvas at the shared scale (no header). */
function TreeCard({
  root,
  maxW,
  maxH,
  mirrored = false,
  align = "center",
  names,
  showMarkers = false,
}: {
  root: ComboTreeNode | undefined;
  maxW: number;
  maxH: number;
  mirrored?: boolean;
  /** Where the tree sits inside the card: left/right pull toward the axis. */
  align?: "left" | "right" | "center";
  names?: Map<string, string>;
  showMarkers?: boolean;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const zh = lang.startsWith("zh");
  const scale = useResponsiveScale();
  const fontsReady = useFontsReady();
  const canvasHeight = Math.ceil(maxH + 8);

  const layout = useMemo(() => {
    if (!root) return null;
    const raw = layoutTree(root, {
      t,
      lang,
      zh,
      scale,
      mirrored,
      showMarkers,
      names,
      fontVersion: fontsReady,
      idPrefix: `${root.element}-`,
    });
    // All cards share one canvas (maxW × maxH); shift this tree's content so
    // it is centered within that canvas — smaller trees stay centered instead
    // of hugging an edge with empty space on the other side.
    const dx = (maxW - raw.width) / 2;
    const dy = (maxH - raw.height) / 2;
    return {
      ...raw,
      nodes: raw.nodes.map((node) => ({
        ...node,
        position: { x: node.position.x + dx, y: node.position.y + dy },
      })),
    };
  }, [root, t, lang, zh, scale, mirrored, showMarkers, names, maxW, maxH, fontsReady]);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
      {root && layout ? (
        <RouteFlow
          nodes={layout.nodes}
          edges={layout.edges}
          width={maxW}
          height={maxH}
          align={align}
          minHeight={canvasHeight}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: canvasHeight,
            opacity: 0.4,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("routes.charts.noRoutes")}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
