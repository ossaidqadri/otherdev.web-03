// Home client grid: every 2.6s one random cell swaps to the next waiting client, old tile
// fading out (0.4s) then the new one in (0.5s), as the reference does. Only runs when there are
// more clients than cells, pauses off screen and under reduced motion.
const INTERVAL = 2600;

document.addEventListener("astro:page-load", () => {
  const grid = document.querySelector<HTMLElement>("[data-clients]");
  const pool = [...document.querySelectorAll<HTMLTemplateElement>("template[data-client-pool]")].map((t) => t.content.firstElementChild as HTMLElement);
  if (!grid || !pool.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cells = [...grid.children] as HTMLElement[];
  let last = -1;
  let timer = 0;

  const swap = async () => {
    let i = Math.floor(Math.random() * cells.length);
    if (i === last) i = (i + 1) % cells.length;
    last = i;
    const cell = cells[i];
    const outgoing = cell.firstElementChild as HTMLElement;
    await outgoing.animate({ opacity: [1, 0] }, { duration: 400, easing: "ease-in-out", fill: "forwards" }).finished;
    const incoming = pool.shift() as HTMLElement;
    pool.push(outgoing);
    outgoing.getAnimations().forEach((a) => a.cancel());
    cell.replaceChildren(incoming);
    incoming.animate({ opacity: [0, 1] }, { duration: 500, easing: "ease-in-out" });
  };

  const io = new IntersectionObserver(([entry]) => {
    clearInterval(timer);
    if (entry.isIntersecting) timer = window.setInterval(swap, INTERVAL);
  });
  io.observe(grid);
  document.addEventListener("astro:before-swap", () => { io.disconnect(); clearInterval(timer); }, { once: true });
});
