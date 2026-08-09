import {
  Avatar,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useCharactersStore } from "../../store/charactersStore";
import type { Character } from "../../types";
import SlotRow from "./SlotRow";

interface CharacterCardProps {
  character: Character;
  index: number;
}

/** A party member: name plus 3 element slots laid out responsively. */
export default function CharacterCard({ character, index }: CharacterCardProps) {
  const { t } = useTranslation();
  const canDelete = useCharactersStore((state) => state.characters.length > 1);
  const removeCharacter = useCharactersStore((state) => state.removeCharacter);
  const updateName = useCharactersStore((state) => state.updateName);
  const setElement = useCharactersStore((state) => state.setElement);
  const toggleSlotDisabled = useCharactersStore((state) => state.toggleSlotDisabled);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar sx={{ bgcolor: "primary.main", flexShrink: 0 }}>{index + 1}</Avatar>
          <TextField
            size="small"
            fullWidth
            label={t("characters.nameLabel")}
            value={character.name}
            onChange={(event) => updateName(character.id, event.target.value)}
          />
          <Tooltip title={canDelete ? t("characters.delete") : t("characters.minReached")}>
            <span>
              <IconButton
                onClick={() => removeCharacter(character.id)}
                disabled={!canDelete}
                aria-label={t("characters.delete")}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Grid container spacing={1}>
          {character.slots.map((slot, slotIndex) => (
            <Grid key={slotIndex} size={{ xs: 12, sm: 4 }}>
              <SlotRow
                slot={slot}
                slotIndex={slotIndex}
                onChange={(element) => setElement(character.id, slotIndex, element)}
                onToggleDisabled={() => toggleSlotDisabled(character.id, slotIndex)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
