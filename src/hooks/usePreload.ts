import { useEffect, useState } from "react";
import { ARTWORK_PHOTOS, MAX_PHOTOS } from "../data/photos";
import { detectPhotos } from "./usePhotos";

// Everything the experience needs before it should begin.
const EXTRA_IMAGES = [
  "/images/balloons.jpg",
  "/images/cake.jpg",
  "/images/sparkler.jpg",
  "/images/roses.jpg",
];

// Never let a stubborn asset hold the party up.
const SAFETY_MS = 12000;

let started = false;
let total = 0;
let loaded = 0;
let done = false;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((fn) => fn());
}

function step() {
  loaded++;
  emit();
}

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      step();
      resolve();
    };
    img.onload = async () => {
      try {
        await img.decode();
      } catch {
        // A successful load can still reject decode in older browsers.
      }
      finish();
    };
    img.onerror = finish; // a missing image must not block the site
    img.decoding = "async";
    img.src = url;
  });
}

/** Begins warming every image + font. Safe to call many times. */
export function startPreload() {
  if (started) return;
  started = true;

  const fallbackUrls = Array.from(
    new Set(ARTWORK_PHOTOS.map((photo) => photo.src))
  );

  // section artwork + gallery fallbacks + webfonts + one probe per slot
  total = EXTRA_IMAGES.length + fallbackUrls.length + 1 + MAX_PHOTOS;
  emit();

  const fontsReady: Promise<unknown> =
    typeof document !== "undefined" && "fonts" in document
      ? (document as Document & { fonts: FontFaceSet }).fonts.ready
      : Promise.resolve();

  const fontTask = Promise.resolve(fontsReady).then(step);

  // Detecting a photo also downloads it, so found photos arrive warm.
  const photoTask = detectPhotos(step);

  const everything = Promise.all([
    fontTask,
    photoTask,
    ...EXTRA_IMAGES.map(loadImage),
    ...fallbackUrls.map(loadImage),
  ]);
  const safety = new Promise<void>((r) => window.setTimeout(r, SAFETY_MS));

  Promise.race([everything, safety]).then(() => {
    done = true;
    loaded = total;
    emit();
  });
}

/** Live preloading progress for the loading bar. */
export function usePreload() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((v) => v + 1);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);

  const progress = total > 0 ? Math.min(1, loaded / total) : 0;
  return {
    progress,
    ready: done || (total > 0 && progress >= 1),
    loaded: Math.min(loaded, total),
    total,
  };
}
