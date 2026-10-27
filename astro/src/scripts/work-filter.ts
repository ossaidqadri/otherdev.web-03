// /work controls: category filter pills and the grid/list toggle. Without this script the page
// stays a full list, which is the default state.
document.addEventListener("astro:page-load", () => {
  const list = document.querySelector<HTMLElement>("[data-work-list]");
  const controls = document.querySelector<HTMLElement>("[data-work-controls]");
  if (!list || !controls) return;

  const press = (group: NodeListOf<HTMLElement>, active: HTMLElement) => {
    for (const b of group) b.setAttribute("aria-pressed", String(b === active));
  };
  const filters = controls.querySelectorAll<HTMLElement>("[data-filter]");
  const views = controls.querySelectorAll<HTMLElement>("[data-set-view]");

  controls.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLElement>("button");
    if (!btn) return;
    if (btn.dataset.filter) {
      press(filters, btn);
      for (const item of list.querySelectorAll<HTMLElement>("[data-tags]")) {
        const tags = item.dataset.tags?.split(",") ?? [];
        item.hidden = btn.dataset.filter !== "all" && !tags.includes(btn.dataset.filter);
      }
    } else if (btn.dataset.setView) {
      press(views, btn);
      list.dataset.view = btn.dataset.setView;
    }
  });
});
