import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Mail, Sparkles } from "lucide-react";
import { playPop, playSparkle } from "../audio/sfx";
import { AUTHOR_NAME, AUTHOR_NICK, HER_NAME } from "../config";
import { EASE, Eyebrow } from "./Reveal";

const FIRST_NAME = AUTHOR_NAME.split(" ")[0];

const LINES = [
  `Kabhi-kabhi sochta hoon… agar 2024 mein tum meri life mein na aati, toh shayad mujhe kabhi pata hi nahi chalta ki kisi ek insaan ka khayal bhi kisi ki poori duniya ko itna badal sakta hai.`,
  `Tumhe maine pehli baar kab pasand kiya tha, woh shayad mujhe exactly yaad na ho…
Lekin itna zaroor yaad hai ki tumhe pasand karna kab ek simple feeling se meri sabse beautiful feeling ban gaya, mujhe khud pata nahi chala.`,
  `2024 se lekar aaj tak waqt kitna badal gaya…
bahut kuch badla, log badle, situations badli…
lekin tumhare liye mere dil mein jo jagah hai, woh nahi badli.`,
  `Kabhi-kabhi bina kisi reason ke tumhara khayal aa jaata hai.
Tumhari smile yaad aati hai, tumhari baatein yaad aati hain…
aur pata nahi kyun, mere face par bhi ek smile aa jaati hai.`,
  `Tumse baat karna mere liye sirf conversation nahi hai.
Kabhi-kabhi tumhare ek simple se “hello” mein bhi woh sukoon milta hai jo poore din mein kahin aur nahi milta.`,
  `Main tumse koi perfect love story ka promise nahi karna chahta. Life perfect nahi hoti, hum bhi perfect nahi honge. Kabhi arguments honge, kabhi misunderstandings hongi, kabhi difficult days bhi aayenge…`,
  `Lekin agar kabhi tum mujhe apni life mein jagah do, toh main ek cheez zaroor chahta hoon—`,
  `Tumhare difficult days mein tumhe akela feel na hone doon.
Tumhari smile ko protect karne ki wajah banu.
Aur jab duniya tumhe samajhne mein fail ho jaaye, tab tumhe ek aisa insaan mil sake jo tumhe bina judge kiye sun sake. ❤️`,
  `Main chahta hoon ki tum meri best friend, meri comfort, meri favourite person bano.`,
  `Jiske saath main bina filter ke khud reh sakun.
Jiske saath stupid baaton par has sakun.
Jiske saath silence bhi awkward na lage.
Aur jiske saath future ke chhote-chhote dreams dekhna bhi beautiful lage.`,
  `Sach bolun?--------
mujhe tumhe samajhna hai.
Tumhari care karni hai.
Tumhari respect karni hai.
Tumhare saath grow karna hai.
Aur har din tumhe choose karna hai. `,
  `Mujhe nahi pata tumhare dil mein mere liye kya hai.
Shayad kuch hai… shayad kuch nahi hai.`,
  `Aur main tumse koi zabardasti ka answer nahi chahta.`,
  `Kyunki jo feeling mere andar 2024 mein shuru hui thi, woh waqt ke saath khatam nahi hui…
Aur agar kabhi tumhare dil mein bhi mere liye thodi si jagah ho…`,
  `toh main chahta hoon ki hum ek beautiful beginning karein.`,
  `Koi jaldi nahi.
Koi pressure nahi.
Bas tum aur main… aur ek genuine chance. ❤️`,
  `Aur haan…`,
  `Agar tum kabhi mujhse poochogi ki
“Tum mujhe itna kyun chahte ho?”`,
  `Toh shayad mere paas koi perfect answer nahi hoga.`,
  `Main bas itna kahunga—`,
  `“Pata nahi…
bas tum ho.
Aur mere dil ko tum hi achhi lagti ho.”`,
];

