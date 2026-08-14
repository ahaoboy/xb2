import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import {
  MarkerType,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type Viewport,
} from "@xyflow/react";
import { useTranslation } from "react-i18next";
import "@xyflow/react/dist/style.css";
import TreePillNode, { PILL_NODE_TYPE } from "./TreePillNode";

/** Stable node type registry (module-level, so React Flow doesn't re-register). */
const nodeTypes = { [PILL_NODE_TYPE]: TreePillNode };

interface RouteFlowProps {
  nodes: Node[];
  edges: Edge[];
  /** Content size in layout units (already viewport-scaled). */
  width: number;
  height: number;
  /** Where the tree sits inside a static card. */
  align?: "left" | "right" | "center";
  minHeight?: number;
  /** Interactive mode: pan/zoom with zoom buttons (chart page). */
  interactive?: boolean;
}

/**
 * A React Flow canvas for route trees. Static mode fits the tree into the
 * card (optionally side-aligned for the mirrored planner layout); interactive
 * mode fits on init and offers pan/zoom via built-in buttons.
 */
export default function RouteFlow({
  nodes,
  edges,
  width,
  height,
  align = "center",
  minHeight = 260,
  interactive = false,
}: RouteFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // In static (display-only) mode, React Flow still listens to wheel events
  // and may preventDefault them, which blocks the browser's Ctrl/Cmd + wheel
  // page zoom over the canvas. Intercept at capture phase on the container
  // and stop the event from ever reaching React Flow when the zoom modifier
  // is pressed, restoring the browser's default zoom behavior.
  useEffect(() => {
    if (interactive) return;
    const el = containerRef.current;
    if (!el) return;
    const onWheelCapture = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.stopPropagation();
      }
    };
    el.addEventListener("wheel", onWheelCapture, { capture: true, passive: true });
    return () => el.removeEventListener("wheel", onWheelCapture, { capture: true });
  }, [interactive]);

  const viewport = useMemo<Viewport | null>(() => {
    if (!size.w || !size.h) return null;
    if (interactive) return null; // interactive mode uses fitView instead
    const pad = 16;
    // Static mode renders the tree at its full layout size (which already
    // includes the user scale) — no shrink-to-fit, otherwise the content
    // would stay the same size no matter how the scale changes. The card
    // height adapts to the content instead.
    const zoom = 1;
    const x =
      align === "right"
        ? Math.max(pad, size.w - pad - width)
        : align === "left"
          ? pad
          : Math.max(pad, (size.w - width) / 2);
    const y = Math.max(pad, (size.h - height) / 2);
    return { x, y, zoom };
  }, [size, width, height, align, interactive]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        // Static cards grow with the tree content so the scale change is
        // actually visible; taller trees scroll horizontally when the card
        // is narrower than the scaled content. flexShrink 0 keeps the tree
        // at its own height when a flex parent centers it.
        flexShrink: 0,
        height: interactive ? minHeight : Math.max(minHeight, height + 32),
        overflowX: interactive ? "hidden" : "auto",
        overflowY: "hidden",
        "& .react-flow__handle": { opacity: 0 },
        // Static cards are display-only: let the wheel/touch scroll the page.
        ...(!interactive && {
          "& .react-flow__pane": { cursor: "default", touchAction: "auto" },
        }),
      }}
    >
      {viewport ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesDraggable={false}
          panOnDrag={interactive}
          panOnScroll={false}
          zoomOnScroll={interactive}
          zoomOnPinch={interactive}
          zoomOnDoubleClick={interactive}
          preventScrolling={interactive}
          minZoom={0.1}
          maxZoom={4}
          viewport={interactive ? undefined : viewport}
          onViewportChange={interactive ? undefined : () => {}}
          fitView={interactive}
          fitViewOptions={{ padding: 0.1 }}
          defaultEdgeOptions={{
            type: "default",
            style: { stroke: "#9e9e9e", strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#9e9e9e",
              width: 16,
              height: 16,
            },
          }}
          proOptions={{ hideAttribution: true }}
        >
          {interactive ? <ZoomButtons /> : null}
        </ReactFlow>
      ) : null}
    </Box>
  );
}

/** Floating zoom controls (must be rendered inside the ReactFlow canvas). */
function ZoomButtons() {
  const { t } = useTranslation();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
      <Tooltip title={t("routes.charts.zoomOut")}>
        <span>
          <IconButton size="small" onClick={() => zoomOut({ duration: 150 })}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("routes.charts.zoomIn")}>
        <span>
          <IconButton size="small" onClick={() => zoomIn({ duration: 150 })}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("routes.charts.fit")}>
        <span>
          <IconButton size="small" onClick={() => fitView({ padding: 0.1, duration: 150 })}>
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
