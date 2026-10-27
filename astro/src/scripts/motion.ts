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
    // As on the reference: a video marked data-scrub-rise (footer) rises from 45% below while the
    // scene enters; once the scene is pinned (top at top), scroll plays it until the bottom reaches
    // the bottom, or over the fraction of that given by data-scrub-end (approach).
    if (video.hasAttribute("data-scrub-rise")) {
      const enter = clamp((innerHeight - r.top) / innerHeight);
      video.style.transform = `translateY(${(45 * (1 - enter)).toFixed(2)}%)`;
    }
    const end = Number(video.dataset.scrubEnd ?? 1);
    target = clamp(-r.top / ((r.height - innerHeight) * end)) * (video.duration || 0);
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
  const words = [...document.querySelectorAll<HTMLElement>("[data-reveal-words] [data-word]")];

  const themeAt = (y: number) =>
    sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom > y;
    })?.dataset.navbarTheme;

  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (y <= 40 || y < lastY - 1) delete root.dataset.navHidden;
    else if (y > lastY + 1) root.dataset.navHidden = "";
    lastY = y;
    // Header follows the section under it; the pill follows the one under the bottom edge.
    root.dataset.navTheme = themeAt(40) ?? "light";
    root.dataset.pillTheme = themeAt(innerHeight - 40) ?? "dark";
    // Pages without the home hero show their pill after ~300px of scroll (measured on the reference's case pages).
    if (!hero) root.toggleAttribute("data-pill-hidden", y < 300);

    // The last section whose top has passed 42% down the screen stays current (reference switches
    // between 372 and 380px at 900 tall), so News stays lit over the scene after it.
    const mid = innerHeight * 0.42;
    const current = spy.findLast((a) => (document.getElementById(a.hash.slice(1))?.getBoundingClientRect().top ?? Infinity) <= mid);
    for (const a of spy) {
      if (a === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }

    for (const scene of scenes) {
      const r = scene.getBoundingClientRect();
      // Word entrances (Words.astro) play once, when the scene's top reaches mid-screen.
      if (r.top <= innerHeight / 2) scene.setAttribute("data-in", "");
      if (r.height <= innerHeight) continue;
      const p = clamp(-r.top / (r.height - innerHeight));
      scene.style.setProperty("--p", p.toFixed(4));
      if (scene.dataset.onAt) scene.toggleAttribute("data-on", p > Number(scene.dataset.onAt));
      // Scenes whose sky changes tone flip the header colour part-way: data-flip="<from>:<to>:<at>".
      const [from, to, at] = scene.dataset.flip?.split(":") ?? [];
      if (from && to && r.top <= 40 && r.bottom > 40) root.dataset.navTheme = p > Number(at) ? to : from;
      if (scene === hero) {
        // The reference mounts the pill only once ~25% of the hero is scrolled (measured: between 300 and 330px).
        root.toggleAttribute("data-pill-hidden", p < 0.25);
        const n = Math.round(clamp((p - 0.3) / 0.5) * words.length);
        for (const [i, w] of words.entries()) w.toggleAttribute("data-on", i < n);
      }
    }
  };
  lenis?.on("scroll", onScroll);
  addEventListener("resize", onScroll, { signal });
  onScroll();

  for (const video of document.querySelectorAll<HTMLVideoElement>("video[data-scrub]")) {
    const scene = video.closest<HTMLElement>("[data-scene], [data-scrub-scene]");
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
