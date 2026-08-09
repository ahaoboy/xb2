import { useMemo, useState } from "react";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import { useTranslation } from "react-i18next";
import { COMBO_ROUTES } from "../../data/comboRoutes";
import { useCharactersStore } from "../../store/charactersStore";
import type { SealId } from "../../types";
import { buildComboTree, computeAssignment, filterFeasibleRoutes } from "../../utils/combo";
import ComboTree from "./ComboTree";
import SealFilter from "./SealFilter";

/**
 * Live-filtered route trees based on the party's elements, with an optional
 * seal-effect filter. All derived data is computed in a single memoized pass.
 */
export default function ComboResults() {
  const { t } = useTranslation();
  const characters = useCharactersStore((state) => state.characters);
  const [sealFilter, setSealFilter] = useState<SealId | null>(null);

  const { roots, names, routeCount } = useMemo(() => {
    const names = new Map(
      characters.map((character, index) => [character.id, t("characters.name", { n: index + 1 })]),
    );
    const routes = filterFeasibleRoutes(COMBO_ROUTES, characters, sealFilter);
    const roots = buildComboTree(
      routes.map((route) => ({
        route,
        assignment: computeAssignment(route, characters),
      })),
      characters,
    );
    return { roots, names, routeCount: routes.length };
  }, [characters, sealFilter, t]);

  return (
    <section aria-label={t("routes.title")}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
        <AutoAwesomeMotionIcon color="primary" />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          {t("routes.title")}
        </Typography>
        <Chip
          size="small"
          color={routeCount > 0 ? "primary" : "default"}
          label={t("routes.count", { count: routeCount })}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("routes.subtitle")}
      </Typography>

      <SealFilter value={sealFilter} onChange={setSealFilter} />

      {routeCount === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, mt: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("routes.none")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("routes.noneHint")}
          </Typography>
        </Paper>
      ) : (
        <ComboTree roots={roots} names={names} />
      )}
    </section>
  );
}
