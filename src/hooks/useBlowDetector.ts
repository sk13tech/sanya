import { useEffect, useRef, useState } from "react";

// Detects a real "blow" into the microphone using sustained RMS energy.
// Works entirely in the browser via the Web Audio API.
export function useBlowDetector(active: boolean, onBlow: () => void) {
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const onBlowRef = useRef(onBlow);
  onBlowRef.current = onBlow;

  useEffect(() => {
    if (!active || !supported) return;

    let raf = 0;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let disposed = false;
    let hotFrames = 0;
    let coolDown = 0;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
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
        const norm = Math.min(1, rms * 5.5);
        setLevel((p) => (Math.abs(p - norm) > 0.02 ? norm : p));

        if (coolDown > 0) {
          coolDown--;
        } else if (rms > 0.16) {
          hotFrames++;
          if (hotFrames >= 5) {
            hotFrames = 0;
            coolDown = 60;
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
