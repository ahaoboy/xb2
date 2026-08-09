import { Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SEAL_IDS } from "../../types";
import type { SealId } from "../../types";

interface SealFilterProps {
  value: SealId | null;
  onChange: (value: SealId | null) => void;
}

/** Filter chips for narrowing results by the resulting seal effect. */
export default function SealFilter({ value, onChange }: SealFilterProps) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {t("routes.sealFilter")}
      </Typography>
      <Chip
        label={t("common.all")}
        onClick={() => onChange(null)}
        variant={value === null ? "filled" : "outlined"}
        color={value === null ? "primary" : "default"}
      />
      {SEAL_IDS.map((seal) => (
        <Chip
          key={seal}
          label={t(`seals.${seal}`)}
          onClick={() => onChange(value === seal ? null : seal)}
          variant={value === seal ? "filled" : "outlined"}
          color={value === seal ? "primary" : "default"}
        />
      ))}
    </Stack>
  );
}
