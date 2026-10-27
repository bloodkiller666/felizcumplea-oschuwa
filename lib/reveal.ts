import { gsap, SplitText, prefersReducedMotion } from "./gsap";

/**
 * Entrada común de cada sección: el título sube palabra por palabra desde una máscara,
 * la barra de color se dibuja, el texto de apoyo se aclara y la palabra fantasma del fondo
 * hace paralaje con el scroll. Llamar dentro de useGSAP (se limpia solo).
 */
export function revealSection(root: HTMLElement | null) {
  if (!root || prefersReducedMotion()) return;

  const title = root.querySelector<HTMLElement>(".section-title");
  if (title) {
    const split = SplitText.create(title, { type: "words", mask: "words", wordsClass: "tword" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: title, start: "top 86%", once: true } });
    tl.from(split.words, { yPercent: 118, rotate: 5, duration: 1, ease: "power4.out", stagger: 0.09 })
      .fromTo(title, { "--bar": 0 }, { "--bar": 1, duration: 0.9, ease: "power3.inOut" }, 0.35);
  }

  const lede = root.querySelector<HTMLElement>(".lede");
  if (lede) {
    gsap.from(lede, { autoAlpha: 0, y: 26, duration: 1, ease: "power3.out", scrollTrigger: { trigger: lede, start: "top 90%", once: true } });
  }

  if (root.dataset.ghost) {
    gsap.fromTo(root, { "--gy": "14%" }, { "--gy": "-14%", ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
  }
}
