import Lenis from "lenis";
import "lenis/dist/lenis.css";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
  const root = document.documentElement;
  const lenis = new Lenis({
    autoRaf: true,
    lerp: 0.085,
    smoothWheel: true,
    allowNestedScroll: true,
    anchors: { offset: -96 },
  });

  const sync = () => {
    const blocked = root.classList.contains("is-preloading") || document.querySelector("dialog[open]") !== null;
    if (blocked) lenis.stop();
    else lenis.start();
  };

  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  window.addEventListener("preloader:done", sync);
  sync();

  lenis.on("scroll", (instance: Lenis) => {
    window.dispatchEvent(new CustomEvent("smooth:scroll", { detail: { velocity: instance.velocity } }));
  });
}
