import { useEffect } from "react";

/**
 * Keeps the surprise private: disables right-click, text selection,
 * copy/cut, dragging images, and the usual view-source shortcuts.
 * (A determined person can always bypass this — it's a polite lock,
 * not a vault.)
 */
export default function NoCopy() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      // F12 / devtools
      if (k === "f12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd+Shift+I / J / C  (inspect, console, picker)
      if (mod && e.shiftKey && (k === "i" || k === "j" || k === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + U (source) · S (save) · C/X (copy/cut) · A (select all) · P (print)
      if (mod && ["u", "s", "c", "x", "a", "p"].includes(k)) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
