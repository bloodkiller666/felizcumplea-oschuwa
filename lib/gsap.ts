import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

// Desde GSAP 3.13 todos los plugins (SplitText, MorphSVG, Physics2D, etc.) son gratis
// y vienen en el paquete público "gsap".
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP, ScrollTrigger, ScrollToPlugin, SplitText, Draggable, InertiaPlugin, DrawSVGPlugin, TextPlugin,
    ScrambleTextPlugin, MorphSVGPlugin, MotionPathPlugin, Flip, CustomEase, Physics2DPlugin
  );
  // Latido: dos golpes rápidos y un respiro. Se usa en el corazón del regalo y en el pulso del dolor.
  CustomEase.create("heartbeat", "M0,0 C0.1,0 0.12,1 0.2,1 0.28,1 0.3,0.35 0.4,0.35 0.5,0.35 0.54,0.85 0.62,0.85 0.7,0.85 0.8,0 1,0");
  // Resurrección: se hunde un poco y despega con fuerza.
  CustomEase.create("rise", "M0,0 C0.14,-0.18 0.2,-0.08 0.32,0.1 0.5,0.4 0.55,1 1,1");
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP, ScrollTrigger, SplitText, Draggable, Flip, MorphSVGPlugin, MotionPathPlugin };
