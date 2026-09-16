// Cinema mode — puts the browser into fullscreen so nothing but the
// surprise is on screen. Silently does nothing where it isn't allowed
// (notably iOS Safari on iPhone, which has no Element.requestFullscreen).

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

export function fullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as FsElement;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen
  );
}

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FsDocument;
  return !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement
  );
}

/**
 * Requests fullscreen. Must be called from a user gesture (a tap/click),
 * which is exactly when the mic permission button is pressed.
 */
export async function enterFullscreen(): Promise<boolean> {
  if (!fullscreenSupported() || isFullscreen()) return isFullscreen();

  const el = document.documentElement as FsElement;
  const request =
    el.requestFullscreen ??
    el.webkitRequestFullscreen ??
    el.msRequestFullscreen;

  if (!request) return false;

  try {
    await request.call(el, { navigationUI: "hide" } as FullscreenOptions);
    return true;
  } catch {
    // Browser declined (permissions policy, iframe sandbox, or no gesture).
    return false;
  }
}

export async function exitFullscreen(): Promise<void> {
  if (!isFullscreen()) return;
  const doc = document as FsDocument;
  const exit =
    doc.exitFullscreen ?? doc.webkitExitFullscreen ?? doc.msExitFullscreen;
  try {
    await exit?.call(doc);
  } catch {
    /* already left fullscreen */
  }
}
