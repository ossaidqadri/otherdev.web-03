// One-off export of the v2 site's content from its public Payload REST API into
// src/content/. Run: bun scripts/export-v2.ts [--offline]   (--offline skips the media URL checks)
// No database credentials needed: projects, blog and media are publicly readable.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = process.env.V2_API ?? "https://otherdev.com/api";
const OUT = join(import.meta.dirname, "..", "src", "content");

interface Upload {
  url: string;
  alt?: string;
  mimeType?: string;
  width?: number;
  height?: number;
}
interface Project {
  title: string;
  slug: string;
  url?: string;
  downloadUrl?: string;
  year: number;
  image: Upload | null;
  media?: { type?: string | null; file: Upload | null }[];
  contentHtml?: string;
  excerpt?: string;
}
interface Post {
  title: string;
  slug: string;
  publishedAt?: string;
  _status?: string;
  excerpt?: string;
  contentHtml?: string;
}

async function list<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const { docs } = (await res.json()) as { docs: T[] };
  return docs;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#039": "'", "#39": "'", nbsp: " " };
const decode = (s: string) => s.replace(/&(#?\w+);/g, (m, e: string) => ENTITIES[e] ?? m);

// Payload's rich text arrives as HTML built from paragraphs, h2, br, strong, code and pre.
// Anything else throws so a new tag is handled on purpose, not dropped.
function toMarkdown(html = ""): string {
  const tags = new Set([...html.matchAll(/<([a-z0-9]+)[\s>]/g)].flatMap((m) => (m[1] ? [m[1]] : [])));
  const unknown = [...tags].filter((t) => !["div", "p", "h2", "br", "strong", "code", "pre"].includes(t));
  if (unknown.length) throw new Error(`unhandled tags: ${unknown.join(", ")}`);
  const md = html
    // The editor leaves empty headings and `<p><br></p>` spacers between blocks; they carry nothing.
    .replace(/<h2[^>]*>\s*<\/h2>/g, "")
    .replace(/<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>/g, "")
    .replace(/<pre[^>]*?data-lang="([\w-]*)"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (_, lang: string, code: string) => `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, "\n\n## $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, "\n\n$1\n\n")
    .replace(/<br\s*\/?>/g, "  \n")
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<code>([\s\S]*?)<\/code>/g, "`$1`")
    .replace(/<\/?div[^>]*>/g, "");
  return `${decode(md).replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

const image = (u: Upload) => ({ src: u.url, alt: u.alt ?? "", width: u.width, height: u.height });
// JSON is a YAML subset, so the frontmatter stays valid without a YAML dependency.
const file = (front: object, body: string) => `---\n${JSON.stringify(front, null, 2)}\n---\n\n${body}`;

const [projects, posts] = await Promise.all([
  list<Project>("projects?limit=100&depth=2&sort=-year"),
  list<Post>("blog?limit=100&depth=1&where[_status][equals]=published"),
]);

for (const dir of ["projects", "blog"]) {
  await rm(join(OUT, dir), { recursive: true, force: true });
  await mkdir(join(OUT, dir), { recursive: true });
}

// Payload leaves empty array rows (null file, or a file with a blank url) behind; drop them.
const filesOf = (p: Project) => (p.media ?? []).flatMap((m) => (m.file?.url ? [m.file] : []));

// HEAD every media URL up front. Dead gallery entries (files that exist neither on R2 nor in
// the v2 repo, and are broken on the live site too) are dropped and listed; a dead cover is fatal.
const urls = new Set(projects.flatMap((p) => [p.image?.url, ...filesOf(p).map((f) => f.url)]).filter((u): u is string => !!u));
const dead = new Set<string>();
if (!process.argv.includes("--offline")) {
  await Promise.all(
    [...urls].map(async (u) => {
      if (!(await fetch(u, { method: "HEAD" })).ok) dead.add(u);
    }),
  );
}

for (const p of projects) {
  if (!p.image || dead.has(p.image.url)) throw new Error(`project ${p.slug} has no usable cover image`);
  const gallery = filesOf(p).filter((f) => !dead.has(f.url));
  const front = {
    title: p.title,
    year: p.year,
    link: p.url || undefined,
    downloadUrl: p.downloadUrl || undefined,
    excerpt: p.excerpt,
    cover: image(p.image),
    gallery: gallery.map(image),
  };
  await writeFile(join(OUT, "projects", `${p.slug}.md`), file(front, toMarkdown(p.contentHtml)));
}

for (const post of posts) {
  const front = { title: post.title, excerpt: post.excerpt, publishedAt: post.publishedAt };
  await writeFile(join(OUT, "blog", `${post.slug}.md`), file(front, toMarkdown(post.contentHtml)));
}

console.log(`projects: ${projects.length}, blog: ${posts.length}, media urls: ${urls.size}, dropped as dead: ${dead.size}`);
if (dead.size) console.log([...dead].sort().join("\n"));
