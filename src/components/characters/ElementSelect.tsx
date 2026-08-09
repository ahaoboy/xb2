import { useId } from "react";
import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ELEMENT_IDS } from "../../types";
import type { ElementId } from "../../types";
import ElementDot from "../elements/ElementDot";

interface ElementSelectProps {
  label: string;
  value: ElementId | null;
  onChange: (value: ElementId | null) => void;
  disabled?: boolean;
}

/** A single element slot: one of the 8 elements or empty. */
export default function ElementSelect({
  label,
  value,
  onChange,
  disabled = false,
}: ElementSelectProps) {
  const { t } = useTranslation();
  const labelId = useId();

  return (
    <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
      <InputLabel id={`${labelId}-label`}>{label}</InputLabel>
      <Select<string>
        labelId={`${labelId}-label`}
        id={`${labelId}-select`}
        label={label}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : (event.target.value as ElementId))
        }
        renderValue={(selected) => {
          if (selected === "") {
            return (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {t("common.empty")}
              </Typography>
            );
          }
          return <ElementOption element={selected as ElementId} compact />;
        }}
      >
        <MenuItem value="">{t("common.empty")}</MenuItem>
        {ELEMENT_IDS.map((element) => (
          <MenuItem key={element} value={element}>
            <ElementOption element={element} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ElementOption({ element, compact = false }: { element: ElementId; compact?: boolean }) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0, maxWidth: "100%" }}>
      <ElementDot element={element} />
      <Typography
        variant="body2"
        noWrap
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...(compact ? { maxWidth: "100%" } : {}),
        }}
      >
        {t(`elements.${element}`)}
      </Typography>
    </Stack>
  );
}
