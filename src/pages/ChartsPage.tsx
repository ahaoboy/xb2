import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stage3Chart, HeatmapChart, SunburstChart, TreeChart } from "../components/routes/charts";
import { COMBO_ROUTES } from "../data/comboRoutes";
import { useCharactersStore } from "../store/charactersStore";
import { useSettingsStore } from "../store/settingsStore";
import { type Character, type ElementId } from "../types";
import { buildComboTree, computeAssignment, filterFeasibleRoutes } from "../utils/combo";

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

/**
 * Chart view: by default shows the complete route data (no markers).
 * When "Use plan data" is enabled, the party configuration from the plan
 * page drives the charts: feasible routes only, with ⭐/✔ markers and the
 * heatmap highlight reflecting the actual plan.
 */
export default function ChartsPage({ chart }: { chart: ChartMode }) {
  const { t } = useTranslation();
  const characters = useCharactersStore((state) => state.characters);
  const chartsUsePlanData = useSettingsStore((state) => state.chartsUsePlanData);

  const { roots, names } = useMemo(() => {
    const party = chartsUsePlanData ? characters : createOmniscientParty();
    const names = new Map(
      party.map((character, index) => [character.id, t("characters.name", { n: index + 1 })]),
    );
    const routes = chartsUsePlanData ? filterFeasibleRoutes(COMBO_ROUTES, party) : COMBO_ROUTES;
    return {
      roots: buildComboTree(
        routes.map((route) => ({
          route,
          assignment: computeAssignment(route, party),
        })),
        party,
      ),
      names,
    };
  }, [chartsUsePlanData, characters, t]);

  if (chart === "tree")
    return <TreeChart roots={roots} names={names} showMarkers={chartsUsePlanData} />;
  if (chart === "sunburst") return <SunburstChart roots={roots} />;
  if (chart === "heatmap") return <HeatmapChart roots={roots} highlight={chartsUsePlanData} />;
  return <Stage3Chart roots={roots} showMarkers={chartsUsePlanData} />;
}
