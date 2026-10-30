import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, Music } from "lucide-react";
import { HER_NAME } from "../config";
import { EASE } from "./Reveal";

/** Birthday reveal moment: October 26, 2026 at 00:00:20 (local time). */
export const UNLOCK_DATE = new Date(2026, 10, 30, 11, 0, 0);
const FLIP_WINDOW = 4000; // ms before midnight when the "almost opening" cue appears

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function useNow(tickMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return now;
}

function DigitCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="gold-shimmer select-none font-display text-[clamp(2.2rem,9vw,4.8rem)] leading-none tabular-nums drop-shadow-[0_0_24px_rgba(230,195,122,0.35)]">
        {value}
      </span>
      <span className="text-[8px] font-semibold uppercase tracking-[0.42em] text-stone-500 sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="gold-shimmer select-none self-start -translate-y-0.5 pb-1 font-display text-[clamp(1.8rem,7vw,4rem)] leading-none text-gold/50">
      :
    </span>
  );
}

export default function CountdownGate({ onUnlock }: { onUnlock: () => void }) {
  const now = useNow();
  const remaining = UNLOCK_DATE.getTime() - now;
  const isUnlocked = remaining <= 0;
  const isFlipping = !isUnlocked && remaining <= FLIP_WINDOW;

  const fired = useRef(false);

  useEffect(() => {
    if (isUnlocked && !fired.current) {
      fired.current = true;
      const t = window.setTimeout(onUnlock, 700);
      return () => window.clearTimeout(t);
    }
  }, [isUnlocked, onUnlock]);

  const seconds = Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <motion.div
      className="relative z-[100] flex min-h-[100svh] flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-14"
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/* ambient gold rings / ORBITING RINGS */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[140vmin] w-[140vmin] rounded-full border border-gold/[0.06]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[90vmin] w-[90vmin] rounded-full border border-dashed border-gold/[0.09]"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,rgba(230,195,122,0.1),transparent_62%)] blur-2xl"
        animate={{ scale: [1, 1.14, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[16vh] flex items-end justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.4, ease: EASE }}
          className="relative"
        >
          {/* golden pool where magic leaks from sealed door */}
          <motion.div
            className="absolute -bottom-5 inset-x-8 h-24 rounded-t-full bg-gradient-to-t from-gold/20 to-transparent blur-2xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* glow columns seeping from the seam */}
          <motion.div
            className="absolute left-[6px] bottom-0 h-36 w-6 bg-gradient-to-t from-gold/40 via-gold/[0.03] to-transparent blur-md"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute right-[6px] bottom-0 h-36 w-6 bg-gradient-to-t from-gold/40 via-gold/[0.03] to-transparent blur-md"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
          />

          {/* arched gold frame */}
          <svg viewBox="0 0 200 260" className="w-[clamp(140px,44vmin,280px)] drop-shadow-[0_12px_48px_rgba(230,195,122,0.18)]">
            <defs>
              <linearGradient id="door-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6e6bf" />
                <stop offset="55%" stopColor="#9a7434" />
                <stop offset="100%" stopColor="#e6c37a" />
              </linearGradient>
              <linearGradient id="interior" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6e6bf" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#e6c37a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M100 20 C140 20 172 60 172 100 L172 260 L28 260 L28 100 C28 60 60 20 100 20 Z"
              fill="none"
              stroke="url(#door-glow)"
              strokeWidth="2.5"
            />
            <path
              d="M100 34 C136 34 164 66 164 100 L164 252 L36 252 L36 100 C36 66 64 34 100 34 Z"
              fill="none"
              stroke="url(#door-glow)"
              strokeWidth="0.9"
              opacity="0.55"
            />
            <path
              d="M100 34 C136 34 164 66 164 100 L164 252 L36 252 L36 100 C36 66 64 34 100 34 Z"
              fill="url(#interior)"
              opacity="0.32"
            />
            <line x1="100" y1="22" x2="100" y2="258" stroke="url(#door-glow)" strokeWidth="0.9" opacity="0.55" />
            <rect x="42" y="100" width="52" height="130" rx="2" fill="none" stroke="url(#door-glow)" strokeWidth="0.9" opacity="0.45" />
            <rect x="105" y="100" width="52" height="130" rx="2" fill="none" stroke="url(#door-glow)" strokeWidth="0.9" opacity="0.45" />
            <rect x="42" y="70" width="52" height="22" rx="2" fill="none" stroke="url(#door-glow)" strokeWidth="0.9" opacity="0.45" />
            <rect x="105" y="70" width="52" height="22" rx="2" fill="none" stroke="url(#door-glow)" strokeWidth="0.9" opacity="0.45" />
          </svg>

          {/* sealed center emblem */}
          <motion.div
            className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.12, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/55 bg-gold/15 shadow-[0_0_24px_rgba(230,195,122,0.42)] backdrop-blur-sm">
              <motion.span
                className="gold-shimmer font-display text-2xl italic"
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.12, 0.9] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                ✦
              </motion.span>
            </div>
          </motion.div>

          {/* sparkles drifting upward */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-gold"
              style={{
                left: `${48 + i * 2}%`,
                top: `${72 - i * 3}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                boxShadow: "0 0 8px rgba(230,195,122,0.7)",
              }}
              animate={{
                y: [0, -32, -64],
                opacity: [0, 1, 0],
                scale: [0.7, 1.2, 0.9],
                x: [0, (i % 2 ? 1 : -1) * 5],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.55,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* content above the golden door */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.5em] text-gold/80 sm:text-[10px]">
          <Clock className="h-3 w-3" strokeWidth={1.7} />
          something beautiful unlocks
          <Clock className="h-3 w-3" strokeWidth={1.7} />
        </p>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-stone-100 sm:text-6xl">
          save <span className="gold-shimmer pr-2 font-display italic">the date</span>
          <span className="block pt-3 pr-2 font-display text-[clamp(2.8rem,11vw,6rem)] italic leading-[0.95] text-stone-50 sm:pt-4">
            October 26, 2026
          </span>
        </h1>

        <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
          a little corner of this universe opens at midnight — with music,
          memories, candles and one letter, waiting just for you
        </p>

        <span className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {!isUnlocked && (
          <div className="mt-12 flex items-start gap-3 sm:gap-5">
            {days > 0 && (
              <>
                <DigitCell value={pad(days)} label="days" />
                <Separator />
              </>
            )}
            <DigitCell value={pad(hours)} label="hours" />
            <Separator />
            <DigitCell value={pad(minutes)} label="minutes" />
            <Separator />
            <DigitCell value={pad(secs)} label="seconds" />
          </div>
        )}

        {isFlipping && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-2 flex items-center gap-2.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-gold/80"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" strokeWidth={1.8} />
            almost opening…
          </motion.p>
        )}

        {!isUnlocked && !isFlipping && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mt-8 text-[9px] font-medium uppercase tracking-[0.32em] text-stone-600 sm:text-[10px]"
          >
            wait for {HER_NAME}'s birthday
          </motion.p>
        )}

        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
            className="mt-12 flex flex-col items-center select-none"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-gold/70 sm:text-[10px]">October 26 · twenty twenty-six</p>
            <h2 className="gold-shimmer mt-4 select-none pr-2 text-center font-display text-[clamp(3rem,12vw,6rem)] italic leading-none">
              happy birthday
            </h2>
            <p className="mt-3 select-none font-display text-4xl italic text-stone-100 sm:text-5xl">{HER_NAME} ✨</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="mt-6 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.32em] text-stone-400 sm:text-[10px]"
            >
              <Music className="h-3.5 w-3.5" strokeWidth={1.7} />
              entering the surprise… 🎶
            </motion.p>
          </motion.div>
        )}

        <div className="mt-12 flex items-center gap-3">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.5em] text-stone-600">
            for {HER_NAME}
          </span>
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>
    </motion.div>
  );
}
