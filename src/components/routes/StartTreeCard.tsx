import { Box, Paper } from "@mui/material";
import type { ComboTreeNode } from "../../utils/combo";
import TreeNode from "./TreeNode";

interface StartTreeCardProps {
  root: ComboTreeNode;
  names: Map<string, string>;
}

/** A card for a single starting element with its full route tree. */
export default function StartTreeCard({ root, names }: StartTreeCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "max-content",
            minWidth: "100%",
            py: 1,
          }}
        >
          <TreeNode node={root} names={names} />
        </Box>
      </Box>
    </Paper>
  );
}
