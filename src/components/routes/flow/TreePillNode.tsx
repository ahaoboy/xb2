import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ELEMENT_META } from "../../../data/elements";
import type { ElementId } from "../../../types";

/** Node type key registered in the React Flow canvas. */
export const PILL_NODE_TYPE = "pill";

/** Data carried by every flow node; built by treeLayout. */
export interface PillData {
  element: ElementId;
  width: number;
  height: number;
  /** Mirrored tree: target handle on the right, source on the left. */
  mirrored: boolean;
  /** Rendered pill text. */
  label: string;
  /** Localized tooltip lines. */
  tooltip: string[];
  /** "plain" = no background text node (skill name + damage). */
  variant?: "pill" | "plain";
  recommended?: boolean;
  optimal?: boolean;
}

/** Custom React Flow node: a colored element pill or a plain text node. */
function TreePillNode({ data }: NodeProps) {
  const {
    element,
    width,
    height,
    mirrored,
    label,
    tooltip,
    variant = "pill",
    recommended,
    optimal,
  } = data as unknown as PillData;
  const meta = ELEMENT_META[element];

  return (
    <Tooltip title={tooltip.join("\n")} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      <Box sx={{ position: "relative", width, height }}>
        <Handle type="target" position={mirrored ? Position.Right : Position.Left} />
        {variant === "plain" ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.75,
              width: "100%",
              height: "100%",
              whiteSpace: "nowrap",
              // Border adapts to the theme: divider is light in dark mode
              // and dark in light mode, keeping the node visible on both.
              borderRadius: 1,
              border: 1,
              borderStyle: "dashed",
              borderColor: "var(--mui-palette-divider)",
              bgcolor: "var(--mui-palette-action-hover)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
            >
              {label}
            </Typography>
            {optimal ? <CheckCircleIcon fontSize="small" color="success" /> : null}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              width: "100%",
              height: "100%",
              borderRadius: 1.5,
              bgcolor: meta.color,
              color: meta.textColor,
              boxShadow: 1,
              whiteSpace: "nowrap",
              outline: recommended ? "2px solid #f6b93b" : "none",
              outlineOffset: -2,
              border: 1,
              borderColor: "var(--mui-palette-divider)",
            }}
          >
            <img
              src={meta.icon}
              alt=""
              width={18}
              height={18}
              draggable={false}
              style={{ flexShrink: 0 }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {label}
            </Typography>
          </Box>
        )}
        <Handle type="source" position={mirrored ? Position.Left : Position.Right} />
      </Box>
    </Tooltip>
  );
}

export default memo(TreePillNode);
