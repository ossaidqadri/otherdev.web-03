// The one locale list. astro.config.mjs reads it too, so it imports nothing from `astro:*`.
// A locale gets routes once its copy exists in src/content/site/<code>.json.

export const defaultLocale = "en";

export interface LocaleInfo {
  /** BCP 47 tag for <html lang>, hreflang and Intl. */
  lang: string;
  dir: "ltr" | "rtl";
  /** og:locale value. */
  og: string;
}

// The 20 most spoken languages (Ethnologue, total speakers). Next in line, left out for now: Punjabi, Persian,
// Swahili, Hausa, Thai. Add one by listing it here and adding its content.
export const locales = {
  en: { lang: "en", dir: "ltr", og: "en_GB" },
  zh: { lang: "zh-Hans", dir: "ltr", og: "zh_CN" },
  hi: { lang: "hi", dir: "ltr", og: "hi_IN" },
  es: { lang: "es", dir: "ltr", og: "es_ES" },
  fr: { lang: "fr", dir: "ltr", og: "fr_FR" },
  ar: { lang: "ar", dir: "rtl", og: "ar_AR" },
  bn: { lang: "bn", dir: "ltr", og: "bn_BD" },
  pt: { lang: "pt", dir: "ltr", og: "pt_BR" },
  ru: { lang: "ru", dir: "ltr", og: "ru_RU" },
  ur: { lang: "ur", dir: "rtl", og: "ur_PK" },
  id: { lang: "id", dir: "ltr", og: "id_ID" },
  de: { lang: "de", dir: "ltr", og: "de_DE" },
  ja: { lang: "ja", dir: "ltr", og: "ja_JP" },
  mr: { lang: "mr", dir: "ltr", og: "mr_IN" },
  te: { lang: "te", dir: "ltr", og: "te_IN" },
  tr: { lang: "tr", dir: "ltr", og: "tr_TR" },
  ta: { lang: "ta", dir: "ltr", og: "ta_IN" },
  vi: { lang: "vi", dir: "ltr", og: "vi_VN" },
  ko: { lang: "ko", dir: "ltr", og: "ko_KR" },
  it: { lang: "it", dir: "ltr", og: "it_IT" },
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
