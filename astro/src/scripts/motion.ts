// Smooth scroll and the scroll-driven scenes live in scenes.ts, on GSAP (43 KB gzip). That chunk is fetched once the
// page has loaded and the browser is idle, so it never competes with the CSS and the first paint. Until then the
// page scrolls natively and the header starts in its top-of-page state (Layout.astro sets that inline).
// Reduced motion: no scenes load, CSS shows a complete static page.

// A video's poster (the footer flower, 39 KB) is only fetched once the video is within a viewport of the screen.
// Runs on every page, reduced motion included, so the static footer still gets its poster.
const videos = document.querySelectorAll<HTMLVideoElement>("video[data-poster]");
if (videos.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const v = e.target as HTMLVideoElement;
        v.poster = v.dataset.poster ?? "";
        io.unobserve(v);
      }
    },
    { rootMargin: "100% 0px" },
  );
  for (const v of videos) io.observe(v);
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const boot = () => void import("@/scripts/scenes").then((m) => m.start());
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(boot, { timeout: 2000 }) : setTimeout(boot, 200));
  if (document.readyState === "complete") idle();
  else addEventListener("load", idle, { once: true });
}
