// ─────────────────────────────────────────────────────────────
//  5 SIGNATURE PHOTOS
//
//  Drop your 5 favourite portrait pictures into `public/photos/`
//  named exactly:   photo 1.jpg · photo 2.jpg · … · photo 5.jpg
//  (note the SPACE after "photo"). Each one swaps in instantly.
//
//  Until then, the existing artwork shows automatically, so the
//  gallery is never empty. Edit the captions below to make them
//  yours — they're the words she'll actually read.
// ─────────────────────────────────────────────────────────────

export type Photo = {
  src: string;
  fallback: string;
  caption: string;
  alt: string;
  grade: string;
  mirror: boolean;
  focal: string;
};

type Seed = {
  caption: string;
  fallback: string;
  grade: string;
  focal: string;
  mirror?: boolean;
};

const SEEDS: Seed[] = [
  {
    caption: "Where it all began",
    fallback: "/photos/photo-1.jpg",
    grade: "bg-gradient-to-t from-amber-900/45 via-transparent to-rose-900/20",
    focal: "object-center",
  },
  {
    caption: "That laugh — right here",
    fallback: "/photos/photo-2.jpg",
    grade: "bg-gradient-to-t from-rose-900/45 via-transparent to-indigo-900/25",
    focal: "object-[50%_35%]",
  },
  {
    caption: "The quiet kind of happy",
    fallback: "/photos/photo-3.jpg",
    grade: "bg-gradient-to-br from-indigo-900/40 via-transparent to-amber-800/25",
    focal: "object-center",
  },
  {
    caption: "Rain-proof since day one",
    fallback: "/photos/photo-4.jpg",
    grade: "bg-gradient-to-t from-[#2a1608]/60 via-transparent to-transparent",
    focal: "object-[50%_40%]",
    mirror: true,
  },
  {
    caption: "Home is a person",
    fallback: "/photos/photo-5.jpg",
    grade: "bg-gradient-to-tr from-fuchsia-900/30 via-transparent to-amber-800/25",
    focal: "object-center",
  },
];

export const PHOTOS: Photo[] = SEEDS.map((s, i) => ({
  src: encodeURI(`/photos/photo ${i + 1}.jpg`),
  fallback: s.fallback,
  caption: s.caption,
  alt: s.caption,
  grade: s.grade,
  focal: s.focal,
  mirror: s.mirror ?? false,
}));
