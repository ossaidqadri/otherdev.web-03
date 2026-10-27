// The one place GSAP and ScrollTrigger are loaded and registered. Every scene script imports from here, so the
// bundler emits them once. lagSmoothing(0) keeps the clock honest after a slow frame: Lenis is driven by this
// ticker (motion.ts), and a skipped beat would make the scroll trail the scenes.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
