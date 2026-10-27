import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { initApproach } from "@/scripts/approach";
import { gsap, ScrollTrigger } from "@/scripts/gsap";

// Smooth scroll plus the scroll-driven bits of the pages: nav theme, pill scroll-spy, scene progress,
// hero text reveal, the approach scene and the scrubbed scene videos. One Lenis for the tab's life, driven by
// gsap.ticker (the single clock) and feeding ScrollTrigger. Everything else is built in a gsap.matchMedia
// context for the page. Loaded by motion.ts once the page is idle.

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

let lenis: Lenis | undefined;
let page: gsap.MatchMedia | undefined;

// Scrubbed scene video, as the reference builds it (read from its bundle). A video marked data-scrub-rise
// (footer) rises from 45% below while its scene enters; once the scene is pinned (top at top), scroll plays
// it until the bottom reaches the bottom, or over the fraction of that given by data-scrub-end (approach).
// Tweens are made once the video knows its duration. The context records them, so they are reverted together.
function scrubVideo(ctx: gsap.Context, video: HTMLVideoElement, scene: HTMLElement): () => void {
  const share = Number(video.dataset.scrubEnd ?? 1);
  const ac = new AbortController();
  const { signal } = ac;
  // Parked where the slide-in starts from the moment the page is ready, not only once the video has loaded.
  if (video.hasAttribute("data-scrub-rise")) gsap.set(video, { yPercent: 45 });

  const build = () => {
    if (video.hasAttribute("data-scrub-rise")) {
      gsap.fromTo(
        video,
        { yPercent: 45 },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: scene, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } },
      );
    }
    // GSAP eases a proxy time; the video seeks to it only between seeks. Writing currentTime every tick
    // cancels the seek in flight, so frames only paint now and then and the flower steps instead of moving.
    const time = { t: video.currentTime };
    const seek = () => {
      if (!video.seeking && Math.abs(video.currentTime - time.t) > 0.001) video.currentTime = time.t;
    };
    video.addEventListener("seeked", seek, { signal });
    gsap.to(time, {
      t: video.duration,
      ease: "none",
      onUpdate: seek,
      scrollTrigger: {
        trigger: scene,
        start: "top top",
        end: () => `+=${(scene.offsetHeight - innerHeight) * share}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
  };
  const ready = () => {
    if (!(video.duration > 0)) return;
    ctx.add(build);
    // iOS only decodes frames for a video that has been played once; if autoplay is refused, the first touch does it.
    video
      .play()
      .then(() => !signal.aborted && video.pause())
      .catch(() => addEventListener("touchstart", () => video.play().then(() => video.pause(), () => {}), { once: true, passive: true, signal }));
  };
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) ready();
  else video.addEventListener("loadedmetadata", ready, { once: true, signal });

  // preload="none" in the markup; start the download a viewport before the scene.
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
  return () => {
    ac.abort();
    io.disconnect();
  };
}

function initPage() {
  page = gsap.matchMedia();
  page.add("(prefers-reduced-motion: no-preference)", (ctx) => {
    const cleanups: (() => void)[] = [];
    const root = document.documentElement;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-navbar-theme]")];
    const spy = [...document.querySelectorAll<HTMLAnchorElement>("[data-pill] a")];
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    const hero = document.querySelector<HTMLElement>("[data-scene=hero]");
    const words = [...document.querySelectorAll<HTMLElement>("[data-reveal-words] [data-word]")];
    // Tall scenes' pinned range (top top to bottom bottom), kept so the nav can read a scene's progress without measuring.
    const ranges = new Map<HTMLElement, ScrollTrigger>();

    const themeAt = (y: number) =>
      sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      })?.dataset.navbarTheme;

    // Scenes whose sky changes tone flip the header colour part-way: data-flip="<from>:<to>:<at>", while the scene covers the header.
    const flipTheme = (y: number): string | undefined => {
      for (const scene of scenes) {
        const [from, to, at] = scene.dataset.flip?.split(":") ?? [];
        const range = ranges.get(scene);
        if (!from || !to || !range) continue;
        const top = range.start;
        const bottom = range.end + innerHeight;
        if (y >= top - 40 && y < bottom - 40) return clamp((y - top) / (range.end - range.start)) > Number(at) ? to : from;
      }
      return undefined;
    };

    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (y <= 40 || y < lastY - 1) delete root.dataset.navHidden;
      else if (y > lastY + 1) root.dataset.navHidden = "";
      lastY = y;
      // Header follows the section under it; the pill follows the one under the bottom edge.
      root.dataset.navTheme = flipTheme(y) ?? themeAt(40) ?? "light";
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
    };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: onScroll, onRefresh: onScroll });

    for (const scene of scenes) {
      // Word entrances (Words.astro) play once, when the scene's top reaches mid-screen.
      const enter = () => scene.setAttribute("data-in", "");
      ScrollTrigger.create({ trigger: scene, start: "top 50%", onEnter: enter, onRefresh: (self) => self.scroll() >= self.start && enter() });
      if (scene.offsetHeight <= innerHeight) continue;
      const apply = (self: ScrollTrigger) => {
        const p = self.progress;
        scene.style.setProperty("--p", p.toFixed(4));
        if (scene.dataset.onAt) scene.toggleAttribute("data-on", p > Number(scene.dataset.onAt));
        if (scene === hero) {
          // The reference mounts the pill only once ~25% of the hero is scrolled (measured: between 300 and 330px).
          root.toggleAttribute("data-pill-hidden", p < 0.25);
          const n = Math.round(clamp((p - 0.3) / 0.5) * words.length);
          for (const [i, w] of words.entries()) w.toggleAttribute("data-on", i < n);
        }
      };
      ranges.set(scene, ScrollTrigger.create({ trigger: scene, start: "top top", end: "bottom bottom", onUpdate: apply, onRefresh: apply }));
    }

    for (const video of document.querySelectorAll<HTMLVideoElement>("video[data-scrub]")) {
      const scene = video.closest<HTMLElement>("[data-scene], [data-scrub-scene]");
      if (scene) cleanups.push(scrubVideo(ctx, video, scene));
    }
    const approach = document.querySelector<HTMLElement>("[data-approach]");
    if (approach) initApproach(approach);
    // Fonts change line breaks and so the length of every pinned scene.
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    onScroll();
    return () => {
      for (const fn of cleanups) fn();
    };
  });
}

/** Called once, after the page has loaded. Every navigation is a full page load, so nothing is torn down. */
export function start() {
  if (lenis) return;
  // lerp 0.2 is the reference's own setting (read from its bundle); Lenis' default 0.1 trails a wheel flick by about twice as long.
  lenis = new Lenis({ autoRaf: false, lerp: 0.2, syncTouch: false, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  initPage();
}
