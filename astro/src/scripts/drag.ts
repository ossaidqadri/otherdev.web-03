import type { EmblaCarouselType } from "embla-carousel";

// Process cards: Embla with its defaults (snap to the nearest card, trimmed ends, no loop, 1:1 drag),
// which is what the reference's carousel does when dragged and released. Embla measures every slide when
// it starts, which forces a layout, so it is fetched and started when the carousel is a viewport away
// rather than during page load.
let embla: EmblaCarouselType | undefined;
let io: IntersectionObserver | undefined;

document.addEventListener("astro:page-load", () => {
  const viewport = document.querySelector<HTMLElement>("[data-process-viewport]");
  if (!viewport) return;
  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io?.disconnect();
      void import("embla-carousel").then(({ default: EmblaCarousel }) => {
        // The page may have been swapped while the chunk loaded.
        if (viewport.isConnected) embla = EmblaCarousel(viewport);
      });
    },
    { rootMargin: "100% 0px" },
  );
  io.observe(viewport);
});
document.addEventListener("astro:before-swap", () => {
  io?.disconnect();
  embla?.destroy();
  embla = undefined;
});
