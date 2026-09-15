import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { TURNING_AGE } from "../config";
import { EASE } from "./Reveal";

const STATS: [number, string][] = [
  [20, "years shining"],
  [240, "months of magic"],
  [7305, "days of you"],
  [175320, "hours adored"],
];

function CountUp({ to, started }: { to: number; started: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const controls = animate(0, to, {
      duration: 2.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [started, to]);
  return <>{val.toLocaleString("en-US")}</>;
}

export default function Eighteen() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, [0, 0.5, 0.88], [2.7, 1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.28], [0, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.42], ["blur(26px)", "blur(0px)"]);
  const ringSpin = useTransform(scrollYProgress, [0, 1], [-40, 200]);
  const subOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.3, 0.45], [26, 0]);
  const statsOpacity = useTransform(scrollYProgress, [0.5, 0.66], [0, 1]);
  const statsY = useTransform(scrollYProgress, [0.5, 0.66], [44, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);

  const [started, setStarted] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.42) setStarted(true);
  });

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
        <motion.p
          style={{ opacity: eyebrowOpacity }}
          className="mb-6 text-[10px] font-medium uppercase tracking-[0.5em] text-gold/80 sm:text-xs"
        >
          two whole decades of wonderful
        </motion.p>

        {/* Ringed 20 */}
        <motion.div
          style={{ scale, opacity, filter: blur }}
          transition={{ ease: EASE }}
          className="relative flex items-center justify-center will-change-transform"
        >
          <motion.svg
            style={{ rotate: ringSpin }}
            className="pointer-events-none absolute h-[64vmin] w-[64vmin]"
            viewBox="0 0 300 300"
          >
            <defs>
              <path
                id="twenty-circle"
                d="M150,150 m-120,0 a120,120 0 1,1 240,0 a120,120 0 1,1 -240,0"
              />
            </defs>
            <text
              className="fill-gold/60"
              style={{ fontSize: 10.5, letterSpacing: "0.52em", textTransform: "uppercase" }}
            >
              <textPath href="#twenty-circle">
                twenty years · one extraordinary soul ·{" "}
              </textPath>
            </text>
          </motion.svg>

          {/* dotted halo */}
          <div className="pointer-events-none absolute h-[50vmin] w-[50vmin] rounded-full border border-dashed border-gold/15" />

          <span className="gold-shimmer select-none text-[clamp(10rem,34vmin,23rem)] font-extrabold leading-none tracking-tighter">
            {TURNING_AGE}
          </span>
        </motion.div>

        <motion.p
          style={{ opacity: subOpacity, y: subY }}
          className="mt-4 pr-2 text-center font-display text-3xl italic text-stone-200 sm:text-4xl"
        >
          twenty years of <span className="gold-shimmer">pure wonder</span>
        </motion.p>

        {/* Count-up stats */}
        <motion.div
          style={{ opacity: statsOpacity, y: statsY }}
          className="mt-10 grid grid-cols-2 gap-x-12 gap-y-6 text-center sm:grid-cols-4"
        >
          {STATS.map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold tracking-tight text-stone-100 sm:text-3xl">
                <CountUp to={value} started={started} />
              </p>
              <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.3em] text-stone-500 sm:text-[10px]">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
