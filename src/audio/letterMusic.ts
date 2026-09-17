// Third track: starts when Sanya opens the greeting card.
// Add `public/letter-music.mp3`. It loops softly while she reads.

const LETTER_TRACK = "/letter-music.mp3";
const LETTER_VOLUME = 0.48;

let current: HTMLAudioElement | null = null;
let fadeFrame = 0;

function fadeIn(audio: HTMLAudioElement) {
  cancelAnimationFrame(fadeFrame);
  const startedAt = performance.now();
  const duration = 1800;

  const frame = (now: number) => {
    if (current !== audio) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    audio.volume = LETTER_VOLUME * (1 - Math.pow(1 - progress, 3));
    if (progress < 1) fadeFrame = requestAnimationFrame(frame);
  };

  fadeFrame = requestAnimationFrame(frame);
}

/**
 * Starts directly from the card-opening click, preserving browser audio
 * permission. Missing files fail silently and never affect the card.
 */
export function playLetterMusic() {
  stopLetterMusic();

  const audio = new Audio(LETTER_TRACK);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  current = audio;

  audio.play()
    .then(() => fadeIn(audio))
    .catch(() => {
      if (current === audio) current = null;
    });
}

export function stopLetterMusic() {
  cancelAnimationFrame(fadeFrame);
  if (!current) return;
  const audio = current;
  current = null;
  audio.pause();
  audio.src = "";
}