// "Happy Birthday" for the candle finale — plays ONCE, automatically,
// the moment the last candle goes out.
//
// ▸ BEST: record yourself singing it and drop the file into `public/` as
//   happy-birthday.mp3 (or .m4a / .ogg / .wav). Your voice will play.
// ▸ If no file exists, a built-in melodic rendition plays instead,
//   so the song ALWAYS happens.

import { sharedBus, sharedCtx } from "./sfx";

const CANDIDATES = [
  "/happy-birthday.mp3",
  "/happy-birthday.m4a",
  "/happy-birthday.ogg",
  "/happy-birthday.wav",
];

let current: HTMLAudioElement | null = null;
let synthTimer: number | undefined;
let killSynth: (() => void) | null = null;

/* ── built-in fallback rendition ───────────────────────────── */

const P = {
  C3: 130.81, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, C6: 1046.5,
};

const MELODY: { f: number | null; b: number }[] = [
  { f: P.G4, b: 0.75 }, { f: P.G4, b: 0.25 }, { f: P.A4, b: 1 }, { f: P.G4, b: 1 }, { f: P.C5, b: 1 }, { f: P.B4, b: 1.75 }, { f: null, b: 0.25 },
  { f: P.G4, b: 0.75 }, { f: P.G4, b: 0.25 }, { f: P.A4, b: 1 }, { f: P.G4, b: 1 }, { f: P.D5, b: 1 }, { f: P.C5, b: 1.75 }, { f: null, b: 0.25 },
  { f: P.G4, b: 0.75 }, { f: P.G4, b: 0.25 }, { f: P.G5, b: 1 }, { f: P.E5, b: 1 }, { f: P.C5, b: 1 }, { f: P.B4, b: 1 }, { f: P.A4, b: 1.75 }, { f: null, b: 0.25 },
  { f: P.F5, b: 0.75 }, { f: P.F5, b: 0.25 }, { f: P.E5, b: 1 }, { f: P.C5, b: 1 }, { f: P.D5, b: 1 }, { f: P.C5, b: 2.5 }, { f: null, b: 0.5 },
  { f: P.G5, b: 0.5 }, { f: P.E5, b: 0.5 }, { f: P.C5, b: 0.5 }, { f: P.C6, b: 2 },
];

const CHORDS: { s: number; e: number; ch: number[] }[] = [
  { s: 0, e: 4, ch: [P.C3, P.E3, P.G3] },
  { s: 4, e: 6, ch: [P.G3, P.B3, P.D4] },
  { s: 6, e: 10, ch: [P.C3, P.E3, P.G3] },
  { s: 10, e: 12, ch: [P.G3, P.B3, P.D4] },
  { s: 12, e: 18, ch: [P.C3, P.E3, P.G3] },
  { s: 18, e: 20, ch: [P.F3, P.A3, P.C4] },
  { s: 20, e: 22, ch: [P.C3, P.E3, P.G3] },
  { s: 22, e: 24.5, ch: [P.F3, P.A3, P.C4] },
  { s: 24.5, e: 26, ch: [P.G3, P.B3, P.D4] },
  { s: 26, e: 31, ch: [P.C3, P.E3, P.G3] },
];

function reverb(ctx: AudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 2.1);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return buf;
}

function voice(ctx: AudioContext, out: GainNode, f: number, t: number, dur: number, gain: number) {
  // soft "aah" style tone: triangle + sine with vibrato
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.07);
  env.gain.setValueAtTime(gain, t + dur * 0.62);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  env.connect(out);

  const vib = ctx.createOscillator();
  vib.frequency.value = 5.2;
  const vibGain = ctx.createGain();
  vibGain.gain.value = f * 0.007;
  vib.connect(vibGain);
  vib.start(t);
  vib.stop(t + dur);

  for (const [mult, amt, type] of [
    [1, 1, "triangle"],
    [2, 0.22, "sine"],
    [3, 0.08, "sine"],
  ] as [number, number, OscillatorType][]) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f * mult;
    vibGain.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.value = amt;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

function pad(ctx: AudioContext, out: GainNode, f: number, t: number, dur: number, gain: number) {
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = f;
  o.detune.value = Math.random() * 8 - 4;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.8);
  env.gain.setValueAtTime(gain, t + Math.max(dur - 1, dur * 0.6));
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(env).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function playSynth(onState: (playing: boolean) => void) {
  // Reuse the SFX context — it is already unlocked by her taps/blows,
  // so the song is guaranteed to be audible.
  const ctx = sharedCtx();
  ctx.resume().catch(() => undefined);

  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(sharedBus());
  const conv = ctx.createConvolver();
  conv.buffer = reverb(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.3;
  conv.connect(wet).connect(master);
  const bus = ctx.createGain();
  bus.connect(master);
  bus.connect(conv);

  const beat = 60 / 100;
  const t0 = ctx.currentTime + 0.12;

  let t = t0;
  for (const ev of MELODY) {
    if (ev.f !== null) voice(ctx, bus, ev.f, t, ev.b * beat * 0.96, 0.15);
    t += ev.b * beat;
  }
  for (const c of CHORDS) {
    for (const f of c.ch) pad(ctx, bus, f, t0 + c.s * beat, (c.e - c.s) * beat, 0.035);
  }

  const total = MELODY.reduce((s, e) => s + e.b, 0) * beat + 2;
  const cleanup = () => {
    try {
      bus.disconnect();
      conv.disconnect();
      wet.disconnect();
      master.disconnect();
    } catch {
      /* already gone */
    }
  };

  onState(true);
  window.clearTimeout(synthTimer);
  synthTimer = window.setTimeout(() => {
    onState(false);
    cleanup();
  }, total * 1000);

  killSynth = () => {
    window.clearTimeout(synthTimer);
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
    } catch {
      /* ignore */
    }
    window.setTimeout(cleanup, 500);
    killSynth = null;
  };
}

/* ── public API ────────────────────────────────────────────── */

/** Quickly check whether a real audio file exists (never hangs). */
async function findRecording(): Promise<string | null> {
  for (const url of CANDIDATES) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
      window.clearTimeout(t);
      const type = res.headers.get("content-type") ?? "";
      // a 404 SPA fallback returns text/html — only accept real audio
      if (res.ok && !type.includes("text/html")) return url;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

export function playVocalBirthday(onState: (playing: boolean) => void) {
  stopVocalBirthday();

  // Start the built-in rendition immediately so the song ALWAYS happens,
  // then swap to her personal recording if one turns out to exist.
  let usedRecording = false;
  playSynth((v) => {
    if (!usedRecording) onState(v);
  });

  findRecording().then((url) => {
    if (!url) return;
    const el = new Audio(url);
    el.volume = 0.9;
    el.addEventListener("playing", () => {
      usedRecording = true;
      stopSynthOnly();
      onState(true);
    }, { once: true });
    el.addEventListener("ended", () => {
      if (current === el) current = null;
      onState(false);
    }, { once: true });
    current = el;
    const p = el.play();
    if (p) p.catch(() => { current = null; });
  });
}

function stopSynthOnly() {
  killSynth?.();
}

export function stopVocalBirthday() {
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
  window.clearTimeout(synthTimer);
  killSynth?.();
}
