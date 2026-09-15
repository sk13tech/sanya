// ─────────────────────────────────────────────────────────────
//  YOUR PHOTOS — 1 to 10, however many you add
//
//  Drop portrait pictures into `public/photos/` named exactly:
//      photo 1.jpg · photo 2.jpg · … · photo 10.jpg
//  (note the SPACE after the word "photo")
//
//  The site checks which of these actually exist and builds the
//  gallery from only those — add 3 photos and she scrolls 3,
//  add all 10 and she scrolls 10. Nothing else to change.
//
//  If none are added yet, the bundled artwork shows instead so
//  the gallery is never empty.
// ─────────────────────────────────────────────────────────────

export const MAX_PHOTOS = 10;

export type Photo = {
  src: string;
  fallback: string;
  caption: string;
  alt: string;
  grade: string;
  mirror: boolean;
  focal: string;
};

/** Bundled artwork used when a slot has no photo of your own. */
const ARTWORK = [
  "/photos/photo-1.jpg",
  "/photos/photo-2.jpg",
  "/photos/photo-3.jpg",
  "/photos/photo-4.jpg",
  "/photos/photo-5.jpg",
];

/** Caption shown under each photo — edit these freely. */
const CAPTIONS = [
  "Where it all began",
  "That laugh — right here",
  "The quiet kind of happy",
  "Rain-proof since day one",
  "Home is a person",
  "Golden hour, golden you",
  "Every ordinary day, made bright",
  "The way you look at the world",
  "My favourite kind of trouble",
  "Still my favourite view",
];

/** Cinematic colour grades so no two frames feel alike. */
const GRADES = [
  "bg-gradient-to-t from-amber-900/45 via-transparent to-rose-900/20",
  "bg-gradient-to-t from-rose-900/45 via-transparent to-indigo-900/25",
  "bg-gradient-to-br from-indigo-900/40 via-transparent to-amber-800/25",
  "bg-gradient-to-t from-[#2a1608]/60 via-transparent to-transparent",
  "bg-gradient-to-tr from-fuchsia-900/30 via-transparent to-amber-800/25",
  "bg-gradient-to-t from-rose-900/40 via-transparent to-amber-900/20",
];

const FOCALS = [
  "object-center",
  "object-[50%_35%]",
  "object-center",
  "object-[50%_40%]",
  "object-center",
  "object-[50%_30%]",
];

/** Public path for the nth user photo (0-based). */
export function photoPath(index: number): string {
  return encodeURI(`/photos/photo ${index + 1}.jpg`);
}

function make(index: number, src: string): Photo {
  return {
    src,
    fallback: ARTWORK[index % ARTWORK.length],
    caption: CAPTIONS[index % CAPTIONS.length],
    alt: CAPTIONS[index % CAPTIONS.length],
    grade: GRADES[index % GRADES.length],
    focal: FOCALS[index % FOCALS.length],
    mirror: index % 4 === 3,
  };
}

/** The 10 slots the site will look for on disk. */
export const PHOTO_CANDIDATES: Photo[] = Array.from(
  { length: MAX_PHOTOS },
  (_, i) => make(i, photoPath(i))
);

/** Shown only when you haven't added any photos of your own yet. */
export const ARTWORK_PHOTOS: Photo[] = ARTWORK.map((src, i) => make(i, src));
