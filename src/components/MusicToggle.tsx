import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";
import { isAmbientPlaying, startAmbient, stopAmbient } from "../audio/ambient";

function Bars() {
  return (
    <div className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gold"
          animate={{ height: [4, 12, 6, 14, 4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Small floating control for the site-wide background music. */
export default function MusicToggle({ active }: { active: boolean }) {
  const [on, setOn] = useState(false);
  const [muted, setMuted] = useState(false);

  // start the music as soon as the journey begins
  useEffect(() => {
    if (!active || muted) return;
    startAmbient();
    setOn(true);
  }, [active, muted]);

  useEffect(() => () => stopAmbient(), []);

  const toggle = () => {
    if (isAmbientPlaying()) {
      stopAmbient();
      setOn(false);
      setMuted(true);
    } else {
      setMuted(false);
      startAmbient();
      setOn(true);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      data-no-hearts
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="group fixed bottom-5 left-5 z-[80] flex items-center gap-3 sm:bottom-7 sm:left-7"
    >
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={on ? "Mute background music" : "Play background music"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-ink/70 text-gold shadow-[0_0_30px_rgba(230,195,122,0.16)] backdrop-blur-xl transition-colors hover:bg-gold/15"
      >
        {on ? <Bars /> : muted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Music className="h-4 w-4" strokeWidth={1.5} />}
      </motion.button>
      <span className="pointer-events-none rounded-full border border-white/10 bg-ink/80 px-3.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.3em] text-stone-400 opacity-0 backdrop-blur-xl transition-opacity duration-300 group-hover:opacity-100">
        {on ? "mute" : "play music"}
      </span>
    </motion.div>
  );
}
