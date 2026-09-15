import { useEffect, useState } from "react";
import { PHOTOS } from "../data/photos";

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

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const finish = () => {
      loaded++;
      emit();
      resolve();
    };
    img.onload = finish;
    img.onerror = finish; // a missing photo must not block the site
    img.decoding = "async";
    img.src = url;
  });
}

/** Begins warming every image + font. Safe to call many times. */
export function startPreload() {
  if (started) return;
  started = true;

  const urls = Array.from(
    new Set([
      ...EXTRA_IMAGES,
      ...PHOTOS.map((p) => p.src),
      ...PHOTOS.map((p) => p.fallback),
    ])
  );

  total = urls.length + 1; // +1 for webfonts
  emit();

  const fontsReady: Promise<unknown> =
    typeof document !== "undefined" && "fonts" in document
      ? (document as Document & { fonts: FontFaceSet }).fonts.ready
      : Promise.resolve();

  const fontTask = Promise.resolve(fontsReady).then(() => {
    loaded++;
    emit();
  });

  const everything = Promise.all([fontTask, ...urls.map(loadImage)]);
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
