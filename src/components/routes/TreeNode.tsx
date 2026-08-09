import { Box, Tooltip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import ElementNode from "../elements/ElementNode";
import { useCurrentLanguage } from "../../hooks/useCurrentLanguage";
import type { ComboTreeNode } from "../../utils/combo";
import { getAttackForPath, getAttackStatLines } from "./attackTooltip";
import LeafNode from "./LeafNode";

interface TreeNodeProps {
  node: ComboTreeNode;
  names: Map<string, string>;
}

/** Recursive tree node: element pill on the left, children expanding right. */
export default function TreeNode({ node, names }: TreeNodeProps) {
  const isLeaf = node.children.length === 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {isLeaf ? (
        <LeafNode node={node} names={names} />
      ) : (
        <>
          <BranchNode node={node} />
          <ArrowForwardIcon fontSize="small" sx={{ color: "text.secondary", mx: 0.75 }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 0.5 }}>
            {node.children.map((child) => (
              <TreeNode key={`${child.stage}-${child.element}`} node={child} names={names} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

/** Intermediate node (stage 1/2): shows the attack of this segment on hover. */
function BranchNode({ node }: { node: ComboTreeNode }) {
  const { t } = useTranslation();
  const lang = useCurrentLanguage();
  const attack = getAttackForPath(node.path);

  const tooltip = [
    ...getAttackStatLines(attack, t, lang),
    t("routes.count", { count: node.routeCount }),
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Tooltip title={tooltip} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      <Box sx={{ cursor: "help" }}>
        <ElementNode element={node.element} />
      </Box>
    </Tooltip>
  );
}
