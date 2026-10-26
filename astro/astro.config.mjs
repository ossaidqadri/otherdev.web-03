// @ts-check
import { realpathSync } from "node:fs";
import { dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// Bun's global store keeps packages outside the project and Vite's dev server
// refuses to serve files from there. Derived from Svelte's real path, not written
// down, so it follows whatever cache dir each machine uses.
const svelteFile = realpathSync(fileURLToPath(import.meta.resolve("svelte/package.json")));
const packageStore = dirname(svelteFile.slice(0, svelteFile.lastIndexOf(`${sep}node_modules${sep}`)));

// Canonical origin: drives canonical URLs, OG URLs and the sitemap. Preview builds
// set SITE_URL so they do not claim the production address.
const SITE = process.env.SITE_URL ?? "https://otherdev.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Fully static: no server, so no adapter. Add @astrojs/cloudflare (v13+) only when
  // the chat endpoint arrives, with `export const prerender = false` on that route.
  output: "static",
  integrations: [svelte()],
  vite: {
    // Setting allow replaces Vite's default, so the project root goes back in.
    server: { fs: { allow: [process.cwd(), packageStore] } },

    // Islands load dynamically, so the HTML-entry scan misses their dependencies and
    // Vite would pre-bundle them mid-session (504 "Outdated Optimize Dep").
    optimizeDeps: { entries: ["src/**/*.{astro,svelte}"] },

    plugins: [tailwindcss()],
  },
});