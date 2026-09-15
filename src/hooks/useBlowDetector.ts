import { useEffect, useRef, useState } from "react";

// Detects a short, gentle puff using an adaptive noise floor.
// No hard or sustained blowing is needed.
export function useBlowDetector(active: boolean, onBlow: () => void) {
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const onBlowRef = useRef(onBlow);
  onBlowRef.current = onBlow;

  useEffect(() => {
    if (!active || !supported) return;

    setError(null);

    let raf = 0;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let disposed = false;
    let hotFrames = 0;
    let coolDown = 0;
    let noiseFloor = 0.008;
    let sampleCount = 0;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            // Prevent site music coming through the speaker from looking
            // like a breath while retaining the broadband puff sound.
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true,
          },
        });
      } catch {
        if (!disposed) setError("mic is off or blocked — the button works too");
        return;
      }
      if (disposed) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);

      const buf = new Float32Array(analyser.fftSize);
      const poll = () => {
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);

        // Learn the room's normal volume, then require only a small lift
        // above it. The fixed floor avoids triggering in a silent room.
        if (sampleCount < 24 || rms < noiseFloor * 1.8) {
          noiseFloor = noiseFloor * 0.94 + rms * 0.06;
          sampleCount++;
        }
        const threshold = Math.max(0.026, Math.min(0.065, noiseFloor * 2.35));
        const norm = Math.min(1, Math.max(0, (rms - noiseFloor) / (threshold * 1.8)));
        setLevel((p) => (Math.abs(p - norm) > 0.02 ? norm : p));

        if (coolDown > 0) {
          coolDown--;
        } else if (sampleCount > 10 && rms > threshold) {
          hotFrames++;
          // Roughly 35-50ms: one easy puff is enough.
          if (hotFrames >= 3) {
            hotFrames = 0;
            coolDown = 90;
            onBlowRef.current();
          }
        } else {
          hotFrames = Math.max(0, hotFrames - 2);
        }
        raf = requestAnimationFrame(poll);
      };
      poll();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      audioCtx?.close().catch(() => undefined);
      setLevel(0);
    };
  }, [active, supported]);

  return { level, error, supported };
}
