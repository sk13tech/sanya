import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Flame,
  Heart,
  Laugh,
  Sparkles,
  Star,
} from "lucide-react";
import { Eyebrow } from "./Reveal";

const WISHES = [
  {
    icon: Compass,
    word: "Adventure",
    text: "May this year carry you to places that steal your breath — and leave you with stories worth telling for a lifetime.",
  },
  {
    icon: Laugh,
    word: "Laughter",
    text: "The loud, uncontrollable kind. The kind that makes your cheeks ache and tears roll before you can stop it.",
  },
  {
    icon: Heart,
    word: "Love",
    text: "A love that feels like coming home — deeper with every passing day. Exactly the kind we already have.",
  },
  {
    icon: Flame,
    word: "Courage",
    text: "To chase every wild dream without looking back, knowing I will always be two steps behind you, cheering.",
  },
  {
    icon: Star,
    word: "Dreams",
    text: "May every wish you whisper to the night sky find its way back to you — arriving twice as bright.",
  },
  {
    icon: Sparkles,
    word: "Magic",
    text: "Because ordinary was never meant for someone as extraordinary as you. Not today, not ever.",
  },
];

export default function Wishes() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0);

  useEffect(() => {
    const measure = () =>
      setRange(trackRef.current ? Math.max(0, trackRef.current.scrollWidth - window.innerWidth) : 0);
    measure();
    const id = setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 32,
    mass: 0.35,
    restDelta: 0.001,
  });
  const x = useTransform(smoothProgress, [0, 1], [0, -range]);

  return (
    <section ref={sectionRef} className="relative h-[340vh]">
      <div className="wishes-screen sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-stretch gap-6 px-[7vw] will-change-transform sm:gap-8">
          {/* Intro cell */}
          <div className="wishes-intro flex min-w-[82vw] flex-col justify-center sm:min-w-[38rem]">
            <Eyebrow>if i could gift you anything</Eyebrow>
            <h2 className="wishes-title mt-7 text-4xl font-semibold leading-[1.02] tracking-tight text-stone-100 sm:mt-8 sm:text-7xl">
              Six wishes,
              <br />
              <span className="gold-shimmer pr-2 font-display italic">wrapped in gold.</span>
            </h2>
            <p className="mt-8 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.4em] text-stone-500 sm:text-xs">
              keep scrolling
              <ArrowRight className="h-4 w-4 text-gold" strokeWidth={1.5} />
            </p>
          </div>

          {/* Wish cards */}
          {WISHES.map((wish, i) => (
            <div
              key={wish.word}
              className="wish-card group relative flex h-[68svh] max-h-[42rem] w-[82vw] shrink-0 flex-col justify-between overflow-y-auto overflow-x-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition-colors duration-500 hover:border-gold/30 sm:w-[26rem] sm:rounded-[2rem] sm:p-10"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl transition-opacity duration-700 group-hover:opacity-100 sm:opacity-60" />
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl italic text-gold/70 sm:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold/25 to-blush/10 ring-1 ring-gold/30">
                  <wish.icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="wish-title text-3xl font-semibold tracking-tight text-stone-100 sm:text-5xl">
                  {wish.word}
                </h3>
                <p className="mt-5 text-sm leading-relaxed text-stone-400 sm:text-[15px]">
                  {wish.text}
                </p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-gold/40 to-transparent" />
                <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.35em] text-stone-600">
                  for your twentieth year
                </p>
              </div>
            </div>
          ))}

          {/* Outro cell */}
          <div className="wishes-outro flex min-w-[78vw] flex-col items-start justify-center sm:min-w-[30rem]">
            <p className="font-display text-4xl italic leading-snug text-stone-300 sm:text-5xl">
              and one lifelong
              <br />
              <span className="gold-shimmer">promise —</span>
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-stone-500">
              to make every single one of them come true, one ordinary,
              extraordinary day at a time.
            </p>
          </div>
        </motion.div>

        {/* progress hairline */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-px w-44 -translate-x-1/2 bg-white/10">
          <motion.div style={{ scaleX: smoothProgress }} className="h-full origin-left bg-gold/80" />
        </div>
      </div>
    </section>
  );
}
