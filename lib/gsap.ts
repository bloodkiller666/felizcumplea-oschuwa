import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

// Desde GSAP 3.13 todos los plugins son gratis y vienen en el paquete público "gsap".
// Solo se registran los que la experiencia usa de verdad: el resto no entra al bundle.
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP, ScrollTrigger, SplitText, Draggable, InertiaPlugin, DrawSVGPlugin, TextPlugin,
    ScrambleTextPlugin, CustomEase, Physics2DPlugin
  );
  // Latido: dos golpes rápidos y un respiro. Lo usa el botón cuando se desbloquea.
  CustomEase.create("heartbeat", "M0,0 C0.1,0 0.12,1 0.2,1 0.28,1 0.3,0.35 0.4,0.35 0.5,0.35 0.54,0.85 0.62,0.85 0.7,0.85 0.8,0 1,0");
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP, ScrollTrigger, SplitText, Draggable };
