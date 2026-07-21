import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function ReadingProgressBar() {
  const [isVisible, setIsVisible] = useState(false);
  const rawProgress = useSpring(0, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      rawProgress.set(progress);
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [rawProgress]);

  return (
    <motion.div
      className="fixed top-0 right-0 h-[3px] z-[200]"
      style={{
        scaleX: rawProgress as any,
        transformOrigin: "right",
        background: "linear-gradient(to left, oklch(0.42 0.16 25), oklch(0.60 0.14 50))",
        width: "100%",
        opacity: isVisible ? 1 : 0,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}
