import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, ShieldCheck, Sparkles } from "lucide-react";
import { micSupported, requestMic, setMicState } from "../audio/micState";
import { usePreload } from "../hooks/usePreload";
import { EASE } from "./Reveal";

export default function IntroGate({ onFinish }: { onFinish: () => void }) {
  const [working, setWorking] = useState(false);
  const supported = micSupported();
  const { progress, ready } = usePreload();

  useEffect(() => {
    if (!supported) onFinish();
  }, [supported, onFinish]);

  const allow = async () => {
    if (working) return;
    setWorking(true);
    await requestMic();
    setWorking(false);
    onFinish();
  };

  const skip = () => {
    setMicState("skipped");
    onFinish();
  };

  return (
    <motion.div
      className="intro-gate fixed inset-0 z-[95] flex items-start justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-ink px-[max(1rem,env(safe-area-inset-left))]"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {/* ambient glows */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(230,195,122,0.1),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(255,185,205,0.08),transparent_65%)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: EASE }}
        className="intro-gate-content relative flex min-h-full w-full max-w-md flex-col items-center justify-center py-[max(1.25rem,env(safe-area-inset-top))] text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="intro-gate-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-[0_0_50px_rgba(230,195,122,0.25)]"
        >
          <Mic className="h-6 w-6" strokeWidth={1.5} />
        </motion.div>

        <p className="intro-gate-eyebrow mt-8 flex items-center justify-center gap-2 text-balance text-[10px] font-medium uppercase tracking-[0.42em] text-gold/80">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          one tiny thing before the magic
        </p>

        <h2 className="intro-gate-title mt-6 text-4xl font-semibold tracking-tight text-stone-100 sm:text-5xl">
          May I borrow
          <span className="gold-shimmer block pr-2 font-display text-5xl italic leading-[1.1] sm:text-6xl">
            your breath?
          </span>
        </h2>

        <p className="intro-gate-copy mt-6 max-w-sm text-balance text-sm leading-relaxed text-stone-400">
          At the end of this little journey, twenty candles will be waiting for
          you — and just 2–3 light blows will put them out{" "}
          <span className="font-display italic text-stone-200">for real</span>.
          Never hard or deep. Your mic only listens for gentle breaths.
        </p>

        <div className="intro-gate-privacy mt-8 flex items-center justify-center gap-2 text-balance text-[9px] font-medium uppercase tracking-[0.25em] text-stone-600">
          <ShieldCheck className="h-3.5 w-3.5 text-gold/60" strokeWidth={1.5} />
          nothing recorded · nothing leaves your device
        </div>

        <button
          onClick={allow}
          disabled={working}
          className="intro-gate-allow group relative mt-10 inline-flex max-w-full items-center justify-center gap-3 rounded-full border border-gold/50 bg-gold/15 px-7 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-gold transition-all duration-300 hover:bg-gold/25 disabled:opacity-70 sm:px-9 sm:text-[11px] sm:tracking-[0.32em]"
        >
          <span className="absolute inset-0 animate-ping rounded-full border border-gold/40 [animation-duration:2.4s]" />
          {working ? (
            <motion.span
              className="h-4 w-4 rounded-full border-2 border-gold/30 border-t-gold"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <Mic className="h-4 w-4" strokeWidth={1.5} />
          )}
          {working ? "unlocking…" : "Allow my microphone"}
        </button>

        <button
          onClick={skip}
          className="mt-5 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-600 transition-colors duration-300 hover:text-stone-300"
        >
          maybe later — take me in
        </button>

        {/* quietly warming everything in the background */}
        <div className="intro-gate-progress mt-10 w-52 max-w-full">
          <div className="h-px w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-soft"
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2.5 text-[8px] font-medium uppercase tracking-[0.35em] text-stone-600">
            {ready ? "the night is ready for you" : "preparing your surprise…"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
