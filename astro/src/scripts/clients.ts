// Home client grid: every 2.6s one random visible cell swaps to another client, old tile fading
// out (0.4s) then the new one in (0.5s), as the reference does. Incoming clients come from the
// <template> pool and from cells hidden at this breakpoint. Pauses off screen and under reduced motion.
const INTERVAL = 2600;

function initClients() {
  const grid = document.querySelector<HTMLElement>("[data-clients]");
  if (!grid || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const pool = [...document.querySelectorAll<HTMLTemplateElement>("template[data-client-pool]")].map((t) => t.content.firstElementChild as HTMLElement);
  const cells = [...grid.children] as HTMLElement[];
  let last: HTMLElement | undefined;
  let timer = 0;
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

  const swap = async () => {
    const visible = cells.filter((c) => c.offsetParent !== null);
    const hidden = cells.filter((c) => c.offsetParent === null);
    if (!hidden.length && !pool.length) return;
    const cell = pick(visible.length > 1 ? visible.filter((c) => c !== last) : visible);
    const outgoing = cell?.firstElementChild as HTMLElement | null;
    if (!cell || !outgoing) return;
    last = cell;
    await outgoing.animate({ opacity: [1, 0] }, { duration: 400, easing: "ease-in-out", fill: "forwards" }).finished;
    for (const a of outgoing.getAnimations()) a.cancel();
    let incoming: HTMLElement | undefined;
    // Draw from hidden cells and the pool in proportion to their size, so every client turns up.
    if (hidden.length && Math.random() < hidden.length / (hidden.length + pool.length)) {
      const from = pick(hidden);
      incoming = from?.firstElementChild as HTMLElement | undefined;
      from?.replaceChildren(outgoing);
    } else {
      incoming = pool.shift();
      pool.push(outgoing);
    }
    if (!incoming) return;
    cell.replaceChildren(incoming);
    incoming.animate({ opacity: [0, 1] }, { duration: 500, easing: "ease-in-out" });
  };

  const io = new IntersectionObserver(([entry]) => {
    clearInterval(timer);
    if (entry?.isIntersecting) timer = window.setInterval(swap, INTERVAL);
  });
  io.observe(grid);
}
initClients();
