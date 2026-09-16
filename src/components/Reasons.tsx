import { motion } from "framer-motion";
import { EASE, Eyebrow, FadeUp, Words } from "./Reveal";
import { HER_NAME } from "../config";
import { cn } from "../utils/cn";

const REASONS = [
  "The way your smile shows up a second before you do",
  "How you laugh at your own jokes before the punchline",
  "The glow in your eyes when you talk about your dreams",
  "Your Confidence , grab any attention",
  "The way you treat me sometime",
  "The way you Think for me ",
  "How you remember every tiny detail about the people you love",
  "Talent You have to do all rounder practise.",
  "The warmth of your hand tangled up in mine",
  "How you turn the most ordinary day into a story",
  "Your dreams — big enough to scare you, chased anyway",
  "The memories spend in 2024, ",
  "Your Style of presenting yourself",
  "How you believe in me louder than my own doubts",
  "Your voice — my favorite sound in any room",
  "The way strangers leave you feeling like old friends",
  "Your stubborn, beautiful hope that things will work out",
  "The way your name became my favorite word in any language",
  "How forever suddenly sounds too short with you",
  "Simply, endlessly, wonderfully — you",
];

export default function Reasons() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-36 sm:py-48">
      <Eyebrow>they said pick just three — about {HER_NAME}</Eyebrow>
      <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
        <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-stone-100 sm:text-6xl">
          <Words text={`20 reasons, ${HER_NAME}`} />
          <br />
          <Words text="I like you most." delay={0.2} />
        </h2>
        <FadeUp delay={0.35} className="pb-2 font-display text-2xl italic text-gold sm:text-3xl">
          — a trailer, really.
        </FadeUp>
      </div>

      <div className="mt-20 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason, i) => {
          const isLast = i === REASONS.length - 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6%" }}
              transition={{ duration: 0.85, delay: (i % 3) * 0.09, ease: EASE }}
              className={cn(
                "group flex gap-5 border-t border-white/10 py-7",
                isLast && "border-gold/40 bg-gold/[0.04] px-5 rounded-b-2xl"
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-display text-lg italic",
                  isLast ? "text-gold" : "text-gold/45"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                className={cn(
                  "text-[15px] leading-relaxed transition-colors duration-300",
                  isLast
                    ? "font-medium text-stone-100"
                    : "text-stone-400 group-hover:text-stone-200"
                )}
              >
                {reason}
              </p>
            </motion.div>
          );
        })}
      </div>

      <FadeUp delay={0.1} className="mt-16 text-center">
        <p className="font-display text-2xl italic text-stone-400 sm:text-3xl">
          …and about <span className="gold-shimmer">eight million more</span> where those came from.
        </p>
      </FadeUp>
    </section>
  );
}
