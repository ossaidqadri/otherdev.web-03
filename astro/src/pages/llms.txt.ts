import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getSite } from "@/lib/site";

// https://llmstxt.org: a Markdown index of the site for language models, built from the same
// content the pages render so it never drifts. Trailing slashes match the canonical URLs.
export const GET: APIRoute = async ({ site }) => {
  const { name, description, nav, footer } = await getSite();
  const abs = (path: string) => new URL(path.replace(/\/?$/, "/"), site).href;
  const md = (path: string) => new URL(`${path}.md`, site).href;
  const projects = (await getCollection("projects")).sort((a, b) => b.data.year - a.data.year);
  const posts = (await getCollection("blog")).sort((a, b) => +b.data.publishedAt - +a.data.publishedAt);
  const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
  const office = footer.offices[0];

  const body = [
    `# ${name}`,
    "",
    `> ${description}`,
    "",
    "Work and blog links point at Markdown versions. Drop the `.md` suffix for the rendered page.",
    "",
    "## Pages",
    "",
    ...nav.map((l) => `- [${l.label}](${abs(l.href)})`),
    "",
    "## Services",
    "",
    ...services.map((s) => `- ${s.data.title}: ${s.data.intro}`),
    "",
    "## Work",
    "",
    ...projects.map((p) => `- [${p.data.title}](${md(`/work/${p.id}`)})${p.data.excerpt ? `: ${p.data.excerpt}` : ""}`),
    "",
    "## Blog",
    "",
    ...posts.map((p) => `- [${p.data.title}](${md(`/blog/${p.id}`)})${p.data.excerpt ? `: ${p.data.excerpt}` : ""}`),
    "",
    "## Contact",
    "",
    ...(office ? [`- ${office.city}: [${office.email}](mailto:${office.email}), ${office.phone}`] : []),
    ...footer.social.map((s) => `- [${s.label}](${s.href})`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${new URL("/sitemap-index.xml", site).href})`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
