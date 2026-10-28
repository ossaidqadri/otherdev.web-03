import { getCollection } from "astro:content";
import type { GetStaticPaths } from "astro";
import { defaultLocale, isLocale } from "@/i18n/locales";

// Shared by every page under src/pages/[...locale]/. A locale gets pages as soon as its
// src/content/site/<code>.json exists; the default locale is the unprefixed route (undefined param).
export const getStaticPaths = (async () => {
  const codes = (await getCollection("site")).map((entry) => entry.id).filter(isLocale);
  return codes.map((locale) => ({ params: { locale: locale === defaultLocale ? undefined : locale } }));
}) satisfies GetStaticPaths;
