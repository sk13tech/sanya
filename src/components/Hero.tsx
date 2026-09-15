import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { EASE } from "./Reveal";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 46, filter: "blur(12px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.15, ease: EASE } },
};

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 1.28]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.55], ["blur(0px)", "blur(14px)"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.34]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.12]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={ref} className="relative h-[170vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        {/* Parallax balloon backdrop */}
        <motion.div style={{ scale: bgScale, opacity: bgOpacity }} className="absolute inset-0">
          <img
            src="/images/balloons.jpg"
            alt=""
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/30 to-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(7,5,16,0.8)_100%)]" />
        </motion.div>

        {/* Headline */}
        <motion.div
          style={{ opacity: contentOpacity, scale: contentScale, y: contentY, filter: contentBlur }}
          className="relative z-10 px-6 text-center will-change-transform"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            className="flex flex-col items-center"
          >
            <motion.p
              variants={item}
              className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.5em] text-gold/90 sm:text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              the world got luckier today
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            </motion.p>

            <motion.h1 variants={item} className="mt-10">
              <span className="gold-shimmer block pr-3 font-display text-[clamp(2.6rem,6.5vw,5.5rem)] italic leading-[0.9]">
                Happy
              </span>
              <span className="mt-2 block font-sans text-[clamp(3.4rem,12vw,10.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                <span className="gold-shimmer">20th</span> Birthday
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-10 max-w-xl text-balance text-sm leading-relaxed text-stone-300/85 sm:text-base md:text-lg"
            >
              Dearest Sanya — your laugh rewires bad days and your heart makes
              mine braver. Tonight, the whole sky is celebrating{" "}
              <span className="font-display italic text-blush">you</span>.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 z-10 flex flex-col items-center gap-3"
        >
          <span className="rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gold shadow-[0_0_30px_rgba(230,195,122,0.2)] backdrop-blur-md">
            scroll to celebrate
          </span>
          <div className="h-14 w-px overflow-hidden bg-white/10">
            <motion.div
              className="h-1/2 w-px bg-gradient-to-b from-transparent via-gold to-gold-soft"
              animate={{ y: ["-120%", "240%"] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <ArrowDown className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
        </motion.div>
      </div>
    </section>
  );
}
