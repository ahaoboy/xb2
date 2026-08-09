import { Button, Chip, Grid, Stack, Tooltip, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTranslation } from "react-i18next";
import { MAX_CHARACTERS, useCharactersStore } from "../../store/charactersStore";
import { computeAutoFill } from "../../utils/autofill";
import CharacterCard from "./CharacterCard";

/** Party management: add/remove characters (1-3), each with 3 element slots. */
export default function CharacterPanel() {
  const { t } = useTranslation();
  const characters = useCharactersStore((state) => state.characters);
  const addCharacter = useCharactersStore((state) => state.addCharacter);
  const fillSlots = useCharactersStore((state) => state.fillSlots);
  const canAdd = characters.length < MAX_CHARACTERS;

  const hasEmptySlots = characters.some((character) =>
    character.slots.some((slot) => !slot.disabled && slot.element === null),
  );

  const handleAutoFill = () => {
    fillSlots(computeAutoFill(characters));
  };

  return (
    <section aria-label={t("characters.title")}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            {t("characters.title")}
          </Typography>
          <Chip
            size="small"
            variant="outlined"
            label={`${characters.length} / ${MAX_CHARACTERS}`}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title={t("characters.autoFillHint")}>
            <span>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleAutoFill}
                disabled={!hasEmptySlots}
              >
                {t("characters.autoFill")}
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={addCharacter}
            disabled={!canAdd}
            title={canAdd ? undefined : t("characters.maxReached")}
          >
            {t("characters.add")}
          </Button>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("characters.hint")}
      </Typography>

      <Grid container spacing={2}>
        {characters.map((character, index) => (
          <Grid key={character.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <CharacterCard character={character} index={index} />
          </Grid>
        ))}
      </Grid>
    </section>
  );
}
