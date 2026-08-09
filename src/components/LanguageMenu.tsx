import { useState } from "react";
import type { MouseEvent } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type Language } from "../i18n";
import { useSettingsStore } from "../store/settingsStore";

/** Language switch: English / 中文. Defaults to the browser language. */
export default function LanguageMenu() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    closeMenu();
  };

  return (
    <>
      <Tooltip title={t("language.label")}>
        <IconButton
          onClick={openMenu}
          aria-label={t("language.label")}
          aria-haspopup="menu"
          aria-expanded={anchorEl !== null}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={closeMenu}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <MenuItem key={lang} selected={lang === language} onClick={() => selectLanguage(lang)}>
            <ListItemIcon>{lang === language ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
            <ListItemText>{t(`language.${lang}`)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
