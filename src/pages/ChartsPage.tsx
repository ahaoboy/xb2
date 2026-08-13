import { useMemo } from "react";
import { Stage3Chart, HeatmapChart, SunburstChart, TreeChart } from "../components/routes/charts";
import { COMBO_ROUTES } from "../data/comboRoutes";
import { type Character, type ElementId } from "../types";
import { buildComboTree, computeAssignment } from "../utils/combo";

/** Chart views selectable from the app header. */
export type ChartMode = "tree" | "sunburst" | "heatmap" | "stage3";

/**
 * A neutral party where every character holds every element, so the charts
 * show the complete route data independent of any user configuration.
 */
function createOmniscientParty(): Character[] {
  const distribution: ElementId[][] = [
    ["fire", "water", "earth"],
    ["electric", "wind", "ice"],
    ["light", "dark", "fire"],
  ];
  return distribution.map((elements, index) => ({
    id: `viewer-${index}`,
    disabled: false,
    slots: elements.map((element) => ({ element, disabled: false })),
  }));
}

/** Standalone chart view: shows all blade combo routes, no party config needed. */
export default function ChartsPage({ chart }: { chart: ChartMode }) {
  const roots = useMemo(() => {
    const characters = createOmniscientParty();
    return buildComboTree(
      COMBO_ROUTES.map((route) => ({
        route,
        assignment: computeAssignment(route, characters),
      })),
      characters,
    );
  }, []);

  if (chart === "tree") return <TreeChart roots={roots} />;
  if (chart === "sunburst") return <SunburstChart roots={roots} />;
  if (chart === "heatmap") return <HeatmapChart roots={roots} />;
  return <Stage3Chart roots={roots} />;
}
