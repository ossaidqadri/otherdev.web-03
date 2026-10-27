# otherdev-web

Astro 7 + Svelte 5, fully static (no server, no adapter), deployed to Cloudflare as an assets-only Worker. Content is files in the repo, media is on R2. No CMS, no database.

## Working here

- Bun only. `bun run typecheck` (`astro check` plus `svelte-check`). Don't run it while a dev server is up: it re-optimises the shared `.vite` cache under the server and breaks islands.
- `src/lib/cn-tables.ts` is generated (gitignored) by the `cn` Vite plugin on every dev start and build. On a fresh clone start dev or build once before `typecheck`, or the import in `src/lib/utils.ts` has nothing to resolve.
- TypeScript stays on 6: `@astrojs/check` and `@astrojs/svelte` peer-depend on `^5 || ^6`, TS 7 is unsupported.
- Run `bunx @sveltejs/mcp@latest svelte-autofixer <file> --svelte-version 5` on every `.svelte` file. Runes only.
- For any Astro API, config, routing or adapter question, query the `astro-docs` MCP (`.mcp.json`) and ctx7 `/withastro/docs` before writing code. Versions here are newer than training data.
- Bun's global store stays on, so `vite.server.fs.allow` takes the store path from `svelte`'s real path (`astro.config.mjs`). Anything the app imports directly must be in `package.json`.
- Imports use the `@/` alias for `src/` (`tsconfig` paths, resolved by Vite), never `../`. `import.meta.glob` keys then start `/src/`.
- Fonts: use `fontProviders.local()`. In Astro 7.4 `npm()` hands `file://` URLs to `fetch()` and stops the dev server.

## Content and media

- Content lives in `src/content/` as markdown/JSON behind Zod schemas (`astro/zod`, Zod 4) in `src/content.config.ts`. Every collection needs a `glob` or `file` loader. Nothing hardcoded in components.
- Media is served from R2 (`image.remotePatterns` for optimisation). Large files stay out of git. R2 layout: `site/projects/<slug>/<file>` (slug = content id), `site/team`, `site/video`, `site/misc`.

## Motion

- GSAP + ScrollTrigger + Lenis. Lenis runs with `autoRaf: false`, driven by `gsap.ticker`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.lagSmoothing(0)`.
- No `<ClientRouter />`: every navigation is a full page load (native `@view-transition` crossfade, `prefetchAll` on). Init scripts at module top level and don't tear down: `astro:page-load` / `astro:before-swap` never fire, and `pagehide`/`unload` teardown would break bfcache. Use `gsap.matchMedia()` for breakpoints and `prefers-reduced-motion`.
- Animate transform and opacity only. Load the `gsap-*` and `lenis` skills before touching scroll scenes; `motion` for general animation practice.

## Deploy

`bun run deploy` (`astro build && wrangler deploy`). `wrangler.jsonc` has no `main`: `dist/` is the whole site. Add `@astrojs/cloudflare` v13+ only when a `prerender = false` route (the chat) arrives.
