import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ELEMENT_META } from "../../data/elements";
import type { ElementId } from "../../types";
import ElementDot from "./ElementDot";

interface ElementNodeProps {
  element: ElementId;
  size?: number;
  /** Optional content appended after the element label. */
  children?: ReactNode;
}

/** A mermaid-style colored element pill with icon and localized label. */
export default function ElementNode({ element, size = 16, children }: ElementNodeProps) {
  const { t } = useTranslation();
  const meta = ELEMENT_META[element];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: 1.5,
        bgcolor: meta.color,
        color: meta.textColor,
        boxShadow: 1,
        whiteSpace: "nowrap",
      }}
    >
      <ElementDot element={element} size={size} />
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {t(`elements.${element}`)}
      </Typography>
      {children}
    </Box>
  );
}
