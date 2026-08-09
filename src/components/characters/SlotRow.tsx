import { Box, IconButton, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslation } from "react-i18next";
import type { CharacterSlot, ElementId } from "../../types";
import ElementSelect from "./ElementSelect";

interface SlotRowProps {
  slot: CharacterSlot;
  slotIndex: number;
  /** Character-level disable: locks the whole card. */
  disabled?: boolean;
  onChange: (element: ElementId | null) => void;
  onToggleDisabled: () => void;
}

/** A stacked element slot: select plus a lock toggle. */
export default function SlotRow({
  slot,
  slotIndex,
  disabled = false,
  onChange,
  onToggleDisabled,
}: SlotRowProps) {
  const { t } = useTranslation();
  const lockLabel = slot.disabled ? t("characters.enableSlot") : t("characters.disableSlot");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ElementSelect
          ariaLabel={t("characters.slot", { n: slotIndex + 1 })}
          value={slot.element}
          disabled={disabled || slot.disabled}
          onChange={onChange}
        />
      </Box>
      <Tooltip title={lockLabel}>
        <span>
          <IconButton
            size="small"
            onClick={onToggleDisabled}
            disabled={disabled}
            aria-label={lockLabel}
            sx={{ flexShrink: 0 }}
          >
            {slot.disabled ? (
              <LockIcon fontSize="small" color="action" />
            ) : (
              <LockOpenIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
