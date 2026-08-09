import { Chip, Stack, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";
import ElementNode from "../elements/ElementNode";
import { useCurrentLanguage } from "../../hooks/useCurrentLanguage";
import type { ComboTreeNode } from "../../utils/combo";
import { getAttackForPath, getAttackName, getAttackStatLines } from "./attackTooltip";

interface LeafNodeProps {
  node: ComboTreeNode;
  names: Map<string, string>;
}

/** Final stage node: attack name + damage, seal chip, and status icons. */
export default function LeafNode({ node, names }: LeafNodeProps) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const route = node.route;
  const assignment = node.assignment;
  const attack = route ? getAttackForPath(node.path) : undefined;

  const assignmentLines =
    assignment?.assignments.map(
      (characterId, index) => `${t(`routes.stage${index + 1}`)} · ${names.get(characterId) ?? "?"}`,
    ) ?? [];

  const tooltip = [
    ...getAttackStatLines(attack, t, lang),
    ...assignmentLines,
    route ? t(`sealEffects.${route.seal}`) : "",
    assignment?.optimal ? t("routes.recommendedHint") : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Tooltip title={tooltip} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", cursor: "help" }}>
        <ElementNode element={node.element}>
          {attack ? (
            <>
              <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.95 }}>
                · {getAttackName(attack, lang)}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                · {attack.direct}%
              </Typography>
            </>
          ) : null}
        </ElementNode>
        {route ? (
          <Chip size="small" variant="outlined" color="primary" label={t(`seals.${route.seal}`)} />
        ) : null}
        {assignment?.optimal ? <CheckCircleIcon fontSize="small" color="success" /> : null}
        {node.recommended ? <StarIcon fontSize="small" sx={{ color: "warning.main" }} /> : null}
      </Stack>
    </Tooltip>
  );
}
