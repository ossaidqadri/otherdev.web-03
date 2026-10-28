// The one locale list. astro.config.mjs reads it too, so it imports nothing from `astro:*`.
// A locale gets routes once its copy exists in src/content/site/<code>.json.

export const defaultLocale = "en";

export interface LocaleInfo {
  /** BCP 47 tag for <html lang>, hreflang and Intl. */
  lang: string;
  dir: "ltr" | "rtl";
  /** og:locale value. */
  og: string;
  /** Latin-style tracking and leading are safe. Arabic joining, Indic conjuncts, CJK and Vietnamese stacked marks need neutral tracking and more line height. */
  latin: boolean;
}

// The 20 most spoken languages (Ethnologue, total speakers). Next in line, left out for now: Punjabi, Persian,
// Swahili, Hausa, Thai. Add one by listing it here and adding its content.
export const locales = {
  en: { lang: "en", dir: "ltr", og: "en_GB", latin: true },
  zh: { lang: "zh-Hans", dir: "ltr", og: "zh_CN", latin: false },
  hi: { lang: "hi", dir: "ltr", og: "hi_IN", latin: false },
  es: { lang: "es", dir: "ltr", og: "es_ES", latin: true },
  fr: { lang: "fr", dir: "ltr", og: "fr_FR", latin: true },
  ar: { lang: "ar", dir: "rtl", og: "ar_AR", latin: false },
  bn: { lang: "bn", dir: "ltr", og: "bn_BD", latin: false },
  pt: { lang: "pt", dir: "ltr", og: "pt_BR", latin: true },
  ru: { lang: "ru", dir: "ltr", og: "ru_RU", latin: true },
  ur: { lang: "ur", dir: "rtl", og: "ur_PK", latin: false },
  id: { lang: "id", dir: "ltr", og: "id_ID", latin: true },
  de: { lang: "de", dir: "ltr", og: "de_DE", latin: true },
  ja: { lang: "ja", dir: "ltr", og: "ja_JP", latin: false },
  mr: { lang: "mr", dir: "ltr", og: "mr_IN", latin: false },
  te: { lang: "te", dir: "ltr", og: "te_IN", latin: false },
  tr: { lang: "tr", dir: "ltr", og: "tr_TR", latin: true },
  ta: { lang: "ta", dir: "ltr", og: "ta_IN", latin: false },
  vi: { lang: "vi", dir: "ltr", og: "vi_VN", latin: false },
  ko: { lang: "ko", dir: "ltr", og: "ko_KR", latin: false },
  it: { lang: "it", dir: "ltr", og: "it_IT", latin: true },
} as const satisfies Record<string, LocaleInfo>;

export type Locale = keyof typeof locales;
export const localeCodes = Object.keys(locales) as Locale[];

export function isLocale(code: string | undefined): code is Locale {
  return code !== undefined && code in locales;
}

/** BCP 47 tag for `Intl` from `Astro.currentLocale`. */
export function langOf(code: string | undefined): string {
  return locales[toLocale(code)].lang;
}

/** Narrows `Astro.currentLocale` (a string, undefined without i18n) to a configured locale. */
export function toLocale(code: string | undefined): Locale {
  return isLocale(code) ? code : defaultLocale;
}
