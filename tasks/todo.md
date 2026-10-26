# otherdev web v3: plan

Rebuild the otherdev site as a standalone static Astro site. Content and media come from v2; layout, type and motion follow a reference site. Read this, `astro/AGENTS.md` and `astro/docs/research/reference-site.md` (git-ignored, local only) before doing anything.

## Settled decisions

- **Scope:** "v2" means its content and media, not its design. The chat is an afterthought, built last.
- **Stack:** Astro 7 + Svelte 5, fully static, Cloudflare Workers assets-only deploy. App lives in `astro/` (repo root is only `tasks/` and `.git`).
- **No CMS, no database, no Mongo.** Content is files in the repo behind Zod schemas. Media goes to R2 where possible. Nothing hardcoded in components.
- **No brand-sharing layer, no monorepo, and the reference site is never named in this repo.** All reference material (screenshots, extracted assets, notes) lives in git-ignored folders: `astro/docs/research/`, `astro/docs/design-references/`, `astro/.clone/`, `astro/reference/`.
- **Motion and content layers may be framework-specific** (Astro content collections, GSAP/Lenis scripts).
- **Chat later:** Svelte island, Vercel AI SDK (`ai` + `@ai-sdk/svelte`, both from `vercel/ai`). Model provider undecided; Vercel AI Gateway is not required.
- **Working rules:** bun only; atomic local commits, never push; commit identity is the repo's `Ossaid`; ask before starting a dev server; run typecheck and build freely. For anything unfamiliar, survey GitHub projects and ctx7, compare approaches, then write (now a global rule).

## Done (3 local commits, nothing pushed)

- `999b99b` scaffold: Astro 7.4.2, Svelte 5.57.3, GSAP 3.15, Lenis 1.3.27, wrangler, `astro.config.mjs` (static, `SITE_URL` default `https://otherdev.com`, bun-store `fs.allow`, `optimizeDeps`), assets-only `wrangler.jsonc` (worker `otherdev`, no routes yet), `.mcp.json` (svelte, astro-docs), `AGENTS.md`/`CLAUDE.md`, `.gitignore` with clone-artifact entries.
- `e9b030f` skills in `astro/.agents/skills` and `astro/.claude/skills`: gsap-core/timeline/scrolltrigger/plugins/performance/utils/frameworks, lenis (written here, no official one), svelte-code-writer, svelte-core-bestpractices, wrangler, web-perf, motion, shadcn-svelte.
- `5683299` workers-best-practices, ai-sdk.
- `bun run typecheck` passes (0 errors, 1 svelte-check warning not yet looked at); `bun run build` builds the placeholder page.

## Verified facts (don't re-derive)

- Astro 7 needs Node >=22.12 (scaffold sets >=22.23.4), uses Vite 8; removed `@astrojs/db` and the `astro:transitions` event constants. Content collections are unchanged from v6: `defineCollection` with `glob`/`file` loader and a Zod 4 schema (`import { z } from 'astro/zod'`). Legacy collections and `<ViewTransitions />` are gone; use `<ClientRouter />` (lifecycle: `astro:before-preparation`, `after-preparation`, `before-swap`, `after-swap`, `page-load`).
- **TypeScript must stay on 6.** `@astrojs/check` and `@astrojs/svelte` peer-depend on `^5 || ^6`; the scaffold's TS 7.0.2 was unsupported. `@types/node` is installed because the config runs in Node, not `@types/bun`.
- Static site needs no adapter. `@astrojs/cloudflare` v13+ is needed only when a `prerender = false` route (the chat) appears; its Wrangler `main` becomes `@astrojs/cloudflare/entrypoints/server` and prerendered pages run in `workerd` (`prerenderEnvironment: 'node'` restores Node).
- Without `wrangler.jsonc`, `wrangler deploy` runs `astro add cloudflare` and adds an unused adapter, KV and Images binding.
- Fonts: use `fontProviders.local()`. In Astro 7.4 `npm()` hands `file://` URLs to `fetch()` and stops the dev server.
- Don't run `astro check` while a dev server is up (re-optimises the shared `.vite` cache, breaks islands).
- Lenis + GSAP wiring: `new Lenis({ autoRaf: false })`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, remove the ticker callback and `destroy()` on teardown. Lenis honours `prefers-reduced-motion` by default. Nested scroll areas take `data-lenis-prevent`. Under `<ClientRouter />` the plan (init on `astro:page-load`, kill ScrollTrigger before swap, keep the Lenis instance) is inferred, not yet tested.
- AI SDK 7 server route shape (Web `Response`, works on Workers): `streamText` then `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`. Svelte client: `new Chat({})` from `@ai-sdk/svelte`. Documented only for SvelteKit; mounting in an Astro island is **unverified**.
- SvelteKit 3 (for reference if Astro is ever dropped): needs Node 22.17+, TS 6, Svelte 5.57.1+, Vite 8.0.12+; `$lib` became `#lib` via `package.json` imports; `adapter-cloudflare` takes `env`/`waitUntil` from `cloudflare:workers`.

