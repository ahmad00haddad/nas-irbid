import { useRef, ReactNode } from "react";
import type { Variants } from "framer-motion";
import { motion, useInView } from "framer-motion";

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  /** "word" splits by word, "char" splits by character */
  by?: "word" | "char";
}

export function TextReveal({
  children,
  className = "",
  as: Tag = "p",
  delay = 0,
  by = "word",
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });

  const tokens = by === "char"
    ? children.split("")
    : children.split(" ");

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: by === "char" ? 0.03 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const item = {
    hidden: { y: "110%", opacity: 0, rotate: 2 },
    show: {
      y: "0%",
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Tag className={className} ref={ref} aria-label={children}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="inline-flex flex-wrap gap-x-[0.25em]"
        aria-hidden
      >
        {tokens.map((token, i) => (
          <span key={i} className="inline-block overflow-hidden leading-[1.15]">
            <motion.span
              variants={item}
              className="inline-block"
            >
              {token}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
