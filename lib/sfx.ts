/*
  Sonidos del cuarto, sintetizados con la Web Audio API (sin archivos de audio).
  El contexto se crea al primer gesto del usuario ("Entrar al cuarto"); hasta entonces todo es silencio.
  El silencio se recuerda en localStorage. Todas las funciones son seguras de llamar aunque el audio no esté activo.
*/
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let noiseBuf: AudioBuffer | null = null;

const KEY = "shurahiwa-muted";
const subs = new Set<() => void>();

export function initAudio() {
  if (typeof window === "undefined") return;
  try {
    muted = localStorage.getItem(KEY) === "1";
  } catch {}
  if (ctx) {
    void ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } catch {
    ctx = null;
  }
  subs.forEach((f) => f());
}

export const isMuted = () => muted;
export const audioReady = () => !!ctx;
export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {}
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.5, ctx.currentTime, 0.03);
  subs.forEach((f) => f());
}
export function subscribeAudio(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

/** Para la música: el contexto, la salida general y el ruido (o null si el audio no está activo). */
export const audioBus = () => (ctx && master && noiseBuf ? { ctx, master, noise: noiseBuf } : null);
export const audioLive = () => !!ctx && !!master && !muted && ctx.state === "running";

const live = () => !!ctx && !!master && !muted && ctx.state !== "closed";

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, slideTo?: number, delay = 0) {
  if (!live() || !ctx || !master) return;
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(dur: number, vol = 0.15, from = 800, to = 800, delay = 0, q = 0.8) {
  if (!live() || !ctx || !master || !noiseBuf) return;
  const t0 = ctx.currentTime + delay;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t0);
  s.stop(t0 + dur + 0.05);
}

/** Campana: seno con un parcial inarmónico, ataque corto y cola larga. */
function bell(freq: number, dur: number, vol = 0.16, delay = 0) {
  tone(freq, dur, "sine", vol, undefined, delay);
  tone(freq * 2.76, dur * 0.5, "sine", vol * 0.3, undefined, delay);
  tone(freq * 5.4, dur * 0.25, "sine", vol * 0.1, undefined, delay);
}

const chord = (notes: number[], dur = 0.6, vol = 0.12, gap = 0.08, type: OscillatorType = "triangle") => notes.forEach((n, i) => tone(n, dur, type, vol, undefined, i * gap));

export const sfx = {
  click: () => tone(520, 0.07, "square", 0.08, 380),
  pop: () => tone(380, 0.12, "sine", 0.2, 760),
  tick: () => tone(1200, 0.03, "square", 0.05),
  /** Encendido de una máquina: zumbido que sube. */
  power: () => {
    tone(90, 0.9, "sawtooth", 0.07, 420);
    tone(180, 0.9, "triangle", 0.08, 840, 0.05);
    noise(0.5, 0.05, 300, 2400);
  },
  boot: () => chord([523, 659, 784, 1047], 0.9, 0.12, 0.1),
  ding: () => {
    tone(988, 0.5, "sine", 0.2);
    tone(1319, 0.8, "sine", 0.16, undefined, 0.12);
  },
  whoosh: () => noise(1.1, 0.1, 300, 1800),
  flip: () => {
    noise(0.18, 0.12, 2400, 900);
    tone(660, 0.2, "triangle", 0.08, 990, 0.1);
  },
  shuffle: () => [0, 0.12, 0.24, 0.4, 0.52].forEach((d) => noise(0.09, 0.1, 2000, 1200, d)),
  success: () => chord([523, 659, 784], 0.5, 0.14, 0.09),
  error: () => {
    tone(220, 0.25, "sawtooth", 0.14, 140);
    tone(165, 0.35, "sawtooth", 0.14, 90, 0.18);
  },
  win: () => chord([523, 659, 784, 1047, 1319], 0.7, 0.13, 0.11),
  bark: () => {
    tone(420, 0.12, "sawtooth", 0.16, 260);
    tone(380, 0.14, "sawtooth", 0.14, 230, 0.16);
  },
  eat: () => [0, 0.14, 0.28, 0.42].forEach((d) => noise(0.07, 0.16, 1500, 700, d, 2)),
  sleep: () => {
    tone(440, 0.8, "sine", 0.1, 260);
    tone(330, 0.9, "sine", 0.08, 196, 0.2);
  },
  blow: () => noise(0.9, 0.12, 600, 3000),
  cut: () => {
    tone(1500, 0.14, "triangle", 0.08, 500);
    noise(0.12, 0.08, 4000, 1500);
  },
  save: () => chord([784, 988, 1175], 0.5, 0.12, 0.1, "sine"),
  /** Bisagra de puerta: un chirrido grave que sube y baja. */
  creak: () => {
    tone(110, 1.8, "sawtooth", 0.05, 190);
    tone(165, 1.6, "square", 0.025, 120, 0.2);
    noise(1.8, 0.05, 500, 1400, 0, 6);
  },
  /** Portazo suave. */
  thud: () => {
    tone(90, 0.5, "sine", 0.4, 40);
    noise(0.25, 0.2, 900, 200);
  },
  /** Encendido de la GBA: el logo baja y, al asentarse, suena el "ti-ling" de campana. */
  gbaBoot: () => {
    noise(0.35, 0.03, 600, 3000);
    bell(1568, 0.5, 0.17, 1.1);
    bell(2093, 1.6, 0.2, 1.28);
    tone(784, 1.2, "triangle", 0.04, undefined, 1.28);
  },
  /** Encendido de la Switch: los dos Joy-Con se juntan (clic grave) y suena el acorde brillante. */
  switchBoot: () => {
    tone(150, 0.14, "triangle", 0.2, 70, 0.78);
    noise(0.08, 0.1, 3000, 1500, 0.78);
    bell(1175, 0.5, 0.15, 0.95);
    bell(1568, 0.9, 0.16, 1.1);
    bell(2349, 1.5, 0.12, 1.28);
    tone(392, 1.6, "sine", 0.05, undefined, 1.1);
  },
  /** Un secreto encontrado: dos notas que suben. */
  secret: () => {
    bell(880, 0.5, 0.12);
    bell(1319, 0.9, 0.12, 0.11);
  },
  squeak: () => {
    tone(900, 0.07, "square", 0.07, 1500);
    tone(1300, 0.06, "square", 0.06, 800, 0.08);
  },
  hop: () => {
    tone(300, 0.1, "sine", 0.18, 560);
    tone(420, 0.12, "sine", 0.14, 240, 0.12);
  },
  twinkle: () => [1568, 2093, 2637].forEach((f, i) => bell(f, 0.7, 0.07, i * 0.08)),
  dawn: () => chord([262, 330, 392, 523, 659], 3.2, 0.07, 0.35, "sine"),
};
