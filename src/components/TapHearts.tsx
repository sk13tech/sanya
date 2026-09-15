import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Burst = { id: number; x: number; y: number };

const GLYPHS = ["♥", "✦", "♡", "✧", "❥"];
const TINTS = ["#ff7aa5", "#e6c37a", "#ffb9cd", "#f6e6bf", "#ffffff"];

/** Anywhere she taps, a tiny burst of hearts floats up. Pure delight. */
export default function TapHearts() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const onTap = (e: PointerEvent) => {
      // let real controls do their job without visual noise
      const el = e.target as HTMLElement | null;
      if (el?.closest("button, a, input, [data-no-hearts]")) return;

      const id = idRef.current++;
      setBursts((b) => [...b.slice(-5), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((x) => x.id !== id));
      }, 1500);
    };
    window.addEventListener("pointerdown", onTap);
    return () => window.removeEventListener("pointerdown", onTap);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[75]">
      <AnimatePresence>
        {bursts.map((b) => (
          <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2 + Math.random();
              const dist = 34 + Math.random() * 46;
              return (
                <motion.span
                  key={i}
                  className="absolute select-none font-bold"
                  style={{
                    color: TINTS[i % TINTS.length],
                    fontSize: 11 + Math.random() * 12,
                    textShadow: "0 0 12px rgba(255,150,190,0.5)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist - 34,
                    opacity: [0, 1, 0],
                    scale: [0.3, 1, 0.6],
                    rotate: Math.random() * 60 - 30,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.25, ease: "easeOut", delay: i * 0.02 }}
                >
                  {GLYPHS[i % GLYPHS.length]}
                </motion.span>
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
