import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import introLogo from "@/assets/intro-logo.gif.asset.json";
import { toArabicNumerals } from "@/lib/utils";

const KEY = "nas-irbid-intro-seen";
let started = false; // guards React StrictMode double-mount

export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    if (started) return;
    if (sessionStorage.getItem(KEY)) return;
    started = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(KEY, "1");
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";
    sessionStorage.setItem(KEY, "1");

    const start = performance.now();
    const duration = 2200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setVisible(false), 320);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden="true"
        >
          {/* arch that opens up to reveal the hero */}
          <motion.div
            className="pointer-events-none absolute top-[6vh] h-[70vh] w-[min(38rem,86vw)] rounded-[9999px_9999px_2rem_2rem] border border-primary/15"
            style={{ boxShadow: "inset 0 0 0 10px oklch(0.42 0.16 25 / 0.03)" }}
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <motion.img
              src={introLogo.url}
              alt=""
              style={{ mixBlendMode: "screen" }}
              className="h-28 w-auto object-contain md:h-40"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <div className="flex flex-col items-center gap-3">
              <span className="font-display text-4xl text-primary tabular-nums">
                {toArabicNumerals(count)}٪
              </span>
              <div className="h-px w-40 overflow-hidden bg-border">
                <motion.div
                  className="h-full bg-gradient-warm"
                  style={{ width: `${count}%` }}
                />
              </div>
              <span className="text-xs tracking-[0.3em] text-muted-foreground">ناس إربد</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
