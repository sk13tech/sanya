import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Gift, RefreshCw } from "lucide-react";
import { playPop, playSparkle } from "../audio/sfx";
import { HER_NAME } from "../config";
import { EASE, Eyebrow, FadeUp, Words } from "./Reveal";

const NOTES: { note: string; tag: string }[] = [
  { note: "You are the only plan I never want to cancel.", tag: "a truth" },
  { note: "If loving you was a subject, I'd finally be a topper.", tag: "a confession" },
  { note: "Your name is my favourite notification.", tag: "a small thing" },
  { note: "I'd choose you in every lifetime, in every version of this world.", tag: "a promise" },
  { note: "You make ordinary Tuesdays feel like festivals.", tag: "a fact" },
  { note: "Somewhere between hello and forever, you became home.", tag: "a memory" },
  { note: "My favourite sound is you laughing at your own joke.", tag: "a favourite" },
  { note: "You're proof that some people are just made of sunlight.", tag: "an observation" },
  { note: "Even my bad days behave when you text back.", tag: "a secret" },
  { note: "I don't need a wish — you already came true.", tag: "a birthday note" },
  { note: "Twenty looks unfairly good on you.", tag: "a compliment" },
  { note: "You + me = my favourite equation.", tag: "the math" },
];

export default function LoveNotes() {
  const [order, setOrder] = useState(() => NOTES.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [opened, setOpened] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = NOTES[order[pos % order.length]];

  const draw = () => {
    playPop(0.45);
    if (!opened) {
      setOpened(true);
      playSparkle();
    } else {
      setPos((p) => p + 1);
    }
    const r = btnRef.current?.getBoundingClientRect();
    confetti({
      particleCount: 26,
      spread: 62,
      startVelocity: 26,
      scalar: 0.8,
      ticks: 130,
      colors: ["#e6c37a", "#ffb9cd", "#f6e6bf", "#ff7aa5"],
      origin: r
        ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }
        : { y: 0.6 },
    });
  };

  const shuffle = () => {
    playSparkle();
    setOrder((o) => [...o].sort(() => Math.random() - 0.5));
    setPos(0);
  };

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-36 sm:py-48">
      <div className="flex flex-col items-center text-center">
        <Eyebrow center>open one whenever you miss me</Eyebrow>
        <h2 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-stone-100 sm:text-6xl">
          <Words text="A jar of" />{" "}
          <span className="gold-shimmer pr-2 font-display italic">little love notes.</span>
        </h2>
        <FadeUp delay={0.3} className="mt-6 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
          Twelve tiny things I'd tell you out loud, {HER_NAME} — pull one out and
          keep pulling until you smile.
        </FadeUp>
      </div>

      {/* the note card */}
      <FadeUp delay={0.15} className="mt-16 flex flex-col items-center">
        <div className="relative h-64 w-full max-w-md" style={{ perspective: "1200px" }}>
          {/* stacked paper behind */}
          <div className="absolute inset-x-4 top-3 h-full rounded-[26px] border border-white/[0.07] bg-white/[0.02]" />
          <div className="absolute inset-x-2 top-1.5 h-full rounded-[26px] border border-white/[0.09] bg-white/[0.03]" />

          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0, rotateX: -18 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -22, rotateX: 18 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-[26px] border border-gold/30 bg-[radial-gradient(circle_at_50%_25%,rgba(230,195,122,0.14),rgba(12,8,20,0.96))] px-8 text-center"
              >
                <motion.div
                  animate={{ y: [0, -7, 0], rotate: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold"
                >
                  <Gift className="h-6 w-6" strokeWidth={1.5} />
                </motion.div>
                <p className="font-display text-2xl italic text-stone-200">
                  one note, just for you
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-stone-500">
                  tap below to open
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${order[pos % order.length]}-${pos}`}
                initial={{ opacity: 0, y: 26, rotateX: -16 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -26, rotateX: 16 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-[26px] border border-white/12 bg-white/[0.045] px-9 text-center backdrop-blur-xl"
              >
                <span className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gold/10 blur-3xl" />
                <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-gold/80">
                  {current.tag}
                </p>
                <p className="relative text-balance font-display text-2xl italic leading-snug text-stone-100 sm:text-3xl">
                  “{current.note}”
                </p>
                <p className="text-[9px] font-medium uppercase tracking-[0.35em] text-stone-600">
                  note {String((pos % NOTES.length) + 1).padStart(2, "0")} of {NOTES.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <motion.button
            ref={btnRef}
            onClick={draw}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center gap-3 rounded-full border border-gold/45 bg-gold/12 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold/22"
          >
            <span className="absolute inset-0 animate-ping rounded-full border border-gold/35 [animation-duration:2.8s]" />
            <Gift className="h-4 w-4" strokeWidth={1.5} />
            {opened ? "one more" : "open a note"}
          </motion.button>

          {opened && (
            <button
              onClick={shuffle}
              aria-label="Shuffle the notes"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-stone-400 transition-colors hover:border-gold/45 hover:text-gold"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </FadeUp>
    </section>
  );
}
