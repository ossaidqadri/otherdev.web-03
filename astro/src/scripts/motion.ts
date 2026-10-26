import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth scroll plus the scroll-driven bits of the home page: nav theme, pill scroll-spy,
// hero text reveal and scrubbed scene video. One Lenis for the tab's life; everything
// else is built on astro:page-load and torn down on astro:before-swap.
// Reduced motion: nothing starts, CSS shows a complete static page.

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

let lenis: Lenis | undefined;
let teardown: (() => void)[] = [];

function scrubVideo(video: HTMLVideoElement, scene: HTMLElement, signal: AbortSignal) {
  // Scroll writes a target; one loop eases currentTime toward it. Seeks never queue up
  // (skipped while one is in flight) and the poster stays until a real frame has painted.
  let target = 0;
  let current = 0;
  let ready = false;
  const update = () => {
    const r = scene.getBoundingClientRect();
    // Whole visible life of the scene, slide-in and slide-out included.
    target = clamp((innerHeight - r.top) / (r.height + innerHeight)) * (video.duration || 0);
  };
  const frame = () => {
    if (ready && !video.seeking) {
      current += (target - current) * 0.18;
      if (Math.abs(target - video.currentTime) > 0.02) video.currentTime = current;
    }
    if (!signal.aborted) requestAnimationFrame(frame);
  };
  const start = () => {
    ready = true;
    // iOS only decodes frames for a video that has been played once.
    video.play().then(() => video.pause()).catch(() => {});
    update();
  };
  video.addEventListener("seeked", () => video.style.setProperty("opacity", "1"), { once: true, signal });
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) start();
  else video.addEventListener("loadedmetadata", start, { once: true, signal });
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e?.isIntersecting) return;
      video.preload = "auto";
      video.load();
      io.disconnect();
    },
    { rootMargin: "100% 0px" },
  );
  io.observe(scene);
  signal.addEventListener("abort", () => io.disconnect());
  const off = lenis?.on("scroll", update);
  signal.addEventListener("abort", () => off?.());
  requestAnimationFrame(frame);
}

function initPage() {
  if (reduced.matches) return;
  const ac = new AbortController();
  const { signal } = ac;
  teardown.push(() => ac.abort());

  const root = document.documentElement;
  const sections = [...document.querySelectorAll<HTMLElement>("[data-navbar-theme]")];
  const spy = [...document.querySelectorAll<HTMLAnchorElement>("[data-pill] a")];
  const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
  const hero = document.querySelector<HTMLElement>("[data-scene=hero]");
  const words = [...document.querySelectorAll<HTMLElement>("[data-word]")];

  const themeAt = (y: number) =>
    sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom > y;
    })?.dataset.navbarTheme;

  const onScroll = () => {
    // Header follows the section under it; the pill follows the one under the bottom edge.
    root.dataset.navTheme = themeAt(40) ?? "light";
    root.dataset.pillTheme = themeAt(innerHeight - 40) ?? "dark";

    const mid = innerHeight / 2;
    for (const a of spy) {
      const r = document.getElementById(a.hash.slice(1))?.getBoundingClientRect();
      const on = !!r && r.top <= mid && r.bottom > mid;
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }

    for (const scene of scenes) {
      const r = scene.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      scene.style.setProperty("--p", p.toFixed(4));
      // Scenes whose sky changes tone flip the header colour part-way: data-flip="<from>:<to>:<at>".
      const [from, to, at] = scene.dataset.flip?.split(":") ?? [];
      if (from && to && r.top <= 40 && r.bottom > 40) root.dataset.navTheme = p > Number(at) ? to : from;
      if (scene === hero) {
        const n = Math.round(clamp((p - 0.3) / 0.5) * words.length);
        for (const [i, w] of words.entries()) w.toggleAttribute("data-on", i < n);
      }
    }
  };
  lenis?.on("scroll", onScroll);
  addEventListener("resize", onScroll, { signal });
  onScroll();

  for (const video of document.querySelectorAll<HTMLVideoElement>("video[data-scrub]")) {
    const scene = video.closest<HTMLElement>("[data-scene]");
    if (scene) scrubVideo(video, scene, signal);
  }
  teardown.push(() => lenis?.off("scroll", onScroll));
}

function destroyPage() {
  for (const fn of teardown.splice(0)) fn();
}

if (!reduced.matches) {
  lenis = new Lenis({ autoRaf: true, syncTouch: false, anchors: true });
  document.addEventListener("astro:before-swap", () => {
    lenis?.stop();
    destroyPage();
  });
  document.addEventListener("astro:page-load", () => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    lenis?.start();
    initPage();
  });
}
