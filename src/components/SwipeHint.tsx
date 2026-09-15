import { motion } from "framer-motion";
import { Hand } from "lucide-react";
import { cn } from "../utils/cn";

/** A highly visible, animated "swipe" guide badge. */
export default function SwipeHint({
  label = "swipe to turn the page",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-full border border-gold/45 bg-gold/[0.12] px-5 py-2.5 shadow-[0_0_34px_rgba(230,195,122,0.22)] backdrop-blur-md",
        className
      )}
    >
      {/* sweeping shine */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        animate={{ x: ["0%", "420%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
      />
      <motion.span
        className="relative text-gold"
        animate={{ x: [-5, 5, -5], rotate: [-8, 8, -8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Hand className="h-4 w-4" strokeWidth={1.6} />
      </motion.span>
      <span className="relative text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
        {label}
      </span>
    </motion.div>
  );
}