## v2 source inventory (`D:\work\otherdev-web-v2\web`)

- Pages: `/`, `/about`, `/blog`, `/blog/[slug]`, `/blog/search`, `/work`, `/work/[slug]`, `/loom` (chat). API routes: contact, lead-capture, chat/stream, transcribe, elevenlabs, upload-url, process-document.
- **Live content is in Payload/Mongo, not `src/lib/projects.ts`.** Pages call `src/lib/payload-api.ts`. `projects.ts` is an older typed array (19 entries: id, title, slug, image, description, url, media[], year, downloadUrl) and is only a fallback source.
- **The live Payload REST API is public.** Checked 2026-10-27: `https://otherdev.com/api/projects?limit=100&depth=2` returns 200 with 18 projects; `/api/blog` returns 200 with 1 post; `/api/globals/about` returns 403 (scrape the `/about` page instead). So the export needs no DB credentials.
- Blog posts store Lexical rich text plus a pre-rendered `contentHtml` field; convert that to markdown for the repo.
- Media: Payload media is on R2 (`https://media.otherdev.com`, bucket `otherdev-media`, keys like `images/projects/<slug>/<file>.webp`). `web/public/` is a separate 87 MB (142 webp, 5 woff2, mp4, pdfs, a 3.8 MB zip; largest: `about-team-new.png` 7.4 MB, `about-team-og.png` 6.1 MB, `finlit-courses.webp` 4.8 MB, `ek-qadam-aur-home-hero.webp` 3.7 MB). v2's HANDOFF records a bug where rendered pages dropped the `images/projects/<slug>/` prefix, so never trust image URLs scraped from rendered pages; take them from the media docs and HEAD-check each.
- `about` content, `playlistsAndImages` (about-page image list) and contact copy also need an inventory pass.

## Phases

### 1. Content layer
- [ ] Write `scripts/export-v2.ts` (bun): fetch `/api/projects`, `/api/blog`, `/api/media`, `/api/clients`, `/api/categories` from the live site; write JSON/markdown into `src/content/`. Scrape `/about`.
- [ ] Define `src/content.config.ts` (Zod 4 via `astro/zod`, `glob`/`file` loaders): projects, blog, clients, about, site settings.
- [ ] Media manifest: every URL HEAD-checked (status, content-type, bytes); fail the build on a broken one.
- [ ] Decide repo vs R2 for the 87 MB `public/` (recommend R2 for videos, pdfs, zip and images over ~500 KB; small assets in repo). Upload with wrangler/rclone to a bucket on a media subdomain; set `image.remotePatterns` in `astro.config.mjs`.
- [ ] Remove nothing from v2; it stays as the reference.

