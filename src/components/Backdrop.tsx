import { useEffect, useRef } from "react";

const PARTICLE_COLORS = ["#f4d9a0", "#e6c37a", "#ffc9d9", "#ffffff"];

function makeSprite(hex: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, hex + "ff");
  g.addColorStop(0.4, hex + "77");
  g.addColorStop(1, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return c;
}

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    const sprites = PARTICLE_COLORS.map(makeSprite);
    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: {
      x: number; y: number; r: number; vy: number;
      drift: number; phase: number; tw: number; base: number;
      sprite: HTMLCanvasElement;
    }[] = [];
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1 : 1.35);
    const frameInterval = 1000 / (isCoarse ? 30 : 45);

    const spawn = (w: number, h: number) => {
      const count = Math.min(52, Math.floor((w * h) / 38000));
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.4 + Math.random() * 6.5,
          vy: 0.12 + Math.random() * 0.45,
          drift: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          tw: 0.4 + Math.random() * 1.1,
          base: 0.12 + Math.random() * 0.4,
          sprite: sprites[Math.floor(Math.random() * sprites.length)],
        });
      }
      for (let i = 0; i < 3; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 26 + Math.random() * 42,
          vy: 0.05 + Math.random() * 0.12,
          drift: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          tw: 0.2 + Math.random() * 0.4,
          base: 0.03 + Math.random() * 0.05,
          sprite: sprites[Math.floor(Math.random() * sprites.length)],
        });
      }
      return arr;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = spawn(width, height);
    };

    resize();
    let resizeRaf = 0;
    const requestResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };
    window.addEventListener("resize", requestResize, { passive: true });

    let t = 0;
    let lastFrame = 0;
    const tick = (now: number) => {
      if (document.hidden) {
        raf = 0;
        return;
      }
      if (now - lastFrame < frameInterval) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const delta = Math.min(2, (now - lastFrame) / 16.67 || 1);
      lastFrame = now;
      t += 0.016 * delta;
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy * delta;
        p.x += Math.sin(t * 0.6 + p.drift) * 0.18 * delta;
        if (p.y < -p.r * 2) { p.y = height + p.r * 2; p.x = Math.random() * width; }
        const alpha = p.base * (0.55 + 0.45 * Math.sin(t * p.tw + p.phase));
        if (alpha <= 0.01) continue;
        ctx!.globalAlpha = alpha;
        ctx!.drawImage(p.sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!document.hidden && !raf && !reduceMotion) {
        raf = requestAnimationFrame(tick);
      }
    };
    const onVisibility = () => start();

    if (reduceMotion) {
      // Draw one static frame instead of running a permanent animation loop.
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.globalAlpha = p.base;
        ctx.drawImage(p.sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    } else {
      start();
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", requestResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0" />;
}

export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Particles />
      <div className="absolute -top-40 right-[-15%] h-[60vh] w-[60vh] animate-pulse-soft rounded-full bg-[radial-gradient(circle,rgba(255,185,205,0.09),transparent_65%)] blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-12%] h-[70vh] w-[70vh] animate-pulse-soft rounded-full bg-[radial-gradient(circle,rgba(230,195,122,0.1),transparent_65%)] blur-3xl [animation-delay:1.8s]" />
    </div>
  );
}
