import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { AUTHOR_NAME, AUTHOR_NICK } from "../config";
import ChocoIcon from "./ChocoIcon";
import { EASE } from "./Reveal";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: EASE }}
        className="flex flex-col items-center"
      >
        <div className="flex h-12 w-12 animate-pulse-soft items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
          <Heart className="h-5 w-5 fill-gold text-gold" strokeWidth={1.5} />
        </div>

        <p className="mt-8 max-w-md text-balance font-display text-2xl italic leading-snug text-stone-300 sm:text-3xl">
          Crafted with every heartbeat — for the girl who holds them all.
        </p>

        <div className="mt-12 flex items-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-stone-500">
            made with love &amp; care
          </p>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        <p className="gold-shimmer mt-4 font-display text-3xl italic sm:text-4xl">
          by {AUTHOR_NAME}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
          your {AUTHOR_NICK}
          <ChocoIcon className="h-3 w-3 text-gold/70" />
        </p>

        <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.45em] text-stone-600">
          twenty &amp; forever
        </p>
      </motion.div>
    </footer>
  );
}
