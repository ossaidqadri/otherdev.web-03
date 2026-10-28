// Checks every translation against English: same shape, same structural values. Usage: bun scripts/check-i18n.ts [locale...]
// Exits 1 on any problem. English is the source of truth; a translator may change wording, never structure.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultLocale, localeCodes } from "../src/i18n/locales";

const content = join(import.meta.dir, "../src/content");

// Keys whose value is data, not wording: links, ids, enums, numbers, contacts, people and brand names.
const KEEP = new Set(["page", "tone", "href", "src", "url", "mapUrl", "timezone", "phone", "copy", "id", "order", "width", "height", "featured", "target", "name", "image"]);

// Any value that is a URL, a site path or an email stays as is, whatever its key.
const DATA = /^(https?:\/\/|\/|[^\s@]+@[^\s@]+$)/;

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as unknown;

function files(locale: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const dir of ["site", "services"]) {
    const f = join(content, dir, `${locale}.json`);
    if (existsSync(f)) out[`${dir}/${locale}.json`] = f;
  }
  const pages = join(content, "pages", locale);
  if (existsSync(pages)) for (const name of readdirSync(pages)) out[`pages/${locale}/${name}`] = join(pages, name);
  return out;
}

function compare(en: unknown, tr: unknown, path: string, key: string, problems: string[]) {
  if (Array.isArray(en)) {
    if (!Array.isArray(tr)) return problems.push(`${path}: expected an array`);
    if (en.length !== tr.length) problems.push(`${path}: ${tr.length} items, English has ${en.length}`);
    en.forEach((v, i) => i < tr.length && compare(v, tr[i], `${path}[${i}]`, key, problems));
  } else if (en !== null && typeof en === "object") {
    if (tr === null || typeof tr !== "object" || Array.isArray(tr)) return problems.push(`${path}: expected an object`);
    const e = en as Record<string, unknown>;
    const t = tr as Record<string, unknown>;
    for (const k of Object.keys(e)) k in t ? compare(e[k], t[k], `${path}.${k}`, k, problems) : problems.push(`${path}.${k}: missing`);
    for (const k of Object.keys(t)) if (!(k in e)) problems.push(`${path}.${k}: not in English`);
  } else if (typeof en !== typeof tr) {
    problems.push(`${path}: expected ${typeof en}, got ${typeof tr}`);
  } else if (typeof en === "string") {
    const keep = KEEP.has(key) || DATA.test(en);
    if (keep && en !== tr) problems.push(`${path}: must stay "${en}", got "${tr}"`);
    else if (!keep && (tr as string).trim() === "") problems.push(`${path}: empty`);
    else if (!keep && en.length > 30 && en === tr) problems.push(`${path}: still English`);
  } else if (en !== tr) {
    problems.push(`${path}: must stay ${String(en)}, got ${String(tr)}`);
  }
}

const requested = process.argv.slice(2);
const targets = (requested.length ? requested : localeCodes).filter((l) => l !== defaultLocale);
const source = files(defaultLocale);
let failed = false;

for (const locale of targets) {
  const have = files(locale);
  const problems: string[] = [];
  if (Object.keys(have).length === 0) {
    console.log(`${locale}: no content yet`);
    continue;
  }
  for (const [name, enPath] of Object.entries(source)) {
    const trName = name.replace(`/${defaultLocale}`, `/${locale}`);
    const trPath = have[trName];
    if (!trPath) problems.push(`${trName}: file missing`);
    else compare(readJson(enPath), readJson(trPath), trName, "", problems);
  }
  console.log(problems.length ? `${locale}: ${problems.length} problem(s)\n  ${problems.join("\n  ")}` : `${locale}: ok`);
  failed ||= problems.length > 0;
}
process.exit(failed ? 1 : 0);
