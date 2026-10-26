// @ts-check
import { realpathSync } from "node:fs";
import { dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

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
  // Self-hosted at build (hashed URLs, preload from the layout). `local()` on purpose: in
  // Astro 7.4 `npm()` hands file:// URLs to fetch() and stops the dev server.
  fonts: [
    {
      // Variable sans: wght axis 300-900 (read from the font's fvar table).
      name: "Saans",
      cssVariable: "--font-saans",
      provider: fontProviders.local(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      options: { variants: [{ weight: "300 900", style: "normal", src: ["./src/assets/fonts/saans-variable.woff2"] }] },
    },
    {
      // Static condensed serif, one weight: headings only.
      name: "Serrif",
      cssVariable: "--font-serrif",
      provider: fontProviders.local(),
      fallbacks: ["Georgia", "serif"],
      options: { variants: [{ weight: 400, style: "normal", src: ["./src/assets/fonts/serrif-condensed-regular.woff2"] }] },
    },
  ],
  integrations: [
    svelte(),
    // 404 is already left out by default; the filter keeps it that way if the page name changes.
    sitemap({ filter: (page) => !/\/404\/?$/.test(page) }),
  ],
  vite: {
    // Setting allow replaces Vite's default, so the project root goes back in.
    server: { fs: { allow: [process.cwd(), packageStore] } },

    // Islands load dynamically, so the HTML-entry scan misses their dependencies and
    // Vite would pre-bundle them mid-session (504 "Outdated Optimize Dep").
    optimizeDeps: { entries: ["src/**/*.{astro,svelte}"] },

    plugins: [tailwindcss()],
  },
});