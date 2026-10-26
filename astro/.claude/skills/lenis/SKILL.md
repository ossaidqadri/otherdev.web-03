---
name: lenis
description: Lenis smooth scroll (`lenis` package) with GSAP ScrollTrigger in an Astro 7 site. Use when adding, wiring, debugging or tearing down smooth scroll, anchor links, nested scroll areas, or scroll-linked motion that drifts or jitters.
---

# Lenis

Package `lenis` (`import Lenis from 'lenis'`), plus its stylesheet (`lenis/dist/lenis.css`). Verify options against ctx7 `/darkroomengineering/lenis` before relying on anything not listed here.

## With GSAP ScrollTrigger (the only setup this site uses)

```js
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const lenis = new Lenis({ autoRaf: false })
lenis.on('scroll', ScrollTrigger.update)
const tick = (time) => lenis.raf(time * 1000)
gsap.ticker.add(tick)
gsap.ticker.lagSmoothing(0)
```

- `autoRaf: false`: GSAP's ticker is the single clock. Two loops cause drift and jitter.
- `lagSmoothing(0)`: otherwise GSAP skips time after a slow frame and the scroll lags the scenes.
- Teardown: `gsap.ticker.remove(tick)` then `lenis.destroy()`. A leaked ticker callback doubles speed after each navigation.

## Rules

- One instance per page. Create it once, expose it, don't create it per component.
- Programmatic scroll goes through `lenis.scrollTo(target, { offset, duration, immediate, lock, force, onComplete })`. Target is a number, selector, keyword or element. Never `window.scrollTo` while Lenis runs.
- `lenis.stop()` / `lenis.start()` for modals and menus; scrollTo with `force: true` still moves while stopped.
- Nested scroll areas (chat panel, menu, modal): `data-lenis-prevent` (or `-wheel`, `-touch`, `-vertical`, `-horizontal`).
- Reduced motion is honoured by default (smoothing off, jumps are instant). Don't set `respectReducedMotion: false`. Read `lenis.prefersReducedMotion` to adapt your own animations.
- Pinned ScrollTrigger scenes: call `ScrollTrigger.refresh()` after fonts, images or video change layout.

## Astro `<ClientRouter />`

Scripts run once, but the DOM is swapped on navigation. Init on `astro:page-load`; tear down the ScrollTrigger instances and any scene tweens before the swap (`astro:before-swap`). Keep the Lenis instance and ticker alive across navigations and scroll to top (`lenis.scrollTo(0, { immediate: true })`) after the swap, rather than rebuilding them. This lifecycle is inferred from the Astro events docs; confirm it in the browser before depending on it.

## Check

After wiring, scroll a pinned section with the wheel, with touch emulation, and with the keyboard, then navigate to another page and back: the scene must restart cleanly and scroll speed must not change.
