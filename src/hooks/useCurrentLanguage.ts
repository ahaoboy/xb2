import { useTranslation } from "react-i18next";

/** Returns the resolved UI language code (falls back to English). */
export function useCurrentLanguage(): string {
  const { i18n } = useTranslation();
  return i18n.resolvedLanguage ?? "en";
}
