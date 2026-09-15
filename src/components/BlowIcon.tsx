import { motion } from "framer-motion";

/**
 * An original little side-profile face with a puffed cheek, blowing
 * a stream of air. `strength` (0–1) makes the puff grow with her breath.
 */
export default function BlowIcon({
  className,
  strength = 0,
  animated = true,
}: {
  className?: string;
  strength?: number;
  animated?: boolean;
}) {
  const s = Math.min(1, Math.max(0, strength));

  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* head — simple round profile facing right */}
      <path
        d="M20.5 6.2c-6.1 0-11 4.8-11 10.8 0 3 1.2 5.7 3.2 7.7 1 1 1.5 2.3 1.5 3.6v3.4a1.8 1.8 0 0 0 1.8 1.8h7.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* back of the head / hair line */}
      <path
        d="M9.6 15.4c.7-4.4 4.2-7.8 8.6-8.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* eye — closed with effort */}
      <path
        d="M16.6 15.6c.9-.9 2.2-.9 3.1 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* puffed cheek — swells with breath strength */}
      <motion.circle
        cx="25.4"
        cy="19.6"
        r="4.5"
        fill="currentColor"
        opacity="0.18"
        animate={
          animated
            ? { r: [4.3, 5.2 + s * 1.2, 4.3], opacity: [0.16, 0.3, 0.16] }
            : { r: 4.5 + s }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M22 16.2c2.6-.5 4.8 1 5.2 3.4.4 2.4-1.2 4.4-3.6 4.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        animate={animated ? { pathLength: [0.9, 1, 0.9] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* pursed lips */}
      <circle cx="28.2" cy="21.4" r="1.6" fill="currentColor" />

      {/* the breath — three curling streams */}
      {[
        { d: "M31.5 18.4c3.6-.8 6.6.2 8.2 2", delay: 0, w: 2 },
        { d: "M31.8 21.6c4.8-.6 8.6.4 11 2.2", delay: 0.22, w: 1.7 },
        { d: "M31.4 24.6c3.4-.2 6 .7 7.6 2.3", delay: 0.44, w: 1.4 },
      ].map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          stroke="currentColor"
          strokeWidth={p.w}
          strokeLinecap="round"
          fill="none"
          initial={false}
          animate={
            animated
              ? {
                  opacity: [0, 0.45 + s * 0.55, 0],
                  x: [0, 4 + s * 5, 9 + s * 8],
                }
              : { opacity: 0.5 }
          }
          transition={{
            duration: 1.25,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}
