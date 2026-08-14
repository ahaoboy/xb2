import { useMemo } from "react";
import { Grid, Paper, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "../../hooks/useCurrentLanguage";
import { useFontsReady } from "../../hooks/useFontsReady";
import { useResponsiveScale } from "../../hooks/useResponsiveScale";
import type { ElementId } from "../../types";
import type { ComboTreeNode } from "../../utils/combo";
import RouteFlow from "./flow/RouteFlow";
import { layoutTree } from "./flow/treeLayout";

interface ComboTreeProps {
  roots: ComboTreeNode[];
  names: Map<string, string>;
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
 * One route tree per starting element, laid out in symmetric counter pairs:
 * the left card's start sits on the right growing leftwards (mirrored),
 * the right card's start sits on the left growing rightwards — a mirrored
 * layout toward the middle axis.
 */
export default function ComboTree({ roots, names }: ComboTreeProps) {
  const rootMap = useMemo(() => new Map(roots.map((root) => [root.element, root])), [roots]);

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {COUNTER_PAIRS.map(([left, right]) => (
        <Grid key={`${left}-${right}`} container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            {rootMap.get(left) ? (
              <FlowCard root={rootMap.get(left)!} names={names} mirrored />
            ) : (
              <EmptyTreeCard />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {rootMap.get(right) ? (
              <FlowCard root={rootMap.get(right)!} names={names} />
            ) : (
              <EmptyTreeCard />
            )}
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
}

/** A card holding one start element's route tree as a React Flow canvas. */
function FlowCard({
  root,
  names,
  mirrored = false,
}: {
  root: ComboTreeNode;
  names: Map<string, string>;
  mirrored?: boolean;
}) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const zh = lang.startsWith("zh");
  const scale = useResponsiveScale();
  const fontsReady = useFontsReady();

  const { nodes, edges, width, height } = useMemo(
    () => layoutTree(root, { t, lang, zh, scale, mirrored, names, fontVersion: fontsReady }),
    [root, t, lang, zh, scale, mirrored, names, fontsReady],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        height: "100%",
        // When the grid stretches the card taller than the tree (matching
        // the sibling card's height), center the tree vertically instead of
        // leaving dead space below it.
        display: "flex",
        alignItems: "center",
      }}
    >
      <RouteFlow
        nodes={nodes}
        edges={edges}
        width={width}
        height={height}
        align={mirrored ? "right" : "left"}
        // Card height is fully driven by the tree content, so changing the
        // UI scale grows/shrinks the cards instead of leaving empty space.
        minHeight={0}
      />
    </Paper>
  );
}

/** Placeholder that keeps the grid symmetric when a start element has no routes. */
function EmptyTreeCard() {
  return <Paper variant="outlined" sx={{ p: 2, height: "100%", opacity: 0.4 }} />;
}
