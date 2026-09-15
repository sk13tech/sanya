// ── SITE-WIDE BACKGROUND MUSIC ─────────────────────────────
// File-only. Drop an audio file into `public/` named one of the
// candidates below and it becomes the looped background music.
// If no file exists, the site simply stays silent — there is no
// synthesized fallback.

const BG_CANDIDATES = [
  "/background-music.mp3",
  "/background-music.m4a",
  "/background-music.ogg",
  "/background-music.wav",
];

const FULL_VOLUME = 0.42;

let bgEl: HTMLAudioElement | null = null;
let running = false;
let duckTimer: number | undefined;

export function isAmbientPlaying(): boolean {
  return running && bgEl !== null;
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
      // a 404 SPA fallback returns text/html — only accept real audio
      if (res.ok && !type.includes("text/html")) return url;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

function fadeTo(el: HTMLAudioElement, target: number, ms: number, onDone?: () => void) {
  const from = el.volume;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    el.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

export function startAmbient() {
  if (running) return;
  running = true;

  findTrack().then((url) => {
    if (!url || !running) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    el.preload = "auto";
    bgEl = el;
    el.play()
      .then(() => fadeTo(el, FULL_VOLUME, 2600))
      .catch(() => {
        bgEl = null;
      });
  });
}

export function stopAmbient() {
  running = false;
  window.clearTimeout(duckTimer);
  if (bgEl) {
    const el = bgEl;
    bgEl = null;
    fadeTo(el, 0, 700, () => {
      el.pause();
      el.src = "";
    });
  }
}

/** Duck the music down while something important sings, then lift it back. */
export function duckAmbient(seconds: number) {
  if (!bgEl) return;
  const el = bgEl;
  window.clearTimeout(duckTimer);
  fadeTo(el, 0.05, 700);
  duckTimer = window.setTimeout(() => {
    if (bgEl === el) fadeTo(el, FULL_VOLUME, 1800);
  }, seconds * 1000);
}
