import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown, Mic, Sparkles, Wind } from "lucide-react";
import { useBlowDetector } from "../hooks/useBlowDetector";
import { getMicState, requestMic } from "../audio/micState";
import { playVocalBirthday, stopVocalBirthday } from "../audio/vocalSong";
import { duckAmbient } from "../audio/ambient";
import { playBurst, playGreeting, playPop, playSparkle, playWhoosh } from "../audio/sfx";
import SwipeHint from "./SwipeHint";
import { AUTHOR_NAME, AUTHOR_NICK, HER_NAME } from "../config";
import ChocoIcon from "./ChocoIcon";
import { EASE, Eyebrow, FadeUp } from "./Reveal";

const COLORS = ["#e6c37a", "#f6e6bf", "#ffb9cd", "#ff7aa5", "#ffffff"];

const CANDLE_H = [34, 46, 28, 50, 38, 30, 44, 26, 42, 36, 52, 32, 48, 30, 40, 27, 45, 35, 31, 43];
const CANDLE_COUNT = CANDLE_H.length;

function fireBurst() {
  confetti({
    particleCount: 90,
    spread: 100,
    startVelocity: 42,
    origin: { y: 0.6 },
    colors: COLORS,
    scalar: 1.05,
    ticks: 240,
  });
  [140, 320, 500].forEach((d, k) =>
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: k % 2 ? 120 : 60,
        spread: 70,
        origin: { x: k % 2 ? 1 : 0, y: 0.76 },
        colors: COLORS,
        ticks: 220,
      });
    }, d)
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;
const FIRST_NAME = AUTHOR_NAME.split(" ")[0];

