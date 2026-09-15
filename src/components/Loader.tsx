import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE } from "./Reveal";
import { TURNING_AGE, HER_NAME } from "../config";
import { usePreload } from "../hooks/usePreload";
import { playCountFinish, playTick } from "../audio/sfx";

const SPARK_COLORS = ["#e6c37a", "#f6e6bf", "#ffb9cd", "#ffffff"];

type Spark = { x: number; y: number; s: number; d: number; c: string; tail: boolean };

function useSparks(tick: number, finale: boolean): Spark[] {
  return useMemo(() => {
    const count = finale ? 26 : 11;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.7;
      const radius = (finale ? 150 : 100) + Math.random() * 70;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.78,
        s: 0.7 + Math.random() * 0.9,
        d: Math.random() * 0.12,
        c: SPARK_COLORS[i % SPARK_COLORS.length],
        tail: Math.random() > 0.55,
      };
    });
  }, [tick, finale]);
}

export default function Loader({ onDone }: { onDone: () => void }) {
  const { progress, ready, loaded, total } = usePreload();
  const [n, setN] = useState(1);

  const counted = n >= TURNING_AGE;
  const finale = counted && ready;
  const sparks = useSparks(n, finale);
  const percent = Math.round(progress * 100);

  // a soft tick for every year counted, rising in pitch toward twenty
  useEffect(() => {
    if (n >= TURNING_AGE) {
      playCountFinish();
      return;
    }
    playTick((n - 1) / (TURNING_AGE - 1));
  }, [n]);

  // the number climbs in step with real loading progress
  useEffect(() => {
    const cap = ready ? TURNING_AGE : Math.max(1, Math.floor(progress * TURNING_AGE));
    if (n >= cap) return;
    const t = window.setTimeout(() => setN((v) => Math.min(v + 1, cap)), 95);
    return () => window.clearTimeout(t);
  }, [n, progress, ready]);

  // only enter the site once every asset is warm
  useEffect(() => {
    if (!finale) return;
    const t = window.setTimeout(onDone, 950);
    return () => window.clearTimeout(t);
  }, [finale, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-ink px-4"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="loader-content relative flex w-full flex-col items-center justify-center">
      {/* breathing aurora */}
      <motion.div
        aria-hidden
        className="absolute h-[62vmin] w-[62vmin] rounded-full bg-[radial-gradient(circle,rgba(230,195,122,0.16),rgba(255,185,205,0.06)_45%,transparent_70%)] blur-3xl"
        animate={{ scale: 1 + progress * 0.35, opacity: 0.35 + progress * 0.65 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative text-[10px] font-medium uppercase tracking-[0.55em] text-gold/70"
      >
counting {HER_NAME}'s years
      </motion.p>

      {/* ── magic counter ── */}
      <div className="loader-orbit relative mt-4 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        <div className="slow-rot pointer-events-none absolute inset-0 rounded-full border border-dashed border-gold/20" />
        <div
          className="slow-rot pointer-events-none absolute inset-5 rounded-full border border-blush/15"
          style={{ animationDirection: "reverse", animationDuration: "11s" }}
        />
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gold/50 shadow-[0_0_8px_rgba(230,195,122,0.8)]"
              style={{ left: "50%", top: "50%", transform: `rotate(${i * 45}deg) translateY(-8rem)` }}
            />
          ))}
        </div>

        {/* circular loading ring tied to real progress */}
        <svg className="pointer-events-none absolute inset-3 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#loadgrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - progress) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="loadgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9a7434" />
              <stop offset="50%" stopColor="#e6c37a" />
              <stop offset="100%" stopColor="#f6e6bf" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          key={`ring-${n}`}
          aria-hidden
          className="pointer-events-none absolute inset-8 rounded-full border border-gold/50"
          initial={{ scale: 0.75, opacity: 0.8 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: finale ? 1.1 : 0.75, ease: "easeOut" }}
        />

        {sparks.map((s, i) => (
          <motion.span
            key={`${n}-${i}`}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: s.tail ? 3 : 5,
              height: s.tail ? 9 : 5,
              background: s.c,
              boxShadow: `0 0 10px 2px ${s.c}55`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{
              x: s.x,
              y: s.y,
              opacity: [0, 1, 0],
              scale: [0.2, s.s, 0],
              rotate: 90,
            }}
            transition={{ duration: finale ? 1.25 : 0.85, delay: s.d, ease: "easeOut" }}
          />
        ))}

        <div className="absolute flex h-32 items-center justify-center">
          <motion.span
            key={n}
            initial={{ y: 46, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="loader-number gold-shimmer block font-display text-[7.5rem] leading-none drop-shadow-[0_0_28px_rgba(230,195,122,0.35)]"
          >
            {n}
          </motion.span>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: finale ? 1 : 0.5 }}
        transition={{ duration: 0.5 }}
        className="relative mt-2 pr-1 font-display text-2xl italic text-stone-300"
      >
        {finale
          ? `two decades of ${HER_NAME} — softly, magic`
          : `years of wonderful ${HER_NAME}`}
      </motion.p>

      {/* ── real loading bar ── */}
      <div className="loader-progress relative mt-9 w-60 max-w-full sm:w-72">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft shadow-[0_0_14px_rgba(230,195,122,0.6)]"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.3em] text-stone-500">
          <span className="flex items-center gap-1.5">
            {ready ? (
              <>
                <Check className="h-3 w-3 text-gold" strokeWidth={2.5} />
                <span className="text-gold">everything's ready</span>
              </>
            ) : (
              <motion.span
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                gathering memories…
              </motion.span>
            )}
          </span>
          <span className="tabular-nums text-stone-400">{percent}%</span>
        </div>

        <p className="mt-1.5 text-center text-[8px] font-medium uppercase tracking-[0.3em] text-stone-700">
          {loaded} / {total} pieces of {HER_NAME}'s night
        </p>
      </div>
      </div>
    </motion.div>
  );
}
