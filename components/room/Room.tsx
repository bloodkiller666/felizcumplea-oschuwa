"use client";

import { sfx, initAudio } from "@/lib/sfx";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { createCamera, type Camera, type Pose } from "@/lib/camera";
import { STATIONS, NEXT, ending, type StationId } from "@/lib/room";
import PcStation, { type PcState } from "./PcStation";
import Gba from "./Gba";
import Tama from "./Tama";
import Switch from "./Switch";
import Scene from "./Scene";
import SoundToggle from "./SoundToggle";

type At = StationId | "overview";

const DEV = process.env.NODE_ENV !== "production";

/** Escala que hace que el recuadro enfocado llene `fit` de la pantalla. */
function fitScale(el: Element | null, fit: number, k: number) {
  if (!el) return 1;
  const w = ((el as HTMLElement).offsetWidth || 1) * k;
  const h = ((el as HTMLElement).offsetHeight || 1) * k;
  return Math.min((window.innerWidth * fit) / w, (window.innerHeight * fit) / h);
}

export default function Room() {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cam = useRef<Camera | null>(null);
  const [started, setStarted] = useState(false);
  const [at, setAt] = useState<At>("overview");
  const [flying, setFlying] = useState(false);
  const [pcInitial, setPcInitial] = useState<PcState>("off");
  const [chapter, setChapter] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);
  const [dawn, setDawn] = useState(false);
  const atRef = useRef<At>("overview");

  const poseOf = useCallback((id: At): Pose => {
    if (id === "overview") {
      // Vista general: todo el cuarto (cama, estante y escritorio) ocupa la pantalla.
      const s = Math.max(0.5, Math.min(1.3, window.innerWidth / 1300));
      return { x: -100, y: 330, z: 1000, ry: 0, rx: 1, s };
    }
    const st = STATIONS[id];
    const host = world.current?.querySelector(`[data-station="${id}"]`);
    const el = host?.querySelector("[data-focus]") ?? null;
    let dx = 0;
    let dy = 0;
    // Ajustes de colocación por CSS (propiedad `translate`) también mueven la cámara.
    const shift = host ? getComputedStyle(host).translate : "none";
    if (shift && shift !== "none") {
      const [tx, ty] = shift.split(" ");
      dx += parseFloat(tx) || 0;
      dy += parseFloat(ty) || 0;
    }
    return { x: st.x + dx, y: st.y + dy, z: st.z, ry: st.ry, rx: st.rx, s: fitScale(el, st.fit, st.k) };
  }, []);

  const goTo = useCallback(
    async (id: At, o?: { duration?: number }) => {
      if (!cam.current) return;
      const d = o?.duration ?? 2.6;
      setFlying(true);
      sfx.whoosh();
      atRef.current = id;
      // Los demás aparatos se desvanecen a mitad del vuelo para no tapar el que se enfoca (y vuelven al salir).
      stage.current?.removeAttribute("data-focus");
      if (id !== "overview") gsap.delayedCall(d * 0.55, () => stage.current?.setAttribute("data-focus", id));
      cam.current.setParallax(id === "overview" ? 2.2 : 0.5);
      await cam.current.flyTo(poseOf(id), { duration: d });
      setAt(id);
      setFlying(false);
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-station="${id}"] button:not([disabled])`)?.focus({ preventScroll: true }));
    },
    [poseOf]
  );

  // Cámara, y (solo en desarrollo) ?station=gba&pc=desktop&chapter=2 para saltar directo a un aparato.
  useEffect(() => {
    const w = world.current;
    const s = stage.current;
    if (!w || !s) return;
    document.documentElement.classList.add("room-lock");
    const params = new URLSearchParams(window.location.search);
    const dev = DEV ? (params.get("station") as StationId | null) : null;
    const devPc = DEV ? (params.get("pc") as PcState | null) : null;
    if (devPc) setPcInitial(devPc);
    if (DEV && params.get("chapter") === "2") setChapter(2);

    cam.current = createCamera(w, s, { x: 0, y: 60, z: 2500, ry: 0, rx: 7, s: poseOf("overview").s });
    cam.current.setParallax(2.2);

    if (dev && dev in STATIONS) {
      requestAnimationFrame(() => {
        cam.current?.jump(poseOf(dev));
        atRef.current = dev;
        cam.current?.setParallax(0.5);
        stage.current?.setAttribute("data-focus", dev);
        setAt(dev);
        setStarted(true);
      });
    }

    const onResize = () => {
      if (!document.documentElement.classList.contains("lights-off")) cam.current?.jump(poseOf(atRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.documentElement.classList.remove("room-lock", "lights-off");
      cam.current?.destroy();
    };
  }, [poseOf]);

  const enter = () => {
    initAudio();
    sfx.click();
    setStarted(true);
    gsap.to(".room-intro", { autoAlpha: 0, duration: 0.8, ease: "power2.out" });
    void goTo("pc", { duration: 3.6 });
  };

  const leave = (from: StationId) => async () => {
    if (from === "switch") {
      // De vuelta en la PC la cámara se acerca sola hasta "entrar" en la pantalla: sin botones.
      setChapter(2);
      await goTo("pc", { duration: 3 });
      const p = poseOf("pc");
      await cam.current?.flyTo({ ...p, s: p.s * 1.22 }, { duration: 1.6, lift: 0, roll: 0, ease: "power2.inOut" });
      return;
    }
    void goTo(NEXT[from], { duration: 2.8 });
  };

  // Final: se apagan las luces, la cámara se aleja hacia la ventana y amanece.
  const endNight = useCallback(async () => {
    const root = document.documentElement;
    setFlying(true);
    root.classList.add("lights-off");
    setDawn(true);
    sfx.dawn();
    stage.current?.removeAttribute("data-focus");
    cam.current?.setParallax(1.2);
    const s = Math.min(1.5, (window.innerWidth * 0.8) / 380);
    const done = cam.current?.flyTo({ x: -1150, y: -330, z: -200, ry: 0, rx: 0, s }, { duration: 7, lift: 600, roll: 0.8, ease: "power2.inOut" });
    gsap.delayedCall(3.4, () => setEnded(true));
    await done;
  }, []);

  const inert = (id: StationId) => at !== id || flying;

  return (
    <div className={`stage${flying ? " is-flying" : ""}${dawn ? " is-dawn" : ""}`} ref={stage}>
      <div className="world" ref={world}>
        <Scene />

        {(["pc", "gba", "tama", "switch"] as StationId[]).map((id) => {
          const st = STATIONS[id];
          return (
            <div
              className={`st st-${id}`}
              key={id}
              data-station={id}
              inert={inert(id)}
              style={{ transform: `translate3d(${st.x}px, ${st.y}px, ${st.z}px) rotateY(${st.ry}deg) scale(${st.k}) translate(-50%, -50%)` }}
            >
              {id === "pc" && <PcStation key={pcInitial} initial={pcInitial} chapter={chapter} active={at === "pc" && !flying && chapter === 2} onExit={leave("pc")} onEnding={endNight} />}
              {id === "gba" && <Gba active={at === "gba" && !flying} onExit={leave("gba")} />}
              {id === "tama" && <Tama active={at === "tama" && !flying} onExit={leave("tama")} />}
              {id === "switch" && <Switch onExit={leave("switch")} />}
            </div>
          );
        })}
      </div>

      <div className="vignette" aria-hidden="true" />
      <SoundToggle />

      {!started && (
        <div className="room-intro">
          <p className="room-kicker">Una noche, una habitación y un montón de cariño</p>
          <h1>Feliz cumpleaños, ShuraHiwa</h1>
          <button type="button" className="btn btn-lg btn-go" onClick={enter} data-nofx>
            Entrar al cuarto
          </button>
        </div>
      )}

      {ended && (
        <div className="room-end" role="status">
          <h2>{ending.title}</h2>
          <p>{ending.text}</p>
          <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()} data-nofx>
            {ending.again}
          </button>
        </div>
      )}
    </div>
  );
}
