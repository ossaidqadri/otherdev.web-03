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

// Five languages, chosen for the studio's markets: English, Urdu (home), Arabic (Gulf), Chinese and Spanish (reach).
// Add one by listing it here and adding its content under src/content/{site,services,pages}; `bun run check:i18n <code>` gates it.
export const locales = {
  en: { lang: "en", dir: "ltr", og: "en_GB", latin: true },
  zh: { lang: "zh-Hans", dir: "ltr", og: "zh_CN", latin: false },
  es: { lang: "es", dir: "ltr", og: "es_ES", latin: true },
  ar: { lang: "ar", dir: "rtl", og: "ar_AR", latin: false },
  ur: { lang: "ur", dir: "rtl", og: "ur_PK", latin: false },
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
