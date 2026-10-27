// /approach scene, timed from the reference (progress p = scroll through the pinned section):
// the video layer fades in over the first 2% and cuts out at the end of its share (data-video-share,
// 5 / (5 + 2.5n)), which is split between the steps; each step is full until the last quarter of its slot, then fades out, and its
// words fade up (Words.astro, data-in) while it is current. The rest is split between partners:
// each partner's media fades in over 3.8% of p, the copy layer over 4.2%, and each name and line
// fades in over 2% at the start of its slot and out over 3.3% at the end.
const clamp = (n: number) => Math.min(1, Math.max(0, n));

document.addEventListener("astro:page-load", () => {
  const scene = document.querySelector<HTMLElement>("[data-approach]");
  if (!scene || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const H = Number(scene.dataset.videoShare);
  const video = scene.querySelector<HTMLElement>("[data-layer=video]")!;
  const steps = [...scene.querySelectorAll<HTMLElement>("[data-step]")];
  const partners = [...scene.querySelectorAll<HTMLElement>("[data-layer=partner]")];
  const copy = scene.querySelector<HTMLElement>("[data-layer=partner-copy]")!;
  const names = [...scene.querySelectorAll<HTMLElement>("[data-name]")];
  const lines = [...scene.querySelectorAll<HTMLElement>("[data-line]")];
  const probe = scene.querySelector<HTMLElement>("[data-indent-probe]");
  const stepSlot = H / steps.length;
  const partnerSlot = (1 - H) / partners.length;

  // Lines start under the first word after "We partnered with ".
  const indent = () => probe && copy.style.setProperty("--body-indent", `${probe.offsetWidth}px`);

  const update = () => {
    const r = scene.getBoundingClientRect();
    const p = -r.top / (r.height - innerHeight);
    video.style.opacity = String(p < H ? clamp(p / 0.02) : 0);
    steps.forEach((s, i) => {
      const end = (i + 1) * stepSlot;
      const on = p >= i * stepSlot && p < end;
      s.style.opacity = String(on ? clamp((end - p) / (0.25 * stepSlot)) : 0);
      s.toggleAttribute("data-in", on);
    });
    copy.style.opacity = String(p >= H && p < 1 ? clamp((p - H) / 0.042) : 0);
    partners.forEach((l, i) => {
      const start = H + i * partnerSlot;
      const on = p >= start && p < start + partnerSlot && p < 1;
      l.style.opacity = on ? "1" : "0";
      (l.firstElementChild as HTMLElement).style.opacity = String(on ? clamp((p - start) / 0.038) : 0);
      const o = on ? Math.min(clamp((p - start) / 0.02), clamp((start + partnerSlot - p) / 0.033)) : 0;
      for (const el of [names[i], lines[i]]) {
        if (!el) continue;
        el.style.opacity = String(o);
        el.toggleAttribute("data-in", on);
      }
    });
  };
  indent();
  update();
  const ac = new AbortController();
  addEventListener("scroll", update, { passive: true, signal: ac.signal });
  addEventListener("resize", () => { indent(); update(); }, { signal: ac.signal });
  document.addEventListener("astro:before-swap", () => ac.abort(), { once: true });
});