export default function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const greeted = useRef(false);
  const celebrated = useRef(false);
  const autoMicArmed = useRef(false);

  const [lit, setLit] = useState<boolean[]>(() => Array(CANDLE_COUNT).fill(true));
  const [micMode, setMicMode] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [singing, setSinging] = useState(false);
  const litRef = useRef(lit);
  litRef.current = lit;

  const litCount = lit.filter(Boolean).length;
  const allOut = litCount === 0;

  /* A real blow knocks out a random batch — like a real cake. */
  const extinguishBatch = useCallback(() => {
    playWhoosh();
    setLit((prev) => {
      const litIdx = shuffle(prev.map((l, i) => (l ? i : -1)).filter((i) => i >= 0));
      if (!litIdx.length) return prev;
      const count = Math.max(1, Math.ceil(litIdx.length * (0.4 + Math.random() * 0.35)));
      const next = [...prev];
      litIdx.slice(0, count).forEach((i) => (next[i] = false));
      return next;
    });
  }, []);

  const extinguishOne = (i: number) => {
    if (!litRef.current[i]) return;
    playPop(0.3);
    setLit((prev) => {
      const next = [...prev];
      next[i] = false;
      return next;
    });
  };

  const extinguishAll = () => {
    playWhoosh();
    const idxs = shuffle(litRef.current.map((l, i) => (l ? i : -1)).filter((i) => i >= 0));
    const per = Math.max(1, Math.ceil(idxs.length / 3));
    [0, 1, 2].forEach((k) =>
      window.setTimeout(() => {
        setLit((prev) => {
          const next = [...prev];
          idxs.slice(k * per, (k + 1) * per).forEach((i) => (next[i] = false));
          return next;
        });
      }, k * 140)
    );
  };

  const relight = () => {
    celebrated.current = false;
    stopVocalBirthday();
    setSinging(false);
    setLit(Array(CANDLE_COUNT).fill(true));
    playSparkle();
    if (getMicState() === "granted") setMicMode(true);
  };

  const { level, error, supported } = useBlowDetector(micMode && !allOut, extinguishBatch);

  // celebration fires the moment the last flame dies —
  // confetti, then the "Happy Birthday to You" song
  useEffect(() => {
    if (allOut && !celebrated.current) {
      celebrated.current = true;
      setMicMode(false);
      const a = window.setTimeout(() => {
        fireBurst();
        playBurst();
      }, 380);
      const b = window.setTimeout(() => {
        duckAmbient(34); // let the birthday song take the room
        playVocalBirthday(setSinging);
      }, 1300);
      return () => {
        window.clearTimeout(a);
        window.clearTimeout(b);
      };
    }
  }, [allOut]);

  // auto-arm the mic — the intro gate already handled permission
  useEffect(() => {
    if (!inView || allOut || micBlocked || !supported || autoMicArmed.current) return;
    if (getMicState() !== "granted") return;
    autoMicArmed.current = true;
    const id = window.setTimeout(() => setMicMode(true), 900);
    return () => window.clearTimeout(id);
  }, [inView, allOut, micBlocked, supported]);

  useEffect(() => {
    if (error) {
      setMicBlocked(true);
      setMicMode(false);
    }
  }, [error]);

  useEffect(() => {
    if (inView && !greeted.current) {
      greeted.current = true;
      playGreeting();
      confetti({ particleCount: 40, angle: 60, spread: 60, startVelocity: 55, origin: { x: 0, y: 0.7 }, colors: COLORS, ticks: 230 });
      confetti({ particleCount: 40, angle: 120, spread: 60, startVelocity: 55, origin: { x: 1, y: 0.7 }, colors: COLORS, ticks: 230 });
    }
  }, [inView]);

  const enableMicNow = async () => {
    const s = await requestMic();
    if (s === "granted") {
      setMicBlocked(false);
      setMicMode(true);
    }
  };

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
    >
      {/* ambient glow dims as flames die */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(230,195,122,0.1),transparent_65%)] blur-2xl transition-opacity duration-1000"
        style={{ opacity: 0.15 + (litCount / CANDLE_COUNT) * 0.85 }}
      />

      <Eyebrow center>before midnight, one last thing</Eyebrow>

      <div className="relative mt-10 min-h-[10rem] sm:min-h-[12rem]">
        <AnimatePresence mode="wait">
          {!allOut ? (
            <motion.div
              key="wish"
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -26, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <h2 className="text-5xl font-semibold tracking-tight text-stone-100 sm:text-7xl">
                Close your eyes.
              </h2>
              <p className="gold-shimmer mt-3 pr-3 font-display text-6xl italic leading-[1.05] sm:text-8xl">
                make a wish.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="way"
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -26, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <h2 className="text-5xl font-semibold tracking-tight text-stone-100 sm:text-7xl">
                It's on its way
              </h2>
              <p className="gold-shimmer mt-3 pr-3 font-display text-6xl italic leading-[1.05] sm:text-8xl">
                to the stars.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── unmistakable "blow here" pointer ── */}
      <AnimatePresence>
        {!allOut && (
          <motion.div
            key="blow-cue"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.35 } }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="relative z-20 mt-12 flex flex-col items-center"
          >
            <div className="relative flex items-center gap-3 overflow-hidden rounded-full border-2 border-gold/60 bg-gold/15 px-6 py-3 shadow-[0_0_44px_rgba(230,195,122,0.35)] backdrop-blur-md">
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["0%", "440%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
              />
              <motion.span
                className="relative text-gold"
                animate={{ scale: [1, 1.22, 1], rotate: [-8, 8, -8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wind className="h-5 w-5" strokeWidth={2} />
              </motion.span>
              <span className="relative text-[11px] font-extrabold uppercase tracking-[0.3em] text-gold sm:text-xs">
                blow the candles below
              </span>
            </div>

            {/* arrows marching down toward the flames */}
            <div className="mt-2 flex flex-col items-center">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="-mt-1.5 text-gold"
                  animate={{ opacity: [0.15, 1, 0.15], y: [0, 5, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                >
                  <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── the midnight cake ── */}
      <FadeUp y={24} className="mt-2">
        <div className="relative flex flex-col items-center">
          {/* attention halo — a soft pulse ring around the whole cake */}
          {!allOut && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-16 bottom-0 rounded-[48px] border-2 border-gold/25"
              animate={{ opacity: [0, 0.75, 0], scale: [0.97, 1.03, 0.97] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* warm halo behind candles */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,170,80,0.22),transparent_70%)] blur-2xl transition-opacity duration-700"
            style={{ opacity: litCount / CANDLE_COUNT }}
          />

          {/* 20 candles — tappable, breath-reactive flames */}
          <div className="relative z-10 -mb-1.5 flex items-end gap-[7px] sm:gap-2.5">
            {CANDLE_H.map((h, i) => (
              <button
                key={i}
                onClick={() => extinguishOne(i)}
                disabled={!lit[i]}
                aria-label={`Blow out candle ${i + 1}`}
                className="group relative flex cursor-pointer flex-col items-center outline-none disabled:cursor-default"
              >
                <div className="relative flex h-8 w-3.5 items-start justify-center sm:w-4">
                  <div className="h-full w-full">
                    <AnimatePresence>
                      {lit[i] && (
                        <motion.div
                          key="f"
                          className="flame absolute left-1/2 top-0 -translate-x-1/2 transition-transform duration-200 group-hover:scale-90"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0, transition: { duration: 0.22 } }}
                          style={{ animationDuration: `${0.16 + (i % 5) * 0.05}s` }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  {!lit[i] && (
                    <motion.span
                      key="s"
                      className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-stone-400/70 blur-[3px]"
                      initial={{ opacity: 0.65, y: 4, scale: 0.5 }}
                      animate={{ opacity: 0, y: -34, scale: 2.2 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  )}
                </div>
                <div className="h-[3px] w-px bg-stone-600" />
                <div
                  className={`w-[6px] rounded-full ring-1 ring-white/15 transition-shadow duration-500 sm:w-[7px] ${
                    lit[i] ? "shadow-[0_0_20px_rgba(255,158,190,0.18)]" : "opacity-75"
                  }`}
                  style={{
                    height: h,
                    background:
                      i % 3 === 0
                        ? "linear-gradient(to bottom, #f6e6bf, #e6c37a 55%, #b98d45)"
                        : "linear-gradient(to bottom, #ffd9e6, #ff9fbe 55%, #e8709b)",
                  }}
                />
              </button>
            ))}
          </div>

          {/* cake tiers */}
          <div className="relative h-12 w-80 rounded-2xl border border-white/10 bg-gradient-to-b from-[#3d2530] via-[#271822] to-[#150e19] shadow-[inset_0_2px_0_rgba(255,255,255,0.08)]">
            <div className="absolute -top-1.5 inset-x-3 flex justify-between">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="h-3 w-3 rounded-full bg-gradient-to-b from-[#f6e6bf] to-[#d9b46a] shadow-sm" />
              ))}
            </div>
            <div className="absolute inset-x-5 top-1/2 h-px bg-gold/20" />
          </div>
          <div className="relative -mt-1 h-14 w-[23rem] rounded-2xl border border-white/10 bg-gradient-to-b from-[#34202b] via-[#20141d] to-[#120b16] shadow-[inset_0_2px_0_rgba(255,255,255,0.06)] sm:w-[26rem]">
            <div className="absolute -top-1.5 inset-x-4 flex justify-between">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="h-3 w-3 rounded-full bg-gradient-to-b from-[#ffd9e6] to-[#e88bab] shadow-sm" />
              ))}
            </div>
            <div className="absolute inset-x-6 top-1/2 h-px bg-blush/15" />
            {/* golden 20 charm */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-3xl italic text-gold/85 drop-shadow-[0_0_12px_rgba(230,195,122,0.4)]">
              20
            </div>
          </div>
          {/* plate + shadow */}
          <div className="mt-1.5 h-2 w-[25rem] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent sm:w-[29rem]" />
          <div className="mt-1 h-5 w-[24rem] rounded-[100%] bg-black/70 blur-md sm:w-[28rem]" />
        </div>
      </FadeUp>

      {/* flame counter */}
      <AnimatePresence mode="wait">
        <motion.p
          key={allOut ? "out" : litCount < CANDLE_COUNT ? "some" : "all"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-7 text-[10px] font-medium uppercase tracking-[0.35em] text-stone-500"
        >
          {allOut
            ? "all twenty — out in style"
            : litCount < CANDLE_COUNT
              ? `${litCount} of 20 still dancing — blow again!`
              : "20 flames, waiting for you"}
        </motion.p>
      </AnimatePresence>

      {/* controls */}
      {!micMode ? (
        <div className="mt-8 flex flex-col items-center gap-5">
          <motion.button
            onClick={allOut ? relight : extinguishAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center gap-3 rounded-full border border-gold/40 bg-gold/10 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold transition-colors duration-300 hover:bg-gold/20"
          >
            {!allOut && (
              <span className="absolute inset-0 animate-ping rounded-full border border-gold/40 [animation-duration:2.4s]" />
            )}
            {allOut ? (
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Wind className="h-4 w-4" strokeWidth={1.5} />
            )}
            {allOut ? "Relight the magic" : "Blow them all out"}
          </motion.button>

          {!allOut && supported && !micBlocked && getMicState() !== "granted" && (
            <button
              onClick={enableMicNow}
              className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-500 transition-colors duration-300 hover:text-gold"
            >
              <Mic className="h-3.5 w-3.5" strokeWidth={1.5} />
              or blow for real — use your mic
            </button>
          )}
          {micBlocked && (
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-500">
              mic unavailable — tap the flames or the button
            </p>
          )}
          {!allOut && <SwipeHint label="tap a flame to blow it out" className="mt-1" />}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-5"
        >
          {/* live breath meter */}
          <motion.div
            className="relative h-24 w-24"
            animate={{ scale: 1 + level * 0.14 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r={RING_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="40"
                cy="40"
                r={RING_R}
                fill="none"
                stroke={level > 0.55 ? "#ffb9cd" : "#e6c37a"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - Math.min(level, 1))}
                style={{ transition: "stroke-dashoffset 90ms linear, stroke 300ms" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Mic className={`h-6 w-6 ${error ? "text-stone-600" : "text-gold"}`} strokeWidth={1.5} />
            </div>
          </motion.div>

          <p className="max-w-xs text-balance text-[11px] font-medium uppercase leading-relaxed tracking-[0.28em] text-stone-400">
            {level > 0.55
              ? "nearly there — one big breath"
              : "take a deep breath & blow at the cake"}
          </p>

          <button
            onClick={() => setMicMode(false)}
            className="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-600 underline-offset-4 transition-colors hover:text-gold hover:underline"
          >
            or use the button instead
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {allOut && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="mt-12 max-w-lg"
          >
            <p className="text-balance text-sm leading-relaxed text-stone-400 sm:text-base">
              Whatever you just wished for — I'll spend this whole year helping
              it come true.{" "}
              <span className="font-display text-base italic text-stone-200 sm:text-lg">
                Happy 20th birthday, {HER_NAME}.
              </span>
            </p>
            {singing && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 flex w-fit items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold"
              >
                <span className="flex h-4 items-end gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[3px] rounded-full bg-gold"
                      animate={{ height: [4, 13, 6, 15, 4] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </span>
                happy birthday to you
              </motion.p>
            )}
            <p className="mt-6 font-display text-2xl italic text-gold sm:text-3xl">
              — always, {FIRST_NAME}
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-400">
              your {AUTHOR_NICK}
              <ChocoIcon className="h-3.5 w-3.5 text-gold" />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
