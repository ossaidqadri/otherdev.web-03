import { getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";
import { defaultLocale, toLocale } from "@/i18n/locales";
import { localize } from "@/i18n/url";
import type { Locale } from "@/i18n/locales";

type Page = CollectionEntry<"pages">["data"];
export type PageData<K extends Page["page"]> = Extract<Page, { page: K }>;

/** Content stays locale-agnostic (`href: "/contact"`); every site-relative `href` is prefixed once, here. */
function localizeLinks<T>(value: T, locale: Locale): T {
  if (Array.isArray(value)) return value.map((v) => localizeLinks(v, locale)) as T;
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, k === "href" && typeof v === "string" ? localize(v, locale) : localizeLinks(v, locale)]),
  ) as T;
}

/** Shared copy: nav, footer, closing block and UI strings. One file per locale, src/content/site/<locale>.json. */
export async function getSite(locale?: string) {
  const code = toLocale(locale);
  const entry = (await getEntry("site", code)) ?? (await getEntry("site", defaultLocale));
  if (!entry) throw new Error(`src/content/site/${defaultLocale}.json is missing`);
  return localizeLinks(entry.data, code);
}

/** Service groups for /services, from src/content/services/<locale>.json. */
export async function getServices(locale?: string) {
  const code = toLocale(locale);
  const entry = (await getEntry("services", code)) ?? (await getEntry("services", defaultLocale));
  if (!entry) throw new Error(`src/content/services/${defaultLocale}.json is missing`);
  return entry.data.groups.toSorted((a, b) => a.order - b.order);
}

/** One page's copy, src/content/pages/<locale>/<id>.json, typed to that page's shape. */
export async function getPage<K extends Page["page"]>(id: K, locale?: string): Promise<PageData<K>> {
  const code = toLocale(locale);
  const entry = (await getEntry("pages", `${code}/${id}`)) ?? (await getEntry("pages", `${defaultLocale}/${id}`));
  if (!entry || entry.data.page !== id) throw new Error(`src/content/pages/${defaultLocale}/${id}.json is missing or has a different "page" value`);
  return localizeLinks(entry.data, code) as PageData<K>;
}
