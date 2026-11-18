import { audioBus, audioLive } from "./sfx";

/*
  Música del cuarto, compuesta en el navegador con la Web Audio API (sin archivos de audio).
  Cada aparato tiene su propia pista y al cambiar de aparato se hace un crossfade:
    room   · lo-fi cálido (el cuarto)         pc     · lo-fi nocturno, más íntimo
    gba    · chiptune alegre                  switch · marimba y bajo suave
    tama   · pitiditos de huevito             end    · pad lento para la despedida
  Un planificador mira unos 0,6 s hacia adelante y programa las notas, así que casi no usa CPU.
*/
export type Track = "room" | "pc" | "gba" | "switch" | "tama" | "end";

type Out = GainNode;
type Bus = NonNullable<ReturnType<typeof audioBus>>;
type Voice = (b: Bus, out: Out, step: number, t: number, spd: number) => void;
type Def = { bpm: number; swing: number; vol: number; steps: number; play: Voice };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function note(b: Bus, out: Out, m: number, t: number, dur: number, o: { type?: OscillatorType; vol?: number; atk?: number; lp?: number; det?: number } = {}) {
  const { ctx } = b;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.value = mtof(m);
  if (o.det) osc.detune.value = o.det;
  const atk = o.atk ?? 0.01;
  const v = o.vol ?? 0.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (o.lp) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = o.lp;
    osc.connect(f);
    node = f;
  }
  node.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Piano eléctrico suave (lo-fi). */
const ep = (b: Bus, out: Out, m: number, t: number, dur: number, vol = 0.07) => {
  note(b, out, m, t, dur, { type: "sine", vol, atk: 0.012, lp: 2200 });
  note(b, out, m + 12, t, dur * 0.5, { type: "sine", vol: vol * 0.25, atk: 0.01 });
  note(b, out, m, t, dur * 0.8, { type: "triangle", vol: vol * 0.35, atk: 0.012, det: 7, lp: 1400 });
};
/** Pluck tipo marimba. */
const pluck = (b: Bus, out: Out, m: number, t: number, vol = 0.1) => {
  note(b, out, m, t, 0.5, { type: "sine", vol, atk: 0.004 });
  note(b, out, m + 24, t, 0.09, { type: "sine", vol: vol * 0.3, atk: 0.003 });
};
const pad = (b: Bus, out: Out, m: number, t: number, dur: number, vol = 0.04) => {
  note(b, out, m, t, dur, { type: "sine", vol, atk: dur * 0.35, lp: 1200 });
  note(b, out, m, t, dur, { type: "triangle", vol: vol * 0.5, atk: dur * 0.35, det: -9, lp: 900 });
};

function nz(b: Bus, out: Out, t: number, dur: number, vol: number, type: BiquadFilterType, freq: number, q = 1) {
  const s = b.ctx.createBufferSource();
  s.buffer = b.noise;
  s.loop = true;
  const f = b.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = b.ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(out);
  s.start(t, Math.random() * 0.8);
  s.stop(t + dur + 0.02);
}
const hat = (b: Bus, out: Out, t: number, v = 0.03) => nz(b, out, t, 0.05, v, "highpass", 7000);
const snare = (b: Bus, out: Out, t: number, v = 0.05) => nz(b, out, t, 0.14, v, "bandpass", 1800, 0.7);
const kick = (b: Bus, out: Out, t: number, v = 0.22) => {
  const o = b.ctx.createOscillator();
  const g = b.ctx.createGain();
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.25);
};
const crackle = (b: Bus, out: Out, t: number) => {
  if (Math.random() < 0.35) nz(b, out, t + Math.random() * 0.3, 0.012, 0.025, "highpass", 3500);
};

// Acordes (notas MIDI) y notas de bajo, uno por compás.
const ROOM_CH = [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]]; // Cmaj7 Am7 Dm7 G7
const ROOM_BASS = [36, 33, 38, 31];
const ROOM_MEL: (number | 0)[][] = [
  [0, 0, 76, 0, 79, 0, 0, 0],
  [0, 77, 0, 76, 0, 0, 72, 0],
  [0, 0, 74, 0, 77, 0, 76, 0],
  [79, 0, 0, 77, 0, 74, 0, 0],
];

const PC_CH = [[57, 60, 64, 71], [53, 57, 60, 64], [60, 64, 67, 71], [52, 55, 59, 62]]; // Am9 Fmaj7 Cmaj7 Em7
const PC_BASS = [33, 29, 36, 28];

