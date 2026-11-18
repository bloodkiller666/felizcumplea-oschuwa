"use client";

import { sfx, initAudio } from "@/lib/sfx";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { burst } from "@/lib/fx";
import { setMusic, type Track } from "@/lib/music";
import { createCamera, type Camera, type Pose } from "@/lib/camera";
import { initPerf, subscribePerf, perfLevel } from "@/lib/perf";
import { STATIONS, NEXT, ending, DOOR_Z, doorIntro, doorOutro, secrets, secretsDone, type StationId, type SecretId } from "@/lib/room";
import PcStation, { type PcState } from "./PcStation";
import Gba from "./Gba";
import Tama from "./Tama";
import Switch from "./Switch";
import Scene from "./Scene";
import SoundToggle from "./SoundToggle";

type At = StationId | "overview" | "door";
type Notice = null | "intro" | "outro";

const DEV = process.env.NODE_ENV !== "production";

type Tod = "day" | "dusk" | "night";
/** Momento del día según la hora real del dispositivo. */
const todNow = (): Tod => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "day" : h >= 18 && h < 20 ? "dusk" : "night";
};
const KICKER: Record<Tod, string> = {
  day: "Un día, una habitación y un montón de cariño",
  dusk: "Una tarde, una habitación y un montón de cariño",
  night: "Una noche, una habitación y un montón de cariño",
};
const TRACK: Record<At, Track> = { pc: "pc", gba: "gba", tama: "tama", switch: "switch", overview: "room", door: "room" };
const SECRET_KEY = "shurahiwa-secrets";

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
  const [at, setAt] = useState<At>("door");
  const [flying, setFlying] = useState(false);
  const [pcInitial, setPcInitial] = useState<PcState>("off");
  const [chapter, setChapter] = useState<1 | 2>(1);
  const [ended, setEnded] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [zone, setZone] = useState<"hall" | "room" | "both">("hall");
  const [pan, setPan] = useState<-1 | 0 | 1>(0);
  const [tod, setTod] = useState<Tod>("night");
  const [found, setFound] = useState<SecretId[]>([]);
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);
  const lastStation = useRef<StationId>("pc");
  const toastTimer = useRef(0);
  const atRef = useRef<At>("door");
  const busy = useRef(false);
  const noticeDone = useRef<(() => void) | null>(null);

  const poseOf = useCallback((id: At): Pose => {
    if (id === "door") {
      // Frente a la puerta cerrada, en el pasillo.
      const s = Math.max(0.6, Math.min(1.5, window.innerHeight / 900));
      return { x: 0, y: 330, z: DOOR_Z + 300, ry: 0, rx: 0, s };
    }
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
    async (id: At, o?: { duration?: number; style?: "walk" | "turn" }) => {
      if (!cam.current) return;
      const d = o?.duration ?? 4;
      const style = o?.style ?? "walk";
      setFlying(true);
      sfx.whoosh();
      setMusic(TRACK[id], 3);
      if (id !== "overview" && id !== "door") lastStation.current = id;
      atRef.current = id;
      // Los demás aparatos se desvanecen a mitad del vuelo para no tapar el que se enfoca (y vuelven al salir).
      stage.current?.removeAttribute("data-focus");
      if (id !== "overview") gsap.delayedCall(d * (style === "turn" ? 0.66 : 0.55), () => stage.current?.setAttribute("data-focus", id));
      cam.current.setParallax(id === "overview" ? 2.2 : 0.5);
      await cam.current.flyTo(poseOf(id), {
        duration: d,
        style,
        hub: style === "turn" ? poseOf("overview") : undefined,
        onTurn: (on) => stage.current?.classList.toggle("is-turning", on),
      });
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

    cam.current = createCamera(w, s, poseOf("door"));
    cam.current.setParallax(1.2);
    const stopPerf = initPerf();
    cam.current.setLite(perfLevel() >= 1);
    const unsubPerf = subscribePerf((l) => cam.current?.setLite(l >= 1));

    if (dev && dev in STATIONS) {
      setZone("room");
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
      if (!busy.current) cam.current?.jump(poseOf(atRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      stopPerf();
      unsubPerf();
      document.documentElement.classList.remove("room-lock");
      cam.current?.destroy();
    };
  }, [poseOf]);

  // Hora real: el cuarto cambia de luz (día, tarde, noche) y se revisa cada minuto.
  useEffect(() => {
    const q = DEV ? new URLSearchParams(window.location.search).get("tod") : null;
    const upd = () => setTod(q === "day" || q === "dusk" || q === "night" ? q : todNow());
    upd();
    const id = window.setInterval(upd, 60000);
    return () => window.clearInterval(id);
  }, []);

  // Secretos ya encontrados (se recuerdan en el navegador).
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(SECRET_KEY) || "[]");
      if (Array.isArray(v)) setFound(v.filter((x): x is SecretId => secrets.some((s) => s.id === x)));
    } catch {}
  }, []);

  const say = useCallback((text: string, ms = 5200) => {
    window.clearTimeout(toastTimer.current);
    setToast((t) => ({ text, n: (t?.n ?? 0) + 1 }));
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }, []);

  const foundRef = useRef<SecretId[]>([]);
  foundRef.current = found;
  const onFind = useCallback(
    (id: SecretId, el: HTMLElement) => {
      const def = secrets.find((s) => s.id === id);
      if (!def) return;
      sfx[def.snd]();
      const target = el.querySelector("svg, .sun") ?? el;
      if (def.fx === "hop") gsap.fromTo(target, { y: 0 }, { y: -46, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" });
      else if (def.fx === "twinkle") gsap.fromTo(target, { filter: "brightness(1.9)" }, { filter: "brightness(1)", duration: 1.2, ease: "power2.out" });
      else gsap.fromTo(target, { rotation: -7, transformOrigin: "50% 100%" }, { rotation: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
      say(def.text, 5200);
      if (foundRef.current.includes(id)) return;
      const next = [...foundRef.current, id];
      setFound(next);
      try {
        localStorage.setItem(SECRET_KEY, JSON.stringify(next));
      } catch {}
      if (next.length === secrets.length) {
        window.setTimeout(() => {
          sfx.win();
          say(`${secretsDone.title}. ${secretsDone.text}`, 8000);
          if (stage.current) burst(stage.current, window.innerWidth / 2, window.innerHeight / 2, { count: 60, shape: "confetti", distance: 340, colors: ["#ffb86b", "#ff7aa8", "#7c93ff", "#fff1df"] });
        }, 2600);
      }
    },
    [say]
  );

  /** Vista de "mirar el cuarto": más abierta que la general, con tres posiciones (izquierda, centro, derecha) para llegar a todo. */
  const panTo = useCallback(
    (p: -1 | 0 | 1) => {
      const ov = poseOf("overview");
      const s = ov.s * 0.55;
      setPan(p);
      void cam.current?.move({ x: [-1650, -100, 1650][p + 1], y: ov.y, z: ov.z, s }, 1.8, { steps: false });
    },
    [poseOf]
  );
  const lookAround = async () => {
    sfx.click();
    await goTo("overview", { duration: 3.2, style: "walk" });
    panTo(0);
  };
  const backToStation = () => {
    sfx.click();
    setToast(null);
    void goTo(lastStation.current, { duration: 3.4, style: "walk" });
  };

  /** Gira la hoja de la puerta (0 = cerrada, 100 = abierta hacia el cuarto). */
  const swingDoor = useCallback((deg: number, d: number) => {
    const leaf = world.current?.querySelector<HTMLElement>(".door-leaf");
    return new Promise<void>((resolve) => {
      if (!leaf) return resolve();
      if (!leaf.style.getPropertyValue("--door")) leaf.style.setProperty("--door", "0");
      gsap.to(leaf, { "--door": deg, duration: d, ease: deg > 0 ? "power2.inOut" : "power3.in", onComplete: () => resolve() });
    });
  }, []);

  /** Muestra un cuadro de mensaje y espera a que lo acepten. */
  const showNotice = useCallback((n: Exclude<Notice, null>) => {
    setNotice(n);
    return new Promise<void>((resolve) => {
      noticeDone.current = resolve;
    });
  }, []);
  const acceptNotice = () => {
    sfx.click();
    setNotice(null);
    noticeDone.current?.();
    noticeDone.current = null;
  };

  // Entrada: la cámara se acerca a la puerta, se abre y aparece el mensaje; al aceptar, entra caminando y va a la PC.
  const enter = async () => {
    initAudio();
    sfx.click();
    setMusic("room", 4);
    busy.current = true;
    setStarted(true);
    setFlying(true);
    setZone("both");
    gsap.to(".room-intro", { autoAlpha: 0, duration: 0.8, ease: "power2.out" });
    const c = cam.current;
    if (!c) return;
    const p = poseOf("door");
    const near = c.move({ z: p.z - 330 }, 3.2);
    await new Promise<void>((r) => gsap.delayedCall(1.2, r));
    sfx.creak();
    await swingDoor(100, 3.2);
    await near;
    setFlying(false);
    await showNotice("intro");
    window.setTimeout(() => setZone("room"), 3600); // ya cruzó la puerta: el pasillo deja de dibujarse
    await goTo("pc", { duration: 11, style: "turn" });
    busy.current = false;
  };

  const leave = (from: StationId) => async () => {
    if (from === "switch") {
      // De vuelta en la PC la cámara se acerca sola hasta "entrar" en la pantalla: sin botones.
      setChapter(2);
      await goTo("pc", { duration: 8, style: "turn" });
      const p = poseOf("pc");
      await cam.current?.flyTo({ ...p, s: p.s * 1.22 }, { duration: 2.2, ease: "power2.inOut" });
      return;
    }
    void goTo(NEXT[from], { duration: 8, style: "turn" });
  };

  // Final: se apaga la PC, la cámara retrocede, gira despacio hacia la puerta, aparece el mensaje, sale y cierra la puerta.
  const finishNight = useCallback(async () => {
    const c = cam.current;
    if (!c) return;
    busy.current = true;
    setFlying(true);
    setZone("both");
    atRef.current = "door";
    stage.current?.removeAttribute("data-focus");
    c.setParallax(0.8);
    sfx.whoosh();
    setMusic("end", 4);
    const here = c.pos();
    const ov = poseOf("overview");
    const sDoor = Math.max(0.6, Math.min(1.3, window.innerHeight / 1060));
    // La pose es el punto del plano de la pantalla: el ojo queda 1200 px detrás. De frente a la puerta, a ~1000 px de ella.
    const front = { x: 0, y: 330, z: DOOR_Z - 2200, s: sDoor, rx: 0 };

    // 1) Retrocede en línea recta hasta el centro del cuarto.
    await c.move({ x: here.x, y: ov.y, z: ov.z, s: ov.s, rx: ov.rx, ry: 0 }, 3);
    // 2) Gira despacio sobre su eje hasta mirar la puerta (que está a sus espaldas).
    const yaw = (Math.atan2(front.x - here.x, -(front.z - ov.z)) * 180) / Math.PI;
    const turning = (on: boolean) => stage.current?.classList.toggle("is-turning", on);
    await c.pivot(yaw, 6, { onTurn: turning });
    // 3) Camina recto hacia la puerta y se endereza de frente a ella.
    await Promise.all([c.move(front, 4), c.pivot(-180, 1.8, { delay: 2.2, tilt: false, ease: "power2.inOut" })]);
    setFlying(false);
    // 4) El cuadro de reflexión.
    await showNotice("outro");
    setFlying(true);
    // 5) Sale al pasillo, se da la vuelta despacio y cierra la puerta.
    await c.move({ z: DOOR_Z - 100 }, 3.4);
    await c.pivot(-360, 4, { onTurn: turning });
    sfx.creak();
    await swingDoor(0, 2.4);
    sfx.thud();
    setZone("hall"); // la puerta cerrada tapa el cuarto: ya no hace falta dibujarlo
    await new Promise<void>((r) => gsap.delayedCall(1.4, r));
    setEnded(true);
  }, [poseOf, showNotice, swingDoor]);

  const inert = (id: StationId) => at !== id || flying;
  const looking = at === "overview" && !flying && !ended;
  const canLook = started && !flying && !notice && !ended && at !== "overview" && at !== "door" && !(at === "pc" && chapter === 2);

  return (
    <div className={`stage${flying ? " is-flying" : ""}${looking ? " is-look" : ""}`} data-zone={zone} data-tod={tod} ref={stage}>
      <div className="world" ref={world}>
        <Scene armed={looking} onFind={onFind} />

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
              {id === "pc" && <PcStation key={pcInitial} initial={pcInitial} chapter={chapter} active={at === "pc" && !flying && chapter === 2} onExit={leave("pc")} onEnding={finishNight} />}
              {id === "gba" && <Gba active={at === "gba" && !flying} onExit={leave("gba")} />}
              {id === "tama" && <Tama active={at === "tama" && !flying} onExit={leave("tama")} />}
              {id === "switch" && <Switch onExit={leave("switch")} />}
            </div>
          );
        })}
      </div>

      <div className="tod" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <SoundToggle />

      {!started && (
        <div className="room-intro">
          <div className="room-intro-top">
            <p className="room-kicker">{KICKER[tod]}</p>
            <h1>Feliz cumpleaños, ShuraHiwa</h1>
          </div>
          <button type="button" className="btn btn-lg btn-go" onClick={enter} data-nofx>
            Entrar al cuarto
          </button>
        </div>
      )}

      {canLook && (
        <button type="button" className="look-btn" onClick={lookAround} data-nofx>
          Mirar el cuarto{found.length ? ` · ${found.length}/${secrets.length}` : ""}
        </button>
      )}

      {looking && (
        <div className="look-hud">
          <p>
            Toca lo que hay en el cuarto: guarda <b>{secrets.length} secretos</b> <span className="look-count">{found.length}/{secrets.length}</span>
          </p>
          <div className="look-row">
            <button type="button" className="look-arrow" aria-label="Mirar a la izquierda" disabled={pan === -1} onClick={() => { sfx.click(); panTo((pan - 1) as -1 | 0); }} data-nofx>
              ‹
            </button>
            <button type="button" className="btn btn-go" onClick={backToStation} data-nofx>
              Volver
            </button>
            <button type="button" className="look-arrow" aria-label="Mirar a la derecha" disabled={pan === 1} onClick={() => { sfx.click(); panTo((pan + 1) as 0 | 1); }} data-nofx>
              ›
            </button>
          </div>
        </div>
      )}

      {toast && (
        <p className="secret-toast" key={toast.n} role="status">
          {toast.text}
        </p>
      )}

      {notice && (
        <div className="room-note">
          <div className={`room-note-card note-${notice}`} role="dialog" aria-modal="true" aria-labelledby="rn-t">
            {notice === "intro" ? (
              <p id="rn-t" className="rn-quote">{doorIntro.text}</p>
            ) : (
              <>
                <h2 id="rn-t">{doorOutro.title}</h2>
                {doorOutro.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </>
            )}
            <button type="button" className="btn btn-go" autoFocus onClick={acceptNotice} data-nofx>
              {notice === "intro" ? doorIntro.cta : doorOutro.cta}
            </button>
          </div>
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
