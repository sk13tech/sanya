import { motion } from "framer-motion";
import { HER_NAME } from "../config";

const WORDS = [
  "happy birthday",
  HER_NAME,
  "twenty",
  "my favourite person",
  "still my favourite",
  "sunshine",
  "forever",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <motion.div
      className="flex w-max items-center gap-8 will-change-transform"
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
    >
      {items.map((w, i) => (
        <span key={i} className="flex items-center gap-8">
          <span
            className={
              i % 2
                ? "gold-shimmer font-display text-4xl italic sm:text-6xl"
                : "text-4xl font-semibold tracking-tight text-stone-100/15 sm:text-6xl"
            }
          >
            {w}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold/40" />
        </span>
      ))}
    </motion.div>
  );
}

/** A quiet golden ribbon that keeps the page alive between sections. */
export default function Marquee() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-white/[0.06] py-10"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-ink to-transparent" />
      <Row />
      <div className="mt-3">
        <Row reverse />
      </div>
    </section>
  );
}