const GBA_MEL: (number | 0)[][] = [
  [72, 0, 76, 0, 79, 0, 76, 0, 72, 0, 76, 79, 84, 0, 79, 0],
  [74, 0, 77, 0, 81, 0, 77, 0, 74, 0, 77, 81, 86, 0, 81, 0],
  [71, 0, 74, 0, 79, 0, 74, 0, 71, 74, 79, 0, 83, 0, 79, 74],
  [72, 76, 79, 0, 84, 0, 83, 0, 79, 0, 76, 0, 72, 0, 0, 0],
];
const GBA_BASS = [36, 38, 43, 36];

const SW_CH = [[67, 71, 74], [64, 67, 71], [60, 64, 67], [62, 66, 69]]; // G Em C D
const SW_BASS = [43, 40, 36, 38];
const PENT = [67, 69, 71, 74, 76, 79, 81]; // G A B D E G A

const TAMA_PENT = [84, 86, 88, 91, 93, 96];
const END_CH = [[48, 55, 64], [43, 55, 62], [45, 52, 60], [41, 53, 60]]; // C G Am F

const DEFS: Record<Track, Def> = {
  room: {
    bpm: 72, swing: 0.05, vol: 1, steps: 32,
    play(b, out, step, t, spd) {
      const bar = (step >> 3) & 3;
      const s = step & 7;
      const ch = ROOM_CH[bar];
      if (s === 0) ch.forEach((m, i) => ep(b, out, m, t + i * 0.012, spd * 7, 0.055));
      if (s === 3) ch.slice(1).forEach((m) => ep(b, out, m, t, spd * 2, 0.025));
      if (s === 0 || s === 5) note(b, out, ROOM_BASS[bar], t, spd * 3.2, { vol: 0.17, atk: 0.015, lp: 300 });
      if (s === 0 || s === 5) kick(b, out, t, 0.16);
      if (s === 2 || s === 6) snare(b, out, t, 0.04);
      hat(b, out, t, s % 2 ? 0.014 : 0.022);
      const m = ROOM_MEL[bar][s];
      if (m) note(b, out, m, t, spd * 2.4, { type: "triangle", vol: 0.05, atk: 0.02, lp: 2400 });
      crackle(b, out, t);
    },
  },
  pc: {
    bpm: 62, swing: 0.03, vol: 0.9, steps: 32,
    play(b, out, step, t, spd) {
      const bar = (step >> 3) & 3;
      const s = step & 7;
      const ch = PC_CH[bar];
      if (s === 0) {
        ch.forEach((m) => pad(b, out, m - 12, t, spd * 8.2, 0.035));
        note(b, out, PC_BASS[bar], t, spd * 6, { vol: 0.15, atk: 0.04, lp: 260 });
      }
      // Arpegio suave y lejano
      const order = [0, 1, 2, 3, 2, 1, 3, 2];
      if (s % 2 === 0 || s === 5) ep(b, out, ch[order[s]] + 12, t, spd * 3, 0.04);
      if (s === 4) kick(b, out, t, 0.08);
      if (s === 6) hat(b, out, t, 0.016);
      crackle(b, out, t);
    },
  },
  gba: {
    bpm: 140, swing: 0, vol: 0.75, steps: 64,
    play(b, out, step, t, spd) {
      const bar = (step >> 4) & 3;
      const s = step & 15;
      const m = GBA_MEL[bar][s];
      if (m) note(b, out, m, t, spd * 1.7, { type: "square", vol: 0.055, atk: 0.004, lp: 5000 });
      if (s % 4 === 0) note(b, out, GBA_BASS[bar], t, spd * 3.4, { type: "triangle", vol: 0.16, atk: 0.005 });
      if (s % 4 === 2) note(b, out, GBA_BASS[bar] + 12, t, spd * 1.6, { type: "triangle", vol: 0.09, atk: 0.005 });
      if (s % 2 === 1) note(b, out, GBA_BASS[bar] + 28 + (s % 4 === 1 ? 0 : 4), t, spd * 0.8, { type: "square", vol: 0.018, atk: 0.003 });
      if (s % 4 === 0) nz(b, out, t, 0.05, 0.05, "highpass", 5000);
      else if (s % 4 === 2) nz(b, out, t, 0.03, 0.025, "highpass", 8000);
    },
  },
  switch: {
    bpm: 92, swing: 0.04, vol: 1, steps: 32,
    play(b, out, step, t, spd) {
      const bar = (step >> 3) & 3;
      const s = step & 7;
      const ch = SW_CH[bar];
      if (s === 0) note(b, out, SW_BASS[bar], t, spd * 3.6, { vol: 0.16, atk: 0.012, lp: 320 });
      if (s === 4) note(b, out, SW_BASS[bar] + 7, t, spd * 2.4, { vol: 0.12, atk: 0.012, lp: 320 });
      if (s === 0 || s === 3 || s === 6) ch.forEach((m, i) => pluck(b, out, m + 12, t + i * 0.025, 0.045));
      // Melodía pentatónica que se mueve por la escala
      const k = (bar * 3 + s * 2 + (bar % 2)) % PENT.length;
      if (s === 1 || s === 2 || s === 5 || s === 7) pluck(b, out, PENT[k] + 12, t, 0.065);
      if (s % 2 === 0) nz(b, out, t, 0.04, 0.012, "highpass", 6000);
      if (s === 4) note(b, out, 100, t, 0.04, { type: "square", vol: 0.012, atk: 0.001 }); // clic de madera
    },
  },
  tama: {
    bpm: 108, swing: 0, vol: 0.8, steps: 32,
    play(b, out, step, t, spd) {
      const s = step & 31;
      const pat = [0, 2, 0, 4, 3, 0, 5, 0, 1, 0, 0, 3, 2, 0, 4, 0, 0, 5, 3, 0, 2, 0, 1, 0, 4, 0, 0, 2, 3, 0, 0, 0];
      const v = pat[s];
      if (v) note(b, out, TAMA_PENT[v - 1], t, spd * 0.9, { type: "square", vol: 0.04, atk: 0.003 });
      if (s % 8 === 0) note(b, out, 55, t, spd * 2, { type: "square", vol: 0.04, atk: 0.003, lp: 400 });
      if (s % 8 === 4) nz(b, out, t, 0.02, 0.02, "highpass", 8000);
    },
  },
  end: {
    bpm: 50, swing: 0, vol: 1, steps: 32,
    play(b, out, step, t, spd) {
      const bar = (step >> 3) & 3;
      const s = step & 7;
      if (s === 0) {
        END_CH[bar].forEach((m) => pad(b, out, m, t, spd * 8.5, 0.05));
        note(b, out, END_CH[bar][0] - 12, t, spd * 8, { vol: 0.12, atk: 0.3, lp: 200 });
      }
      if (s === 2 || s === 5) pluck(b, out, END_CH[bar][(s + bar) % 3] + 24, t, 0.05);
    },
  },
};