/** Layout position in the document, unaffected by in-flight transforms. */
function documentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export default function GreetingCard() {
  const ref = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { amount: 0.35, once: true });
  const [open, setOpen] = useState(false);

  /* Once the card has actually mounted, bring "Dear Sanya," to the
     centre of the screen — then she can simply scroll on to read it. */
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let tries = 0;

    const centreGreeting = () => {
      const el = greetingRef.current;
      if (el) {
        const offset = Math.max(0, (window.innerHeight - el.offsetHeight) / 2);
        const top = documentTop(el) - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        return;
      }
      if (tries++ < 150) raf = requestAnimationFrame(centreGreeting);
    };

    raf = requestAnimationFrame(centreGreeting);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const openCard = () => {
    if (open) return;
    setOpen(true);
    playPop(0.5);
    window.setTimeout(playSparkle, 260);
    window.setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 88,
        startVelocity: 34,
        scalar: 0.95,
        ticks: 200,
        origin: { y: 0.55 },
        colors: ["#e6c37a", "#f6e6bf", "#ffb9cd", "#ff7aa5", "#ffffff"],
      });
    }, 420);
  };

  return (
    <section
      ref={ref}
      className="greeting-section relative flex min-h-[100svh] scroll-mt-0 flex-col items-center justify-center overflow-x-clip px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* warm glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[75vmin] w-[95vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(230,195,122,0.1),rgba(255,185,205,0.05)_45%,transparent_70%)] blur-3xl" />

      <Eyebrow center>one last envelope for {HER_NAME}(ANUSHKA)</Eyebrow>

      <motion.h2
        initial={{ opacity: 0, y: 26 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: EASE }}
        className="greeting-title relative mt-7 text-center text-4xl font-semibold leading-[1.05] tracking-tight text-stone-100 sm:text-6xl"
      >
        A letter I'd rather
        <span className="gold-shimmer block pr-2 font-display text-5xl italic leading-[1.1] sm:text-7xl">
          hand you in person.
        </span>
      </motion.h2>

      {/* ── envelope / card ── */}
      <div className="greeting-card-wrap relative mt-12 w-full max-w-2xl sm:mt-16" style={{ perspective: "1800px" }}>
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="env"
              onClick={openCard}
              initial={{ opacity: 0, y: 40, rotateX: -14 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.85, ease: EASE }}
              whileHover={{ y: -8, rotateX: 4 }}
              className="group relative block w-full cursor-pointer"
              aria-label="Open the birthday card"
            >
              {/* envelope body */}
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#241726] via-[#180f1e] to-[#0e0914] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
                {/* flap */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 border-b border-gold/20 bg-gradient-to-br from-[#2d1d2f] to-[#1a1020]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
                <div className="absolute inset-x-0 top-0 h-1/2" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,195,122,0.14),transparent_60%)]" />
                </div>

                {/* wax seal */}
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-[radial-gradient(circle_at_35%_30%,#c9506f,#8d2444)] shadow-[0_0_40px_rgba(255,122,165,0.35)]"
                >
                  <Heart className="h-7 w-7 fill-gold/90 text-gold" strokeWidth={1.2} />
                </motion.div>

                {/* addressed to */}
                <div className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-1.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-stone-500">
                    to
                  </p>
                  <p className="gold-shimmer pr-1 font-display text-4xl italic leading-none sm:text-5xl">
                    {HER_NAME}
                  </p>
                </div>

                <span className="pointer-events-none absolute inset-3 rounded-2xl border border-dashed border-gold/15" />
              </div>

              {/* prompt */}
              <div className="mt-8 flex justify-center">
                <span className="relative flex items-center gap-2.5 overflow-hidden rounded-full border border-gold/45 bg-gold/[0.12] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.32em] text-gold shadow-[0_0_34px_rgba(230,195,122,0.22)] backdrop-blur-md">
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ["0%", "420%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                  />
                  <Mail className="relative h-4 w-4" strokeWidth={1.6} />
                  <span className="relative">tap to open your card</span>
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.article
              key="card"
              initial={{ opacity: 0, rotateX: -55, y: 50, scale: 0.94 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              transition={{ duration: 1.05, ease: EASE }}
              style={{ transformOrigin: "top center" }}
              className="relative overflow-hidden rounded-[24px] border border-gold/25 bg-[#0d0a15] bg-[linear-gradient(160deg,rgba(255,252,244,0.055),rgba(255,255,255,0.02))] p-6 shadow-[0_50px_120px_-35px_rgba(0,0,0,0.95)] sm:rounded-[30px] sm:p-14"
            >
              {/* paper ornament */}
              <span className="pointer-events-none absolute inset-4 rounded-[22px] border border-dashed border-gold/15" />
              <span className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blush/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-gold/40" />
                  <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.4} />
                  <span className="h-px w-10 bg-gold/40" />
                </div>

                <motion.p
                  ref={greetingRef}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
                  className="mt-8 pr-1 text-center font-display text-4xl italic leading-tight text-stone-100 sm:text-5xl"
                >
                  Dear {HER_NAME},
                </motion.p>

                <div className="mx-auto mt-8 max-w-xl space-y-6">
                  {LINES.map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 + i * 0.35, duration: 0.95, ease: EASE }}
                      className="text-[15px] leading-[1.85] text-stone-300/90 sm:text-base"
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.9, ease: EASE }}
                  className="mt-12 flex flex-col items-center"
                >
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                  <p className="mt-6 text-[9px] font-medium uppercase tracking-[0.45em] text-stone-500">
                    happy 20th birthday
                  </p>
                  <p className="gold-shimmer mt-4 pr-2 font-display text-5xl italic leading-none sm:text-6xl">
                    {HER_NAME}
                  </p>

                  <p className="mt-9 font-display text-2xl italic text-stone-300">
                    — always yours, {FIRST_NAME}
                  </p>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-500">
                    your {AUTHOR_NICK} 🍫
                  </p>

                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-8"
                  >
                    <Heart className="h-5 w-5 fill-rose text-rose" strokeWidth={1.4} />
                  </motion.div>
                </motion.div>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
