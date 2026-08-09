import { Box } from "@mui/material";
import { ELEMENT_META } from "../../data/elements";
import type { ElementId } from "../../types";

interface ElementDotProps {
  element: ElementId;
  size?: number;
}

/** A small element icon rendered from the public asset. */
export default function ElementDot({ element, size = 12 }: ElementDotProps) {
  return (
    <Box
      component="img"
      src={ELEMENT_META[element].icon}
      alt=""
      draggable={false}
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}
