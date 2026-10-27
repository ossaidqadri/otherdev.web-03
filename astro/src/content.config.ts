import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";

// Media lives on R2 and is referenced by absolute URL; width and height come from the
// upload record so layouts can reserve space before the image loads.
const image = z.object({
  src: z.url(),
  alt: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

// Exported once from the v2 site; edit the files directly from here on.
const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
    tags: z.array(z.enum(["Strategy", "Design", "Technology", "Experience"])).default([]),
    // Bare host or path as v2 stored it (e.g. "carwala.org"), or a full URL.
    link: z.string().optional(),
    downloadUrl: z.url().optional(),
    excerpt: z.string().optional(),
    cover: image,
    gallery: z.array(image).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "*.md" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    publishedAt: z.coerce.date(),
  }),
});

// Client logos for the home grid. `placeholder: true` marks stand-ins that must be replaced
// with otherdev's own clients before launch; the placeholder files live in the git-ignored
// public/clients/ folder.
const clients = defineCollection({
  loader: file("src/content/clients.json"),
  schema: z.object({
    name: z.string(),
    logo: z.string().startsWith("/"),
    // Shown at the bottom of the card on hover. Not filled in until otherdev supplies real categories.
    category: z.string().optional(),
    url: z.url().optional(),
    placeholder: z.boolean().default(false),
  }),
});

const link = z.object({ label: z.string(), href: z.string() });

// Copy that appears on every page: nav, footer, shared closing block and small UI strings.
// One entry, `global`.
const site = defineCollection({
  loader: file("src/content/site.json"),
  schema: z.object({
    name: z.string(),
    // Default meta description, also the Organization description and the llms.txt summary.
    description: z.string(),
    // Meta description per page, keyed by route name (home, work, services, blog).
    seo: z.record(z.string(), z.string()),
    nav: z.array(link),
    cta: link,
    pill: z.array(z.object({ label: z.string(), target: z.string() })),
    closing: z.object({ heading: z.string(), body: z.string(), button: link }),
    footer: z.object({
      cta: link,
      offices: z.array(z.object({ city: z.string(), timezone: z.string(), email: z.string(), phone: z.string() })),
      legalLinks: z.array(link),
      social: z.array(link),
      legal: z.string(),
    }),
    ui: z.record(z.string(), z.string()),
  }),
});

// Per-page copy, one JSON file per page in src/content/pages/. The `page` field matches the file
// name; read a page through getPage() in src/lib/site.ts, which narrows to that page's shape.
const closing = z.object({ heading: z.string(), body: z.string(), button: link });
const pageSchemas = z.discriminatedUnion("page", [
  z.object({
    page: z.literal("home"),
    hero: z.object({ headline: z.string(), button: link, statement: z.string() }),
    clients: z.object({ heading: z.string() }),
    work: z.object({ heading: z.string(), all: link, featured: z.array(z.string()).min(1) }),
    process: z.object({
      heading: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          image: z.string(),
          // Season token the card turns on hover (--semantic-<tone>-weak-dark).
          tone: z.enum(["spring", "summer", "autumn", "winter"]),
        }),
      ),
    }),
    news: z.object({ heading: z.string(), all: link }),
    constellations: z.object({ heading: z.string(), body: z.string(), button: link }),
  }),
  z.object({
    page: z.literal("about"),
    heading: z.string(),
    body: z.string(),
    principlesHeading: z.string(),
    principles: z.array(z.object({ title: z.string(), body: z.string() })),
    teamHeading: z.string(),
    team: z.array(z.object({ name: z.string(), role: z.string(), photo: image, linkedin: z.url().optional() })),
  }),
  z.object({
    page: z.literal("approach"),
    heading: z.string(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })),
    projectsHeading: z.string(),
    closing,
  }),
  z.object({
    page: z.literal("newsletter"),
    heading: z.string(),
    body: z.string(),
    interestsLabel: z.string(),
    interests: z.array(z.string()),
    consent: z.string(),
    note: z.string(),
    fields: z.object({ firstName: z.string(), lastName: z.string(), email: z.string() }),
  }),
  z.object({ page: z.literal("contact"), heading: z.string(), body: z.string(), links: z.array(link) }),
  z.object({
    page: z.literal("services"),
    hero: z.object({ heading: z.string(), sub: z.string() }),
    closing,
  }),
  z.object({ page: z.literal("work"), hero: z.object({ heading: z.string(), sub: z.string() }) }),
  z.object({ page: z.literal("blog"), hero: z.object({ heading: z.string(), sub: z.string() }) }),
  z.object({ page: z.literal("notFound"), heading: z.string(), link }),
]);
const pages = defineCollection({
  // Id from the `page` field: the default id slugifies file names (notFound becomes notfound).
  loader: glob({ base: "./src/content/pages", pattern: "*.json", generateId: ({ data }) => String(data.page) }),
  schema: pageSchemas,
});
// Service groups for /services, one entry per group.
const services = defineCollection({
  loader: file("src/content/services.json"),
  schema: z.object({ order: z.number().int(), title: z.string(), intro: z.string(), items: z.array(z.string()) }),
});

// Legal pages, one markdown file each.
const legal = defineCollection({
  loader: glob({ base: "./src/content/legal", pattern: "*.md" }),
  schema: z.object({ title: z.string(), updated: z.coerce.date() }),
});

export const collections = { projects, blog, clients, site, pages, services, legal };
