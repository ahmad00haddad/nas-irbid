import { useState, useRef, useEffect, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Contextual hint: a small "?" that reveals an explanation on hover, focus or tap.
 * Works on touch (tap toggles) and keyboard (focus reveals).
 */
export function AdminHint({ children, label = "شرح", side = "bottom" }: {
  children: ReactNode;
  label?: string;
  side?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-muted-foreground/70 hover:text-primary focus-visible:text-primary transition-colors"
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 w-56 rounded-xl border border-border/70 bg-card p-3 text-[11px] leading-relaxed text-muted-foreground shadow-deep animate-in fade-in-0 zoom-in-95 duration-150 ${
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } start-0`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
