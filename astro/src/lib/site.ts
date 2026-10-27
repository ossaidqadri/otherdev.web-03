import { getEntry } from "astro:content";
import type { CollectionEntry } from "astro:content";

type Page = CollectionEntry<"pages">["data"];
export type PageData<K extends Page["page"]> = Extract<Page, { page: K }>;

/** Shared copy: nav, footer, closing block and UI strings. */
export async function getSite() {
  const entry = await getEntry("site", "global");
  if (!entry) throw new Error("src/content/site.json is missing the `global` entry");
  return entry.data;
}

/** One page's copy from src/content/pages/<id>.json, typed to that page's shape. */
export async function getPage<K extends Page["page"]>(id: K): Promise<PageData<K>> {
  const entry = await getEntry("pages", id);
  if (!entry || entry.data.page !== id) throw new Error(`src/content/pages/${id}.json is missing or has a different "page" value`);
  return entry.data as PageData<K>;
}
