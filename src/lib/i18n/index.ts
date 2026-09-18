import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Only English ships in the initial bundle; every other language is fetched
// on demand the first time it is selected (keeps the first load small).
import en from "./locales/en.json";

const localeLoaders = import.meta.glob("./locales/*.json") as Record<
  string,
  () => Promise<{ default: Record<string, unknown> }>
>;

export const SUPPORTED_LANGUAGES = [
  // Default
  { value: "en", label: "English (US)", region: "Default", flag: "🇺🇸", dir: "ltr" },
  // Southeast Asia
  { value: "id", label: "Indonesia", region: "Southeast Asia", flag: "🇮🇩", dir: "ltr" },
  { value: "ms", label: "Melayu", region: "Southeast Asia", flag: "🇲🇾", dir: "ltr" },
  { value: "vi", label: "Tiếng Việt", region: "Southeast Asia", flag: "🇻🇳", dir: "ltr" },
  { value: "fil", label: "Filipino", region: "Southeast Asia", flag: "🇵🇭", dir: "ltr" },
  // East Asia
  { value: "zh", label: "简体中文", region: "East Asia", flag: "🇨🇳", dir: "ltr" },
  { value: "ja", label: "日本語", region: "East Asia", flag: "🇯🇵", dir: "ltr" },
  { value: "ko", label: "한국어", region: "East Asia", flag: "🇰🇷", dir: "ltr" },
  // Europe & West Asia
  { value: "ru", label: "Русский", region: "Europe & West Asia", flag: "🇷🇺", dir: "ltr" },
  { value: "uk", label: "Українська", region: "Europe & West Asia", flag: "🇺🇦", dir: "ltr" },
  { value: "tr", label: "Türkçe", region: "Europe & West Asia", flag: "🇹🇷", dir: "ltr" },
  { value: "kk", label: "Қазақша", region: "Europe & West Asia", flag: "🇰🇿", dir: "ltr" },
  { value: "tg", label: "Тоҷикӣ", region: "Europe & West Asia", flag: "🇹🇯", dir: "ltr" },
  { value: "uz", label: "O'zbekcha", region: "Europe & West Asia", flag: "🇺🇿", dir: "ltr" },
  { value: "az", label: "Azərbaycanca", region: "Europe & West Asia", flag: "🇦🇿", dir: "ltr" },
  { value: "pl", label: "Polski", region: "Europe & West Asia", flag: "🇵🇱", dir: "ltr" },
  { value: "ro", label: "Română", region: "Europe & West Asia", flag: "🇷🇴", dir: "ltr" },
  { value: "bg", label: "Български", region: "Europe & West Asia", flag: "🇧🇬", dir: "ltr" },
  { value: "cs", label: "Čeština", region: "Europe & West Asia", flag: "🇨🇿", dir: "ltr" },
  { value: "hu", label: "Magyar", region: "Europe & West Asia", flag: "🇭🇺", dir: "ltr" },
  { value: "sk", label: "Slovenčina", region: "Europe & West Asia", flag: "🇸🇰", dir: "ltr" },
  { value: "sr", label: "Српски", region: "Europe & West Asia", flag: "🇷🇸", dir: "ltr" },
  { value: "hr", label: "Hrvatski", region: "Europe & West Asia", flag: "🇭🇷", dir: "ltr" },
  // South Asia
  { value: "hi", label: "हिन्दी", region: "South Asia", flag: "🇮🇳", dir: "ltr" },
  // Middle East
  { value: "ar", label: "Arabic", region: "Middle East", flag: "🇦🇪", dir: "rtl" },
  { value: "fa", label: "Persian", region: "Middle East", flag: "🇮🇷", dir: "rtl" },
  { value: "he", label: "Hebrew", region: "Middle East", flag: "🇮🇱", dir: "rtl" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["value"];

export const isRTL = (lang: string) => {
  const found = SUPPORTED_LANGUAGES.find(l => l.value === lang);
  return found?.dir === "rtl";
};

// Map regional codes back to base for translations
const getTranslationKey = (code: string) => {
  if (code.startsWith("ar")) return "ar";
  return code;
};

const resources: Record<string, { translation: Record<string, unknown> }> = {
  en: { translation: en },
};

const availableLanguages = SUPPORTED_LANGUAGES.map((l) => l.value as string);

const loadedLanguages = new Set<string>(["en"]);

export const loadLanguage = async (code: string) => {
  const key = getTranslationKey(code);
  if (loadedLanguages.has(key)) return;
  const loader = localeLoaders[`./locales/${key}.json`];
  if (!loader) return;
  loadedLanguages.add(key);
  const mod = await loader();
  i18n.addResourceBundle(key, "translation", mod.default, true, true);
  if (getTranslationKey(i18n.language) === key) {
    await i18n.changeLanguage(code);
  }
};

const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  if (isBrowser) {
    i18n.use(LanguageDetector);
  }
  i18n.use(initReactI18next).init({
    resources,
    lng: isBrowser ? undefined : "en",
    fallbackLng: "en",
    supportedLngs: availableLanguages,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    partialBundledLanguages: true,

    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "reseller_language",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

  if (isBrowser && i18n.language) {
    void loadLanguage(i18n.language);
  }
}

// Fetch the translation bundle the first time a language is selected.
i18n.on("languageChanged", (lng) => {
  void loadLanguage(lng);
});

// Handle RTL direction
i18n.on('languageChanged', (lng) => {
  if (typeof document === 'undefined') return;
  document.dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Initial set
if (typeof document !== 'undefined') {
  const initialLang = i18n.language || 'en';
  document.dir = isRTL(initialLang) ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
}

export default i18n;
