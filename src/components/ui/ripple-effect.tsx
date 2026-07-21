import { useEffect, useRef } from "react";

interface Ripple {
  x: number;
  y: number;
  id: number;
}

let rippleId = 0;

export function RippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      // Don't create ripples on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, select, textarea")) return;

      const ripple = document.createElement("span");
      const id = ++rippleId;
      const size = 80;

      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX - size / 2}px;
        top: ${e.clientY - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, oklch(0.42 0.16 25 / 0.18) 0%, transparent 70%);
        border: 1.5px solid oklch(0.42 0.16 25 / 0.25);
        pointer-events: none;
        z-index: 9998;
        transform: scale(0);
        animation: ripple-expand 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      `;
      ripple.dataset.rippleId = String(id);

      container.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 750);
    };

    // Inject keyframe animation
    const styleId = "ripple-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes ripple-expand {
          0%   { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      aria-hidden
    />
  );
}
