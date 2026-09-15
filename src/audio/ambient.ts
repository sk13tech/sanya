// Gentle site-wide background music — a slow, warm romantic loop that
// never competes with the moment. Synthesized through the shared audio
// context (already unlocked by her first tap), so it always plays.

import { sharedCtx } from "./sfx";

const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
};

// I–V–vi–IV in C: the warmest progression there is.
const PROGRESSION = [
  { bass: N.C3, chord: [N.E4, N.G4, N.C5] },
  { bass: N.G3, chord: [N.D4, N.G4, N.B4] },
  { bass: N.A3, chord: [N.E4, N.A4, N.C5] },
  { bass: N.F3, chord: [N.F4, N.A4, N.C5] },
];

// A drifting top-line that floats over the chords.
const SPARKLES = [N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.D5, N.E5];

// ── YOUR OWN BACKGROUND TRACK ──────────────────────────────
// Drop an audio file into `public/` named one of these and it
// becomes the site-wide background music (looped, soft volume).
// If none exists, the built-in romantic loop below plays instead.
const BG_CANDIDATES = [
  "/background-music.mp3",
  "/background-music.m4a",
  "/background-music.ogg",
  "/background-music.wav",
];

let master: GainNode | null = null;
let timer: number | undefined;
let running = false;
let step = 0;
let bgEl: HTMLAudioElement | null = null;
let usingFile = false;

function reverbBuffer(ctx: AudioContext): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 2.6);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
  }
  return buf;
}

function tone(
  ctx: AudioContext,
  out: GainNode,
  f: number,
  t: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine"
) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = Math.random() * 7 - 3.5;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + dur * 0.32);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(env).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function bell(ctx: AudioContext, out: GainNode, f: number, t: number, gain: number) {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  env.connect(out);
  for (const [m, a] of [
    [1, 1],
    [2.01, 0.22],
  ] as const) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * m;
    const g = ctx.createGain();
    g.gain.value = a;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + 2.5);
  }
}

const BAR = 4.4; // seconds per chord — slow and dreamy

function scheduleBar(ctx: AudioContext, out: GainNode) {
  const { bass, chord } = PROGRESSION[step % PROGRESSION.length];
  const t = ctx.currentTime + 0.1;

  tone(ctx, out, bass / 2, t, BAR * 1.05, 0.05, "sine");
  tone(ctx, out, bass, t, BAR * 1.05, 0.042, "sine");
  for (const f of chord) tone(ctx, out, f, t + 0.12, BAR * 0.98, 0.026, "triangle");

  // a couple of soft music-box notes drifting on top
  bell(ctx, out, SPARKLES[step % SPARKLES.length], t + 0.25, 0.055);
  if (step % 2 === 0) {
    bell(ctx, out, SPARKLES[(step + 3) % SPARKLES.length], t + BAR * 0.58, 0.036);
  }

  step++;
}

export function isAmbientPlaying(): boolean {
  return running;
}

/** Look for a real music file without ever hanging. */
async function findTrack(): Promise<string | null> {
  for (const url of BG_CANDIDATES) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
      window.clearTimeout(t);
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && !type.includes("text/html")) return url;
    } catch {
      /* next */
    }
  }
  return null;
}

export function startAmbient() {
  if (running) return;
  const ctx = sharedCtx();
  ctx.resume().catch(() => undefined);

  // Prefer her real song if you've added one; swap in seamlessly.
  findTrack().then((url) => {
    if (!url || !running || usingFile) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    el.addEventListener("playing", () => {
      usingFile = true;
      stopSynthLoop();
      let v = 0;
      const fade = window.setInterval(() => {
        v = Math.min(0.42, v + 0.02);
        el.volume = v;
        if (v >= 0.42) window.clearInterval(fade);
      }, 90);
    }, { once: true });
    bgEl = el;
    el.play().catch(() => { bgEl = null; });
  });

  master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  const conv = ctx.createConvolver();
  conv.buffer = reverbBuffer(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.34;
  conv.connect(wet).connect(master);

  const bus = ctx.createGain();
  bus.connect(master);
  bus.connect(conv);

  running = true;
  master.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 3.2);

  scheduleBar(ctx, bus);
  timer = window.setInterval(() => {
    if (running) scheduleBar(ctx, bus);
  }, BAR * 1000);
}

/** Silence just the synthesized loop (used when a real track takes over). */
function stopSynthLoop() {
  window.clearInterval(timer);
  if (master) {
    const ctx = sharedCtx();
    const g = master.gain;
    const m = master;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(Math.max(g.value, 0.0001), ctx.currentTime);
    g.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    window.setTimeout(() => {
      try {
        m.disconnect();
      } catch {
        /* gone */
      }
    }, 1600);
    master = null;
  }
}

export function stopAmbient() {
  if (!running) return;
  running = false;
  usingFile = false;
  window.clearInterval(timer);

  if (bgEl) {
    const el = bgEl;
    bgEl = null;
    let v = el.volume;
    const fade = window.setInterval(() => {
      v = Math.max(0, v - 0.04);
      el.volume = v;
      if (v <= 0) {
        window.clearInterval(fade);
        el.pause();
        el.src = "";
      }
    }, 60);
  }
  const ctx = sharedCtx();
  if (master) {
    const g = master.gain;
    const m = master;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(Math.max(g.value, 0.0001), ctx.currentTime);
    g.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
    window.setTimeout(() => {
      try {
        m.disconnect();
      } catch {
        /* already gone */
      }
    }, 1500);
    master = null;
  }
}

/** Duck the music down while something important sings, then lift it back. */
export function duckAmbient(seconds: number) {
  if (!running) return;

  // real track: dip the element volume
  if (bgEl) {
    const el = bgEl;
    const from = el.volume;
    el.volume = 0.05;
    window.setTimeout(() => {
      if (bgEl === el) el.volume = from;
    }, seconds * 1000);
    return;
  }

  if (!master) return;
  const ctx = sharedCtx();
  const g = master.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(Math.max(g.value, 0.0001), ctx.currentTime);
  g.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.8);
  g.setValueAtTime(0.045, ctx.currentTime + seconds);
  g.exponentialRampToValueAtTime(0.4, ctx.currentTime + seconds + 2.2);
}
