import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";

// Process cards: Embla with its defaults (snap to the nearest card, trimmed ends, no loop, 1:1 drag),
// which is what the reference's carousel does when dragged and released. On hover-capable pointers a
// "Drag" pill trails the cursor 15px down and right while it is over the carousel.
const OFFSET = 15;
let embla: EmblaCarouselType | undefined;
let controller: AbortController | undefined;

document.addEventListener("astro:page-load", () => {
  const viewport = document.querySelector<HTMLElement>("[data-process-viewport]");
  if (!viewport) return;
  embla = EmblaCarousel(viewport);

  const cursor = document.querySelector<HTMLElement>("[data-drag-cursor]");
  if (!cursor || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.body.append(cursor);
  controller = new AbortController();
  const { signal } = controller;
  const move = (e: PointerEvent) => {
    cursor.style.transform = `translate3d(${e.clientX + OFFSET}px, ${e.clientY + OFFSET}px, 0)`;
  };
  viewport.addEventListener("pointerenter", (e) => { move(e); cursor.style.opacity = "1"; }, { signal });
  viewport.addEventListener("pointermove", move, { signal });
  viewport.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; }, { signal });
});
document.addEventListener("astro:before-swap", () => {
  embla?.destroy();
  embla = undefined;
  controller?.abort();
  document.querySelector("body > [data-drag-cursor]")?.remove();
});
