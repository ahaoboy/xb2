import { Avatar, Box, Card, CardContent, IconButton, Stack, Tooltip } from "@mui/material";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslation } from "react-i18next";
import { useCharactersStore } from "../../store/charactersStore";
import type { Character } from "../../types";
import SlotRow from "./SlotRow";

interface CharacterCardProps {
  character: Character;
  index: number;
}

/** A party member: id + actions, 3 stacked element slots. */
export default function CharacterCard({ character, index }: CharacterCardProps) {
  const { t } = useTranslation();
  const setElement = useCharactersStore((state) => state.setElement);
  const toggleSlotDisabled = useCharactersStore((state) => state.toggleSlotDisabled);
  const toggleCharacterDisabled = useCharactersStore((state) => state.toggleCharacterDisabled);
  const clearCharacter = useCharactersStore((state) => state.clearCharacter);

  const lockLabel = character.disabled ? t("characters.enable") : t("characters.disable");
  const hasAnyElement = character.slots.some((slot) => slot.element !== null);

  return (
    <Card
      sx={{
        height: "100%",
        opacity: character.disabled ? 0.55 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Avatar sx={{ bgcolor: "primary.main", flexShrink: 0, mr: 0.5 }}>{index + 1}</Avatar>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={t("characters.clearAll")}>
            <span>
              <IconButton
                size="small"
                onClick={() => clearCharacter(character.id)}
                disabled={!hasAnyElement}
                aria-label={t("characters.clearAll")}
              >
                <ClearAllIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={lockLabel}>
            <IconButton
              size="small"
              onClick={() => toggleCharacterDisabled(character.id)}
              aria-label={lockLabel}
            >
              {character.disabled ? (
                <LockIcon fontSize="small" color="action" />
              ) : (
                <LockOpenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={1}>
          {character.slots.map((slot, slotIndex) => (
            <SlotRow
              key={slotIndex}
              slot={slot}
              slotIndex={slotIndex}
              disabled={character.disabled}
              onChange={(value) => setElement(character.id, slotIndex, value)}
              onToggleDisabled={() => toggleSlotDisabled(character.id, slotIndex)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
