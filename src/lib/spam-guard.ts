// Lightweight anti-spam: honeypot field + minimum time-to-submit.
// Bots typically fill every input and submit instantly.
import { useRef } from "react";

const MIN_MS = 2500;

export function useSpamGuard() {
  const mountedAt = useRef<number>(Date.now());
  return {
    // Hidden field name — humans don't see it; bots fill it.
    honeypotName: "website_url",
    // Check the submitted form; returns true if it looks like spam.
    isSpam(form: HTMLFormElement): boolean {
      const fd = new FormData(form);
      const trap = String(fd.get("website_url") ?? "").trim();
      if (trap.length > 0) return true;
      if (Date.now() - mountedAt.current < MIN_MS) return true;
      return false;
    },
  };
}

// Renders the invisible honeypot input. Wrap in a div hidden from AT & users.
export const HONEYPOT_INPUT_PROPS = {
  type: "text",
  name: "website_url",
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true,
} as const;
