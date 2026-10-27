// Smooth scroll and the scroll-driven scenes live in scenes.ts, on GSAP (43 KB gzip). That chunk is fetched once the
// page has loaded and the browser is idle, so it never competes with the CSS and the first paint. Until then the
// page scrolls natively and the header starts in its top-of-page state (Layout.astro sets that inline).
// Reduced motion: nothing loads, CSS shows a complete static page.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const boot = () => void import("@/scripts/scenes").then((m) => m.start());
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(boot, { timeout: 2000 }) : setTimeout(boot, 200));
  if (document.readyState === "complete") idle();
  else addEventListener("load", idle, { once: true });
}
