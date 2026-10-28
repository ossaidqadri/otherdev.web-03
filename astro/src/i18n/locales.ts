// The one locale list. astro.config.mjs reads it too, so it imports nothing from `astro:*`.
// A locale gets routes once its copy exists in src/content/site/<code>.json; `reviewed` decides
// whether search engines may see it (machine drafts stay noindex and out of the sitemap).

export const defaultLocale = "en";

export interface LocaleInfo {
  /** BCP 47 tag for <html lang>, hreflang and Intl. */
  lang: string;
  dir: "ltr" | "rtl";
  /** og:locale value. */
  og: string;
  /** A native speaker has signed off the copy. */
  reviewed: boolean;
}

// The 20 most spoken languages (Ethnologue, total speakers). Next in line, left out for now: Punjabi, Persian,
// Swahili, Hausa, Thai. Add one by listing it here and adding its content.
export const locales = {
  en: { lang: "en", dir: "ltr", og: "en_GB", reviewed: true },
  zh: { lang: "zh-Hans", dir: "ltr", og: "zh_CN", reviewed: false },
  hi: { lang: "hi", dir: "ltr", og: "hi_IN", reviewed: false },
  es: { lang: "es", dir: "ltr", og: "es_ES", reviewed: false },
  fr: { lang: "fr", dir: "ltr", og: "fr_FR", reviewed: false },
  ar: { lang: "ar", dir: "rtl", og: "ar_AR", reviewed: false },
  bn: { lang: "bn", dir: "ltr", og: "bn_BD", reviewed: false },
  pt: { lang: "pt", dir: "ltr", og: "pt_BR", reviewed: false },
  ru: { lang: "ru", dir: "ltr", og: "ru_RU", reviewed: false },
  ur: { lang: "ur", dir: "rtl", og: "ur_PK", reviewed: false },
  id: { lang: "id", dir: "ltr", og: "id_ID", reviewed: false },
  de: { lang: "de", dir: "ltr", og: "de_DE", reviewed: false },
  ja: { lang: "ja", dir: "ltr", og: "ja_JP", reviewed: false },
  mr: { lang: "mr", dir: "ltr", og: "mr_IN", reviewed: false },
  te: { lang: "te", dir: "ltr", og: "te_IN", reviewed: false },
  tr: { lang: "tr", dir: "ltr", og: "tr_TR", reviewed: false },
  ta: { lang: "ta", dir: "ltr", og: "ta_IN", reviewed: false },
  vi: { lang: "vi", dir: "ltr", og: "vi_VN", reviewed: false },
  ko: { lang: "ko", dir: "ltr", og: "ko_KR", reviewed: false },
  it: { lang: "it", dir: "ltr", og: "it_IT", reviewed: false },
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