### 2. Design foundation (from the reference site)
- [ ] Re-inspect the reference with agent-browser at desktop and mobile, recording type scale, spacing, colours, section structure, scroll scenes (details in the research note).
- [ ] Use REA (`D:\work\rea`, MCP `rea`) on the minified bundle to recover the exact GSAP/ScrollTrigger/Lenis settings (pin lengths, scrub, ease). The site ships no source maps.
- [ ] Copy the `clone-website` skill from `github.com/JCodesMore/ai-website-cloner-template` (`.agents/skills/clone-website`, plus `references/`) into `astro/.agents/skills`, and adapt it: take layout, type and motion from the reference, take all text and media from v2 (the stock skill says to use the target's real text and assets).
- [ ] Fonts and SVGs from the reference are reusable (same owner) but check the Saans/Serrif licences cover the otherdev domain. Load with `fontProviders.local()`; self-host.
- [ ] Decide styling: Tailwind 4 (+ shadcn-svelte for the chat later) vs plain CSS with custom properties. Neither is installed yet.

### 3. Pages and SEO
- [ ] Routes: `/`, `/work`, `/work/[slug]`, `/about`, `/blog`, `/blog/[slug]`, `/contact`, 404. Search can wait.
- [ ] `@astrojs/sitemap`, `robots.txt`, canonical and OG tags from `SITE_URL`, per-page OG images, JSON-LD (Organization, Article, CreativeWork).
- [ ] Performance budget: measure Lighthouse/CWV on built output; hero media and fonts are the likely cost, not the framework. Preload fonts, size and lazy-load media, avoid layout shift.

### 4. Motion layer
- [ ] `src/scripts/motion.ts`: one Lenis + GSAP init, ClientRouter lifecycle, `gsap.matchMedia()` for breakpoints and reduced motion, reveal and pinned-scene primitives.
- [ ] Test the ClientRouter teardown assumption in a browser: navigate away and back, scroll speed and pins must be unchanged.

### 5. Contact and lead capture (undecided)
- v2 used nodemailer and Google Sheets from server routes; a static site has none. Options: a small Worker route with Turnstile and Cloudflare email, a third-party form endpoint, or a mailto fallback. Decide before building the contact page.

### 6. Chat (last)
- [ ] Survey open-source Astro/Svelte AI chat projects and ctx7 before writing (global rule).
- [ ] Add `@astrojs/cloudflare` v13+, one `prerender = false` endpoint (`src/pages/api/chat.ts`), `ai`, `@ai-sdk/svelte`, a Svelte island on `client:visible`/`client:only="svelte"`, `transition:persist` under ClientRouter.
- [ ] Verify `Chat` mounts in an Astro island and streams on Workers. Pick the model provider (direct provider, Workers AI via `workers-ai-provider`, or AI Gateway).
- [ ] Decide whether v2's RAG (Qdrant, Cohere embed/rerank, Tavily, Upstash rate limit) is kept or replaced; add Cloudflare-side rate limiting.
- [ ] Add shadcn-svelte components for the chat UI (skill already in the repo).

### 7. Deploy
- [ ] Set real domain routes in `wrangler.jsonc` (keep `workers_dev: false`, `preview_urls: false` so there is no duplicate copy), `SITE_URL` for production and previews, R2 custom domain, CI build.

### 8. QA before calling anything done
- [ ] `bun run typecheck`, `bun run build`, `bunx @sveltejs/mcp svelte-autofixer` on every `.svelte` file.
- [ ] Source vs local comparison at matched viewport, scroll position and state; reduced motion; keyboard; mobile widths; no horizontal overflow; no console errors; every media URL resolves.

## Open decisions

1. Styling: Tailwind 4 or plain CSS.
2. Media split between repo and R2 (recommended above).
3. Contact backend.
4. Production domain and Worker routes.
5. Chat model provider and RAG fate.
6. Font licences for the otherdev domain.
7. The 1 svelte-check warning (inspect first).

## Tools

- **agent-browser** for inspection and screenshots (use a named session). **REA** for bundle and motion extraction. **ctx7** and the `astro-docs` MCP before any Astro API. **clone-website** skill for the process, once copied.
- Global `CLAUDE.md` is hard-linked across `.claude`, `.claude-account2/3/4`; an editor that replaces the file breaks the link.
