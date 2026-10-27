import type { APIRoute } from "astro";

// Built from `site` so preview builds (SITE_URL) point at their own sitemap. Content-Signal
// (contentsignals.org): searchable and quotable in answers, not used for model training.
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nContent-Signal: ai-train=no, search=yes, ai-input=yes\nAllow: /\n\nSitemap: ${new URL("/sitemap-index.xml", site)}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
