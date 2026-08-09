import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import zh from "./locales/zh";

export const SUPPORTED_LANGUAGES = ["en", "zh"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Detects the user's preferred language from the browser configuration. */
export function detectBrowserLanguage(): Language {
  const browserLang = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  return browserLang.startsWith("zh") ? "zh" : "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: detectBrowserLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
