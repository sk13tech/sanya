import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Gift } from "lucide-react";
import { playPop, playSparkle } from "../audio/sfx";
import { HER_NAME, HER_TITLE } from "../config";
import { EASE, Eyebrow, FadeUp } from "./Reveal";

const HINDI_NOTE = `${HER_NAME} (${HER_TITLE}), You don't Know how I think For you ,for your better future. this is not just 20 it's your 20s golden era to achieve something I wish to God to give you all you needed and pull you out from the struggle you are facing . and remember i will always there for you;

export default function LoveNotes() {
  const [opened, setOpened] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openNote = () => {
    if (opened) return;
    setOpened(true);
    playPop(0.45);
    playSparkle();

    const rect = buttonRef.current?.getBoundingClientRect();
    confetti({
      particleCount: 32,
      spread: 68,
      startVelocity: 28,
      scalar: 0.82,
      ticks: 140,
      colors: ["#e6c37a", "#ffb9cd", "#f6e6bf", "#ff7aa5"],
      origin: rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          }
        : { y: 0.6 },
    });
  };

  return (
    <section className="relative mx-auto max-w-5xl px-5 py-36 sm:px-6 sm:py-48">
      <div className="flex flex-col items-center text-center">
        <Eyebrow center>only for {HER_NAME} ✨</Eyebrow>
        <h2 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-stone-100 sm:text-6xl">
          One little{" "}
          <span className="gold-shimmer pr-2 font-display italic">lovely note. 💌</span>
        </h2>
        <FadeUp delay={0.25} className="mt-6 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
          A quiet piece of my heart, written only for you.
        </FadeUp>
      </div>

      <FadeUp delay={0.15} className="mt-16 flex flex-col items-center">
        <div className="relative h-72 w-full max-w-lg" style={{ perspective: "1200px" }}>
          <div className="absolute inset-x-3 top-2 h-full rounded-[26px] border border-white/[0.08] bg-white/[0.025]" />

          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0, rotateX: -15 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -22, rotateX: 16 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-[26px] border border-gold/30 bg-[radial-gradient(circle_at_50%_25%,rgba(230,195,122,0.14),rgba(12,8,20,0.96))] px-7 text-center"
              >
                <motion.div
                  animate={{ y: [0, -7, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold"
                >
                  <Gift className="h-6 w-6" strokeWidth={1.5} />
                </motion.div>
                <p className="text-2xl font-medium text-stone-200">Something just only for you 🫵🏻</p>
                <p className="text-[10px] font-medium tracking-[0.18em] text-stone-500">
                  tap below to open
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="note"
                initial={{ opacity: 0, y: 24, rotateX: -14 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.65, ease: EASE }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[26px] border border-white/12 bg-[#0d0a15]/95 px-7 text-center sm:px-10"
              >
                <span className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gold/10 blur-3xl" />
                <p className="text-[9px] font-medium tracking-[0.22em] text-gold/80">
                  from my heart
                </p>
                <p className="relative text-balance text-lg leading-[1.9] text-stone-100 sm:text-xl">
                  “{HINDI_NOTE}”
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!opened && (
          <motion.button
            ref={buttonRef}
            onClick={openNote}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative mt-10 inline-flex items-center gap-3 rounded-full border border-gold/45 bg-gold/12 px-8 py-4 text-[11px] font-semibold tracking-[0.12em] text-gold transition-colors hover:bg-gold/22"
          >
            <span className="absolute inset-0 animate-ping rounded-full border border-gold/35 [animation-duration:2.8s]" />
            <Gift className="h-4 w-4" strokeWidth={1.5} />
            Open the lovely note
          </motion.button>
        )}
      </FadeUp>
    </section>
  );
}