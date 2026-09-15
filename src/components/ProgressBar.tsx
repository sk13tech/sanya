import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";

const THUMB_PX = 46;

export default function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPercent = useRef(-1);

  const thumbTop = useTransform(
    scrollYProgress,
    (value) => `calc(${value * 100}% - ${value * THUMB_PX}px)`
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // Keep accessibility metadata current without re-rendering React
    // on every animation frame.
    const percent = Math.round(value * 100);
    if (percent !== lastPercent.current) {
      lastPercent.current = percent;
      trackRef.current?.setAttribute("aria-valuenow", String(percent));
    }
  });

  const scrollFromPointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const available = Math.max(1, rect.height - THUMB_PX);
    const value = Math.min(
      1,
      Math.max(0, (clientY - rect.top - THUMB_PX / 2) / available)
    );
    const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: value * limit, behavior: "auto" });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollFromPointer(event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) scrollFromPointer(event.clientY);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const page = window.innerHeight * 0.82;
    const small = Math.max(80, window.innerHeight * 0.12);
    const actions: Record<string, number> = {
      ArrowDown: small,
      ArrowUp: -small,
      PageDown: page,
      PageUp: -page,
    };

    if (event.key in actions) {
      event.preventDefault();
      window.scrollBy({ top: actions[event.key], behavior: "smooth" });
    } else if (event.key === "Home") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (event.key === "End") {
      event.preventDefault();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-label="Page scroll"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="fixed left-[max(7px,env(safe-area-inset-left))] top-1/2 z-[80] h-[58vh] w-3 -translate-y-1/2 touch-none rounded-full outline-none focus-visible:ring-1 focus-visible:ring-gold/70"
    >
      <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rounded-full bg-white/10" />
      <motion.span
        className="pointer-events-none absolute left-1/2 h-[46px] w-[5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-gold-soft via-gold to-gold-deep shadow-[0_0_14px_rgba(230,195,122,0.45)]"
        style={{ top: thumbTop }}
      />
    </div>
  );
}
