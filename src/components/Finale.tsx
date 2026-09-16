import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown, Wind } from "lucide-react";
import { useBlowDetector } from "../hooks/useBlowDetector";
import { getMicState, requestMic } from "../audio/micState";
import { playVocalBirthday } from "../audio/vocalSong";
import { stopAmbient } from "../audio/ambient";
import { playBurst, playGreeting, playPop, playWhoosh } from "../audio/sfx";
import SwipeHint from "./SwipeHint";
import BlowIcon from "./BlowIcon";
import { AUTHOR_NAME, AUTHOR_NICK, HER_NAME } from "../config";
import { EASE, Eyebrow, FadeUp } from "./Reveal";

const COLORS = ["#e6c37a", "#f6e6bf", "#ffb9cd", "#ff7aa5", "#ffffff"];

const CANDLE_H = [34, 46, 28, 50, 38, 30, 44, 26, 42, 36, 52, 32, 48, 30, 40, 27, 45, 35, 31, 43];
const CANDLE_COUNT = CANDLE_H.length;

/** Two gentle puffs always clear the whole cake. */
const MAX_BLOWS = 2;

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
  const blowNumber = useRef(0);
  const blowBusy = useRef(false);

  const litCount = lit.filter(Boolean).length;
  const allOut = litCount === 0;

  /* Exactly two gentle puffs clear the cake: the first takes roughly
     half the flames, the second always finishes the rest. `blowBusy`
     stops one continuous breath from counting as both. */
  const extinguishBatch = useCallback(() => {
    if (blowBusy.current) return;

    const litIdx = shuffle(
      litRef.current.map((isLit, i) => (isLit ? i : -1)).filter((i) => i >= 0)
    );
    if (!litIdx.length) return;

    blowBusy.current = true;
    const blow = blowNumber.current + 1;
    blowNumber.current = blow;
    playWhoosh();

    // first puff → half the candles, second puff → everything left
    const count =
      blow >= MAX_BLOWS ? litIdx.length : Math.ceil(litIdx.length / 2);
    const chosen = litIdx.slice(0, count);

    const perWave = Math.max(1, Math.ceil(chosen.length / 3));
    [0, 1, 2].forEach((wave) => {
      window.setTimeout(() => {
        setLit((prev) => {
          const next = [...prev];
          chosen
            .slice(wave * perWave, (wave + 1) * perWave)
            .forEach((i) => (next[i] = false));
          return next;
        });
      }, 50 + wave * 100);
    });

    // brief lock so the tail of the same breath can't trigger blow two
    window.setTimeout(() => {
      blowBusy.current = false;
    }, 900);
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
    if (blowBusy.current) return;
    blowNumber.current = MAX_BLOWS;
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

  // the cake owns the room — silence the background music entirely
  useEffect(() => {
    if (inView) stopAmbient();
  }, [inView]);

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
      className="finale-section relative flex min-h-[100svh] flex-col items-center justify-center overflow-x-clip px-3 py-24 text-center sm:px-6 sm:py-32"
    >
      {/* ambient glow dims as flames die */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(230,195,122,0.1),transparent_65%)] blur-2xl transition-opacity duration-1000"
        style={{ opacity: 0.15 + (litCount / CANDLE_COUNT) * 0.85 }}
      />

      <Eyebrow center>before midnight, {HER_NAME} — one last thing</Eyebrow>

      <div className="finale-heading relative mt-8 min-h-[9rem] sm:mt-10 sm:min-h-[12rem]">
        <AnimatePresence mode="wait">
          {!allOut ? (
            <motion.div
              key="wish"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <h2 className="finale-title text-4xl font-semibold tracking-tight text-stone-100 sm:text-7xl">
                Close your eyes.
              </h2>
              <p className="finale-script gold-shimmer mt-3 pr-3 font-display text-5xl italic leading-[1.05] sm:text-8xl">
                make a wish.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="way"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <h2 className="finale-title text-4xl font-semibold tracking-tight text-stone-100 sm:text-7xl">
                It's on its way
              </h2>
              <p className="finale-script gold-shimmer mt-3 pr-3 font-display text-5xl italic leading-[1.05] sm:text-8xl">
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
            className="blow-cue relative z-20 mt-8 flex flex-col items-center sm:mt-12"
          >
            <div className="relative flex max-w-[calc(100vw-1.5rem)] items-center justify-center gap-2.5 overflow-hidden rounded-full border-2 border-gold/60 bg-gold/15 px-4 py-3 shadow-[0_0_44px_rgba(230,195,122,0.35)] backdrop-blur-md sm:gap-3 sm:px-6">
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
              <span className="relative text-balance text-[9px] font-extrabold uppercase tracking-[0.2em] text-gold sm:text-xs sm:tracking-[0.3em]">
              blows Your cake below
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
        <div className="cake-scene relative flex w-full flex-col items-center">
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

          {/* Two staggered rows keep all 20 candles planted on the top tier. */}
          <div className="cake-candles relative z-10 -mb-3 h-[6.5rem] w-[min(16rem,82vw)] sm:w-72">
            {CANDLE_H.map((h, i) => {
              const row = i < 10 ? 0 : 1;
              const column = i % 10;
              const left = row === 0 ? 7 + column * (86 / 9) : 10 + column * (80 / 9);

              return (
              <button
                key={i}
                onClick={() => extinguishOne(i)}
                disabled={!lit[i]}
                aria-label={`Blow out candle ${i + 1}`}
                className="group absolute flex cursor-pointer flex-col items-center outline-none disabled:cursor-default"
                style={{
                  left: `${left}%`,
                  bottom: row === 0 ? 8 : -2,
                  zIndex: row === 0 ? 10 + column : 30 + column,
                  transform: `translateX(-50%) scale(${row === 0 ? 0.86 : 1})`,
                  transformOrigin: "bottom center",
                }}
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
                <span className="absolute -bottom-1 h-2 w-3 rounded-[50%] bg-black/25 blur-[1px]" />
              </button>
              );
            })}
          </div>

          {/* ── TOP TIER ── */}
          <div className="relative h-16 w-[min(16rem,82vw)] rounded-b-[14px] rounded-t-[10px] border border-white/10 bg-[linear-gradient(175deg,#4a2e3c_0%,#32202c_38%,#20141d_100%)] shadow-[inset_0_3px_0_rgba(255,255,255,0.1),inset_0_-10px_22px_rgba(0,0,0,0.5)] sm:w-72">
            {/* elliptical top surface makes the candle placement believable */}
            <div className="pointer-events-none absolute -top-3 inset-x-1.5 h-6 rounded-[50%] border border-white/15 bg-[radial-gradient(ellipse_at_50%_28%,#fff8e8_0%,#ead09a_48%,#ba8d4f_100%)] shadow-[inset_0_-5px_8px_rgba(111,68,34,0.25),0_3px_10px_rgba(0,0,0,0.3)]" />
            {/* glossy frosting cap with drips */}
            <div className="absolute -top-1 inset-x-0 h-7">
              <svg viewBox="0 0 300 40" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="icing1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff6e2" />
                    <stop offset="55%" stopColor="#f3dcae" />
                    <stop offset="100%" stopColor="#dcb974" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#icing1)"
                  d="M0,10 Q0,2 10,2 L290,2 Q300,2 300,10 L300,18
                     q-10,14 -20,0 q-12,18 -24,2 q-10,13 -21,0
                     q-13,17 -25,1 q-11,14 -22,0 q-12,16 -24,1
                     q-10,13 -21,0 q-13,15 -25,0 q-11,13 -22,1
                     q-12,15 -24,0 q-10,12 -20,-1 Z"
                />
              </svg>
            </div>
            {/* sprinkles */}
            <div className="absolute inset-x-6 top-7 flex justify-between">
              {Array.from({ length: 11 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-[3px] rounded-full"
                  style={{
                    background: ["#ffd9e6", "#e6c37a", "#ff9fbe", "#f6e6bf"][i % 4],
                    transform: `rotate(${(i * 37) % 90 - 45}deg)`,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            {/* piped pearl border */}
            <div className="absolute inset-x-2 bottom-1 flex justify-between">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff3d8,#d9b46a)] shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                />
              ))}
            </div>
          </div>

          {/* ── BOTTOM TIER ── */}
          <div className="relative -mt-[3px] h-[4.5rem] w-[min(22rem,94vw)] rounded-b-[16px] rounded-t-[10px] border border-white/10 bg-[linear-gradient(175deg,#43293a_0%,#2b1a27_40%,#17101b_100%)] shadow-[inset_0_3px_0_rgba(255,255,255,0.08),inset_0_-12px_26px_rgba(0,0,0,0.55)] sm:w-[26rem]">
            {/* rose frosting cap with drips */}
            <div className="absolute -top-1 inset-x-0 h-8">
              <svg viewBox="0 0 400 44" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="icing2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffeaf1" />
                    <stop offset="55%" stopColor="#ffc3d7" />
                    <stop offset="100%" stopColor="#ef8fb1" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#icing2)"
                  d="M0,10 Q0,2 10,2 L390,2 Q400,2 400,10 L400,20
                     q-12,16 -24,1 q-14,20 -28,2 q-12,15 -24,0
                     q-15,19 -29,1 q-13,16 -25,0 q-14,18 -28,1
                     q-12,15 -24,0 q-15,17 -29,0 q-13,15 -25,1
                     q-14,17 -28,0 q-12,14 -24,-1 q-13,16 -26,0 Z"
                />
              </svg>
            </div>
            {/* sprinkles */}
            <div className="absolute inset-x-8 top-8 flex justify-between">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-[3px] rounded-full"
                  style={{
                    background: ["#e6c37a", "#fff3d8", "#ffb9cd", "#ff9fbe"][i % 4],
                    transform: `rotate(${(i * 53) % 90 - 45}deg)`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            {/* golden 20 charm */}
            <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2">
              <span className="gold-shimmer font-display text-4xl italic leading-none drop-shadow-[0_0_16px_rgba(230,195,122,0.55)]">
                20
              </span>
            </div>

            {/* piped pearl border */}
            <div className="absolute inset-x-2 bottom-1 flex justify-between">
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe7f0,#e88bab)] shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                />
              ))}
            </div>
          </div>

          {/* ── CAKE STAND ── */}
          <div className="relative -mt-[2px] h-2.5 w-[min(24rem,98vw)] rounded-full bg-[linear-gradient(to_bottom,#f6e6bf,#c9a561_60%,#8a6b34)] shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:w-[28rem]" />
          <div className="h-5 w-10 bg-[linear-gradient(to_right,#8a6b34,#e0c489_45%,#8a6b34)]" />
          <div className="h-1.5 w-28 rounded-full bg-[linear-gradient(to_right,#8a6b34,#f0dca9_50%,#8a6b34)]" />
          {/* reflection + shadow */}
          <div className="mt-1 h-6 w-[min(22rem,92vw)] rounded-[100%] bg-black/75 blur-lg sm:w-[26rem]" />
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
              ? "almost there — one more gentle blow"
              : `20 flames, waiting for ${HER_NAME}`}
        </motion.p>
      </AnimatePresence>

      {/* controls */}
      {!micMode ? (
        <div className="mt-8 flex flex-col items-center gap-5">
          {!allOut && (
            <motion.button
              onClick={extinguishAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex items-center gap-3 rounded-full border border-gold/40 bg-gold/10 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold transition-colors duration-300 hover:bg-gold/20"
            >
              <span className="absolute inset-0 animate-ping rounded-full border border-gold/40 [animation-duration:2.4s]" />
              <Wind className="h-4 w-4" strokeWidth={1.5} />
              Blow them all out
            </motion.button>
          )}

          {!allOut && supported && !micBlocked && getMicState() !== "granted" && (
            <button
              onClick={enableMicNow}
              className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-500 transition-colors duration-300 hover:text-gold"
            >
              <BlowIcon className="h-4 w-4" animated={false} />
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
              <BlowIcon
                className={`h-10 w-10 ${error ? "text-stone-600" : "text-gold"}`}
                strength={level}
                animated={!error}
              />
            </div>
          </motion.div>

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
                Happy 20th birthday, {HER_NAME}. 🎂
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
                happy birthday to you 🎶
              </motion.p>
            )}
            <p className="mt-6 font-display text-2xl italic text-gold sm:text-3xl">
              — always, {FIRST_NAME}
            </p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-400">
              your {AUTHOR_NICK} 🍫
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
