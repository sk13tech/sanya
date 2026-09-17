// ── THE BIRTHDAY SONG ──────────────────────────────────────
// File-only. Plays ONCE, the moment the last candle goes out.
//
// Drop your file into `public/` as one of:
//   happy-birthday.mp3 · .m4a · .ogg · .wav
//
// TIP: record yourself singing it — by far the most romantic option.
// If no file exists, the celebration simply plays without a song.

const CANDIDATES = [
  "/happy-birthday.mp3",
  "/happy-birthday.m4a",
  "/happy-birthday.ogg",
  "/happy-birthday.wav",
];

let current: HTMLAudioElement | null = null;
let playbackListener: ((playing: boolean) => void) | null = null;

/** Quickly check whether a real audio file exists (never hangs). */
async function findRecording(): Promise<string | null> {
  for (const url of CANDIDATES) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
      window.clearTimeout(t);
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && !type.includes("text/html")) return url;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

export function playVocalBirthday(onState: (playing: boolean) => void) {
  stopVocalBirthday();
  playbackListener = onState;

  findRecording().then((url) => {
    if (!url) {
      onState(false);
      playbackListener = null;
      return;
    }
    const el = new Audio(url);
    el.volume = 0.9;
    el.addEventListener("playing", () => onState(true), { once: true });
    el.addEventListener(
      "ended",
      () => {
        if (current === el) current = null;
        onState(false);
        playbackListener = null;
      },
      { once: true }
    );
    el.addEventListener(
      "error",
      () => {
        if (current === el) current = null;
        onState(false);
        playbackListener = null;
      },
      { once: true }
    );
    current = el;
    el.play().catch(() => {
      current = null;
      onState(false);
      playbackListener = null;
    });
  });
}

export function stopVocalBirthday() {
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
  playbackListener?.(false);
  playbackListener = null;
}
