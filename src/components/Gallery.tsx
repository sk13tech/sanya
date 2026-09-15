import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Heart, MoveDown } from "lucide-react";
import { PHOTOS, type Photo } from "../data/photos";
import { HER_NAME } from "../config";
import { Eyebrow, Words } from "./Reveal";

const TOTAL = PHOTOS.length;
const SPAN = 1 / TOTAL;

/* One crossfading frame.
   PERFORMANCE: only `opacity` and `transform` are animated — both are
   GPU-composited, so the browser never re-paints or re-filters the
   image while scrolling. (An animated CSS blur() here was the lag.) */
function Frame({
  photo,
  index,
  progress,
}: {
  photo: Photo;
  index: number;
  progress: MotionValue<number>;
}) {
  const [src, setSrc] = useState(photo.src);

  const start = index * SPAN;
  const end = start + SPAN;
  const fade = SPAN * 0.4;

  const opacity = useTransform(
    progress,
    [start - fade, start + fade * 0.4, end - fade * 0.4, end + fade],
    index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]
  );

  // slow Ken-Burns drift (transform only)
  const scale = useTransform(progress, [start - fade, end + fade], [1.14, 1.02]);
  const y = useTransform(progress, [start - fade, end + fade], ["2.5%", "-2.5%"]);

  return (
    <motion.div
      style={{
        opacity,
        willChange: "opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      className="absolute inset-0"
    >
      <motion.img
        src={src}
        alt={photo.alt}
        decoding="async"
        draggable={false}
        onError={() => setSrc(photo.fallback)}
        style={{ scale, y, willChange: "transform", backfaceVisibility: "hidden" }}
        className={`absolute inset-0 h-full w-full object-cover ${photo.focal} ${
          photo.mirror ? "-scale-x-100" : ""
        }`}
      />
      <div className={`pointer-events-none absolute inset-0 ${photo.grade}`} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 sm:p-9">
        <p className="font-display text-2xl italic leading-tight text-stone-50 sm:text-4xl">
          {photo.caption}
        </p>
        <Heart
          className="mb-1.5 h-5 w-5 shrink-0 fill-blush text-blush"
          strokeWidth={1.5}
        />
      </div>
    </motion.div>
  );
}

function Dot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [index * SPAN - SPAN * 0.6, index * SPAN + SPAN * 0.4],
    [0.22, 1]
  );
  const scale = useTransform(
    progress,
    [index * SPAN - SPAN * 0.6, index * SPAN + SPAN * 0.4],
    [1, 1.9]
  );
  return (
    <motion.span
      style={{ opacity, scale, willChange: "transform, opacity" }}
      className="h-1.5 w-1.5 rounded-full bg-gold"
    />
  );
}

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef });
  const headOpacity = useTransform(scrollYProgress, [0, 0.04, 0.9, 1], [1, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[280vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0 sm:inset-x-[12vw] sm:inset-y-[6vh] sm:overflow-hidden sm:rounded-[36px] sm:border sm:border-white/10">
          {PHOTOS.map((photo, i) => (
            <Frame key={photo.src} photo={photo} index={i} progress={scrollYProgress} />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,5,16,0.75)_100%)]" />
        </div>

        <motion.div
          style={{ opacity: headOpacity, willChange: "opacity" }}
          className="pointer-events-none absolute inset-x-0 top-[8vh] z-20 px-6 text-center"
        >
          <Eyebrow center>a little strip of us</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-stone-50 sm:text-5xl">
            <Words text="Five frames," />{" "}
            <span className="gold-shimmer pr-2 font-display italic">a thousand memories.</span>
          </h2>
        </motion.div>

        <div className="absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            {PHOTOS.map((photo, i) => (
              <Dot key={photo.src} index={i} progress={scrollYProgress} />
            ))}
          </div>

          <div className="flex items-center gap-2.5 rounded-full border border-gold/40 bg-ink/50 px-5 py-2.5 backdrop-blur-md">
            <motion.span
              className="text-gold"
              animate={{ y: [-2, 3, -2] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <MoveDown className="h-3.5 w-3.5" strokeWidth={1.8} />
            </motion.span>
            <span className="text-[9px] font-bold uppercase tracking-[0.32em] text-gold">
              scroll — {HER_NAME}'s years fade by
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
