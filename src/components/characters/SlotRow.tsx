import { Box, IconButton, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslation } from "react-i18next";
import type { CharacterSlot, ElementId } from "../../types";
import ElementSelect from "./ElementSelect";

interface SlotRowProps {
  slot: CharacterSlot;
  slotIndex: number;
  onChange: (element: ElementId | null) => void;
  onToggleDisabled: () => void;
}

/** A single element slot: select plus a lock toggle. */
export default function SlotRow({ slot, slotIndex, onChange, onToggleDisabled }: SlotRowProps) {
  const { t } = useTranslation();
  const lockLabel = slot.disabled ? t("characters.enableSlot") : t("characters.disableSlot");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ElementSelect
          label={t("characters.slot", { n: slotIndex + 1 })}
          value={slot.element}
          disabled={slot.disabled}
          onChange={onChange}
        />
      </Box>
      <Tooltip title={lockLabel}>
        <IconButton
          size="small"
          onClick={onToggleDisabled}
          aria-label={lockLabel}
          sx={{ flexShrink: 0 }}
        >
          {slot.disabled ? (
            <LockIcon fontSize="small" color="action" />
          ) : (
            <LockOpenIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
