import { getRelativeLocaleUrl } from "astro:i18n";
import { type Locale, defaultLocale } from "@/i18n/locales";

// Case studies and posts exist in English only, so their links never take a locale prefix. Legal pages are translated
// (and fall back to English text under the locale's URL). Once an entry has a translation this becomes a lookup in the content.
const untranslatedRoutes = /^\/(work|blog)\/./;

/** Prefixes a site-relative path with the locale; external links, anchors and English-only entries pass through. */
export function localize(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//") || untranslatedRoutes.test(href)) return href;
  return getRelativeLocaleUrl(locale, href);
}

/** The path without its locale prefix: the key shared by every translation of a page. */
export function stripLocale(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) return pathname;
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}
