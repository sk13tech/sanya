import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, Eyebrow, FadeUp, Words } from "./Reveal";
import { cn } from "../utils/cn";

function ParallaxCard({
  src,
  alt,
  index,
  title,
  accent,
  className,
  ratio,
}: {
  src: string;
  alt: string;
  index: string;
  title: string;
  accent: string;
  className?: string;
  ratio: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-11%", "11%"]);

  return (
    <div className={className}>
      <motion.div
        ref={ref}
        initial={{ clipPath: "inset(10% 10% 10% 10% round 28px)", opacity: 0, y: 70 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.2, ease: EASE }}
        className={cn("group relative overflow-hidden rounded-[28px]", ratio)}
      >
        <motion.img
          src={src}
          alt={alt}
          style={{ y }}
          className="absolute inset-0 h-full w-full scale-[1.28] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.34]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-ink/40 font-display text-sm italic text-gold backdrop-blur-md sm:left-6 sm:top-6">
          {index}
        </div>
      </motion.div>

      <FadeUp delay={0.15} className="mt-6 flex items-baseline gap-3">
        <h3 className="text-2xl font-semibold tracking-tight text-stone-100 sm:text-3xl">
          {title}
        </h3>
        <span className="font-display text-2xl italic text-gold sm:text-3xl">{accent}</span>
      </FadeUp>
    </div>
  );
}

export default function Moments() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-36 sm:py-48">
      <Eyebrow>if i could pause time</Eyebrow>
      <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-stone-100 sm:text-6xl">
        <Words text="I'd live inside" />
        <FadeUp delay={0.25} className="gold-shimmer pr-2 font-display italic">
          these moments forever.
        </FadeUp>
      </h2>
      <FadeUp delay={0.35} className="mt-6 max-w-md text-sm leading-relaxed text-stone-400 sm:text-base">
        Three little frames of the universe you carry with you — the spark, the
        softness, and the sweetest reason to celebrate.
      </FadeUp>

      <div className="mt-24 grid grid-cols-12 gap-x-4 gap-y-16 md:gap-x-8">
        <ParallaxCard
          src="/images/sparkler.jpg"
          alt="A golden sparkler lighting up the night"
          index="01"
          title="The spark"
          accent="you carry into every room"
          ratio="aspect-[4/5]"
          className="col-span-12 sm:col-span-10 md:col-span-7"
        />
        <ParallaxCard
          src="/images/roses.jpg"
          alt="A bouquet of blush roses on dark velvet"
          index="02"
          title="The softness"
          accent="in everything you touch"
          ratio="aspect-[3/4]"
          className="col-span-10 col-start-3 sm:col-span-7 sm:col-start-6 md:col-span-4 md:col-start-9 md:mt-[28%]"
        />
        <div className="col-span-12 flex justify-center md:col-span-8 md:col-start-3">
          <FadeUp className="mt-6 text-center md:mt-16">
            <p className="text-balance font-display text-3xl italic leading-snug text-stone-300 sm:text-4xl">
              “Some people make the world brighter just by being in it.
              <span className="gold-shimmer"> You are the proof.”</span>
            </p>
          </FadeUp>
        </div>
        <ParallaxCard
          src="/images/cake.jpg"
          alt="An elegant birthday cake with glowing golden candles"
          index="03"
          title="The sweetness"
          accent="of simply being you"
          ratio="aspect-[16/11]"
          className="col-span-12 sm:col-span-10 sm:col-start-2 md:col-span-8 md:col-start-3"
        />
      </div>
    </section>
  );
}
