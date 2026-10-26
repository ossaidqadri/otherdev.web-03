import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";

// Process cards: Embla with its defaults (snap to the nearest card, trimmed ends, no loop, 1:1 drag),
// which is what the reference's carousel does when dragged and released.
let embla: EmblaCarouselType | undefined;

document.addEventListener("astro:page-load", () => {
  const viewport = document.querySelector<HTMLElement>("[data-process-viewport]");
  if (viewport) embla = EmblaCarousel(viewport);
});
document.addEventListener("astro:before-swap", () => {
  embla?.destroy();
  embla = undefined;
});
