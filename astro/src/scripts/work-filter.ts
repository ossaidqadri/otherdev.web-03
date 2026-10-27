// /work controls: category filters and the grid/list toggle. In each group a wash sits behind the
// pressed button and slides to the next one (WorkIndex.astro sets its transition and insets).
// Without this script the page stays a full grid.
document.addEventListener("astro:page-load", () => {
  const list = document.querySelector<HTMLElement>("[data-work-list]");
  const controls = document.querySelector<HTMLElement>("[data-work-controls]");
  if (!list || !controls) return;

  const place = (group: HTMLElement) => {
    const wash = group.querySelector<HTMLElement>("[data-wash]");
    const on = group.querySelector<HTMLElement>("[aria-pressed=true]");
    if (!wash || !on) return;
    const [x = 0, top = 0, , bottom = 0] = (wash.dataset.inset ?? "").split(" ").map(Number);
    wash.style.left = `${on.offsetLeft - x}px`;
    wash.style.top = `${on.offsetTop - top}px`;
    wash.style.width = `${on.offsetWidth + 2 * x}px`;
    wash.style.height = `${on.offsetHeight + top + bottom}px`;
  };
  const groups = [...controls.querySelectorAll<HTMLElement>("[role=group]")];
  for (const g of groups) place(g);
  const ro = new ResizeObserver(() => groups.forEach(place));
  ro.observe(controls);
  document.addEventListener("astro:before-swap", () => ro.disconnect(), { once: true });

  controls.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>("button");
    const group = btn?.closest<HTMLElement>("[role=group]");
    if (!btn || !group) return;
    for (const b of group.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b === btn));
    place(group);
    if (btn.dataset.filter) {
      for (const item of list.querySelectorAll<HTMLElement>("[data-tags]")) {
        const tags = item.dataset.tags?.split(",") ?? [];
        item.hidden = btn.dataset.filter !== "all" && !tags.includes(btn.dataset.filter);
      }
    } else if (btn.dataset.setView) {
      list.dataset.view = btn.dataset.setView;
    }
  });
});