/* ───────── Planificador ───────── */
type Slot = { gain: GainNode; next: number; step: number; ended: number };
const slots = new Map<Track, Slot>();
let want: Track | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let hidBound = false;

function tick() {
  const b = audioBus();
  if (!b) return;
  const now = b.ctx.currentTime;
  slots.forEach((slot, id) => {
    if (id !== want && slot.ended && now > slot.ended) {
      slot.gain.disconnect();
      slots.delete(id);
      return;
    }
    if (id !== want && !slot.ended) return;
    const d = DEFS[id];
    const dur = 60 / d.bpm / (id === "gba" ? 4 : 2); // un paso = una corchea (en gba, una semicorchea)
    if (slot.next < now) slot.next = now + 0.05; // se quedó atrás (pestaña dormida): sigue desde ahora
    while (slot.next < now + 0.6) {
      const swing = slot.step % 2 ? d.swing : 0;
      if (audioLive()) d.play(b, slot.gain, slot.step % d.steps, slot.next + swing, dur);
      slot.next += dur;
      slot.step++;
    }
  });
  if (slots.size === 0 && timer) {
    clearInterval(timer);
    timer = null;
  }
}

/** Cambia la pista con crossfade. `null` apaga la música. Es seguro llamarla antes de que el audio esté activo (no hace nada). */
export function setMusic(track: Track | null, fade = 2) {
  const b = audioBus();
  if (!b) return;
  if (!hidBound) {
    hidBound = true;
    document.addEventListener("visibilitychange", () => {
      const a = audioBus();
      if (!a) return;
      if (document.hidden) void a.ctx.suspend();
      else void a.ctx.resume();
    });
  }
  const { ctx, master } = b;
  const now = ctx.currentTime;
  want = track;
  slots.forEach((slot, id) => {
    if (id !== track && !slot.ended) {
      slot.gain.gain.cancelScheduledValues(now);
      slot.gain.gain.setValueAtTime(slot.gain.gain.value, now);
      slot.gain.gain.linearRampToValueAtTime(0, now + fade);
      slot.ended = now + fade + 0.3;
    }
  });
  if (track) {
    let slot = slots.get(track);
    if (!slot || slot.ended) {
      slot?.gain.disconnect();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5 * DEFS[track].vol, now + fade);
      gain.connect(master);
      slot = { gain, next: now + 0.1, step: 0, ended: 0 };
      slots.set(track, slot);
    }
  }
  if (!timer && slots.size) timer = setInterval(tick, 150);
  tick();
}
