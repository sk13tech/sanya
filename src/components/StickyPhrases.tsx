import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { HER_NAME } from "../config";

type Phrase = {
  main: string;
  accent: string;
  ghost: string;
};

const PHRASES: Phrase[] = [
  {
    main: "Twenty years ago, the world didn't just change —",
    accent: "it got you.",
    ghost: "01",
  },
  {
    main: "Since then, every ordinary day has carried a little of",
    accent: "your magic.",
    ghost: "02",
  },
  {
    main: "Tonight the candles flicker and the sky holds its breath —",
    accent: `happy 20th, ${HER_NAME}.`,
    ghost: "03",
  },
];

const RANGES: number[][] = [
  [0.03, 0.15, 0.3, 0.4],
  [0.37, 0.48, 0.6, 0.7],
  [0.67, 0.78, 0.94, 1],
];

function PhraseView({
  progress,
  range,
  hold,
  phrase,
}: {
  progress: MotionValue<number>;
  range: number[];
  hold?: boolean;
  phrase: Phrase;
}) {
  const [s0, s1, e0, e1] = range;
  const out = hold ? 1 : 0;
  const opacity = useTransform(progress, [s0, s1, e0, e1], [0, 1, 1, out]);
  const y = useTransform(progress, [s0, s1, e0, e1], [56, 0, 0, hold ? 0 : -56]);
  return (
    <motion.div
      style={{ opacity, y, willChange: "transform, opacity" }}
      className="phrase-screen absolute inset-0 flex flex-col items-center justify-center px-5 text-center sm:px-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-sans text-[clamp(16rem,42vw,32rem)] font-extrabold leading-none tracking-tighter text-white/[0.028]"
      >
        {phrase.ghost}
      </span>
      <p className="phrase-main relative max-w-4xl text-balance text-3xl font-semibold leading-[1.18] tracking-tight text-stone-100 sm:text-5xl md:text-6xl">
        {phrase.main}
      </p>
      <p className="phrase-accent gold-shimmer relative mt-5 pr-2 font-display text-4xl italic leading-[1.1] sm:text-6xl md:text-7xl">
        {phrase.accent}
      </p>
    </motion.div>
  );
}

export default function StickyPhrases() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 125,
    damping: 31,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <section ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {PHRASES.map((p, i) => (
          <PhraseView
            key={p.ghost}
            progress={smoothProgress}
            range={RANGES[i]}
            hold={i === PHRASES.length - 1}
            phrase={p}
          />
        ))}
      </div>
    </section>
  );
}
