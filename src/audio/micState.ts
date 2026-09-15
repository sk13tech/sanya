// Shared microphone permission state — requested once at the intro gate,
// then reused silently by the candle blow-detector.

export type MicState = "prompt" | "granted" | "denied" | "skipped";

let state: MicState = "prompt";

export function getMicState(): MicState {
  return state;
}

export function setMicState(s: MicState) {
  state = s;
}

export function micSupported(): boolean {
  return (
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  );
}

export async function requestMic(): Promise<MicState> {
  if (!micSupported()) {
    setMicState("denied");
    return "denied";
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
    });
    // We only needed the permission handshake — release the mic right away.
    stream.getTracks().forEach((t) => t.stop());
    setMicState("granted");
    return "granted";
  } catch {
    setMicState("denied");
    return "denied";
  }
}
