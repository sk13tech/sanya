import { useEffect, useState } from "react";
import {
  ARTWORK_PHOTOS,
  PHOTO_CANDIDATES,
  type Photo,
} from "../data/photos";

/**
 * Figures out how many photos actually exist in `public/photos/`.
 * The gallery then builds itself from only those — 1 photo or 10,
 * the scroll journey scales to match.
 */

let resolved: Photo[] = ARTWORK_PHOTOS;
let usingArtwork = true;
let done = false;
let running: Promise<Photo[]> | null = null;
const subscribers = new Set<() => void>();

function emit() {
  subscribers.forEach((fn) => fn());
}

/** Resolves true only if the file exists and decodes as a real image. */
function probe(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    img.onload = async () => {
      try {
        await img.decode();
      } catch {
        // `naturalWidth` remains a reliable fallback for older browsers.
      }
      finish(img.naturalWidth > 0);
    };
    img.onerror = () => finish(false);
    img.decoding = "async";
    img.src = url;
    // a stubborn network must never stall the intro
    window.setTimeout(() => finish(false), 8000);
  });
}

/**
 * Probes all 10 slots in parallel.
 * `onStep` fires once per slot so the loading bar can advance.
 */
export function detectPhotos(onStep?: () => void): Promise<Photo[]> {
  if (running) return running;

  running = Promise.all(
    PHOTO_CANDIDATES.map((photo) =>
      probe(photo.src).then((exists) => {
        onStep?.();
        return exists ? photo : null;
      })
    )
  ).then((results) => {
    const found = results.filter((p): p is Photo => p !== null);
    usingArtwork = found.length === 0;
    resolved = usingArtwork ? ARTWORK_PHOTOS : found;
    done = true;
    emit();
    return resolved;
  });

  return running;
}

export function getPhotos(): Photo[] {
  return resolved;
}

/** Live list of the photos that exist. */
export function usePhotos() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((v) => v + 1);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);

  return { photos: resolved, ready: done, usingArtwork };
}
