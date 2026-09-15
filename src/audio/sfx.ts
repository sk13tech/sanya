// Synthesized party effects — pure Web Audio API, no files.

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    bus = ctx.createGain();
    bus.gain.value = 0.85;
    bus.connect(ctx.destination);
  }
  ctx.resume().catch(() => undefined);
  return ctx;
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    const len = c.sampleRate;
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function chime(f: number, t: number, gain: number) {
  const c = ac();
  if (!bus) return;
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  env.connect(bus);
  for (const [m, a] of [
    [1, 1],
    [2, 0.22],
  ] as const) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f * m;
    const g = c.createGain();
    g.gain.value = a;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + 1.2);
  }
}

// A single party-popper "POP" — cork thump + paper snap
export function playPop(strength = 1) {
  const c = ac();
  if (!bus) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(430 * strength, t);
  o.frequency.exponentialRampToValueAtTime(85, t + 0.12);
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.32, t + 0.008);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(og).connect(bus);
  o.start(t);
  o.stop(t + 0.2);

  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1500 + 500 * strength;
  bp.Q.value = 0.7;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.5 * strength, t + 0.006);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  src.connect(bp).connect(ng).connect(bus);
  src.start(t);
  src.stop(t + 0.15);
}

// Big confetti burst — layered pop + rising sparkle arpeggio
export function playBurst() {
  playPop(1);
  const c = ac();
  const t = c.currentTime;
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => chime(f, t + 0.05 + i * 0.07, 0.09));
  window.setTimeout(() => playPop(0.7), 170);
}

// Breathy candle-blow whoosh
export function playWhoosh() {
  const c = ac();
  if (!bus) return;
  const t = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(2400, t);
  lp.frequency.exponentialRampToValueAtTime(260, t + 0.95);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.09);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
  src.connect(lp).connect(g).connect(bus);
  src.start(t);
  src.stop(t + 1.1);
}

// Gentle magic shimmer (relighting candles)
export function playSparkle() {
  const c = ac();
  const t = c.currentTime;
  [659.25, 783.99, 1046.5, 1568].forEach((f, i) => chime(f, t + i * 0.08, 0.07));
}

// Two quiet greeting pops (side confetti cannons)
export function playGreeting() {
  playPop(0.8);
  window.setTimeout(() => playPop(0.8), 140);
}

// A soft music-box "tick" for each year counted on the loader.
// `step` (0–1) lifts the pitch as the count climbs toward twenty.
export function playTick(step = 0) {
  const c = ac();
  if (!bus) return;
  const t = c.currentTime;

  // gentle rising scale so 1 → 20 feels like it's building
  const base = 620 + step * 520;

  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.085, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  env.connect(bus);

  for (const [mult, amt] of [
    [1, 1],
    [2.01, 0.28],
    [3.98, 0.08],
  ] as const) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = base * mult;
    const g = c.createGain();
    g.gain.value = amt;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + 0.36);
  }
}

// A brighter chime when the count lands on twenty.
export function playCountFinish() {
  const c = ac();
  const t = c.currentTime;
  [783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) =>
    chime(f, t + i * 0.085, 0.085)
  );
}