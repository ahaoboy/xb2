import { Button, Chip, Grid, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../store/settingsStore";
import { MAX_CHARACTERS, useCharactersStore } from "../../store/charactersStore";
import { computeAutoFill, type AutofillStrategy } from "../../utils/autofill";
import CharacterCard from "./CharacterCard";

const STRATEGIES: AutofillStrategy[] = ["perfect", "quality", "coverage"];

/** Party management: 3 fixed characters, each with 3 element slots. */
export default function CharacterPanel() {
  const { t } = useTranslation();
  const characters = useCharactersStore((state) => state.characters);
  const fillSlots = useCharactersStore((state) => state.fillSlots);
  const resetAll = useCharactersStore((state) => state.resetAll);
  const strategy = useSettingsStore((state) => state.autofillStrategy);
  const setStrategy = useSettingsStore((state) => state.setAutofillStrategy);

  const hasEmptySlots = characters.some(
    (character) =>
      !character.disabled &&
      character.slots.some((slot) => !slot.disabled && slot.element === null),
  );

  const isDirty = characters.some(
    (character) =>
      character.disabled || character.slots.some((slot) => slot.element !== null || slot.disabled),
  );

  const handleStrategyChange = (_event: MouseEvent<HTMLElement>, value: AutofillStrategy | null) => {
    if (value !== null) setStrategy(value);
  };

  const handleAutoFill = () => {
    fillSlots(computeAutoFill(characters, strategy));
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
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title={t("characters.autoFillStrategyHint")}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={strategy}
              onChange={handleStrategyChange}
              aria-label={t("characters.autoFillStrategy")}
            >
              {STRATEGIES.map((item) => (
                <ToggleButton key={item} value={item}>
                  {t(`characters.strategy.${item}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Tooltip>
          <Tooltip title={t("characters.resetHint")}>
            <span>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltIcon />}
                onClick={resetAll}
                disabled={!isDirty}
              >
                {t("characters.reset")}
              </Button>
            </span>
          </Tooltip>
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
