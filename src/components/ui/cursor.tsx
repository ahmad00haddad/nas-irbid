import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Cursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState("");
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth physics for the cursor
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only run on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Search up the DOM tree for a specific interactive element
      const cursorTarget = target.closest('[data-cursor], a, button');
      if (cursorTarget) {
        setIsHovered(true);
        const text = cursorTarget.getAttribute('data-cursor-text');
        setHoverText(text || "");
      } else {
        setIsHovered(false);
        setHoverText("");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Don't render on mobile
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, a, button, [data-cursor] { cursor: none !important; }
        }
      `}</style>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-glow backdrop-blur-md md:flex"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{
          width: isHovered ? (hoverText ? 56 : 32) : 10,
          height: isHovered ? (hoverText ? 56 : 32) : 10,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.span 
          className="text-xs font-bold leading-none tracking-widest text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: hoverText ? 1 : 0, scale: hoverText ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {hoverText}
        </motion.span>
      </motion.div>
    </>
  );
}
