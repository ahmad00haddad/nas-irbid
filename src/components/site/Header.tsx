import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/episodes", label: "الحلقات" },
  { to: "/suggest", label: "اقترح حكاية" },
  { to: "/ask", label: "اسأل الضيف" },
  { to: "/contact", label: "تواصل معنا" },
  { to: "/about", label: "عن البرنامج" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { isEditor } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setOpen(false);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <motion.header 
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <span className="font-display text-xl font-bold text-primary-foreground">ن</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold text-foreground">ناس إربد</div>
            <div className="text-[11px] text-muted-foreground tracking-wider">برنامج وثائقي</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-md"
              activeProps={{ className: "px-4 py-2 text-sm font-semibold text-primary rounded-md bg-primary/5" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isEditor && (
            <Link to="/admin" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold text-foreground hover:border-primary/60 transition">
              <LayoutDashboard size={13} /> الإدارة
            </Link>
          )}
          <Link
            to="/about"
            hash="support"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-warm text-primary-foreground text-sm font-bold shadow-glow hover:opacity-90 transition"
          >
            ادعم البرنامج
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden animate-in slide-in-from-top-2 border-t border-border bg-background duration-200">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm font-semibold text-muted-foreground hover:text-primary"
                activeProps={{ className: "px-3 py-3 text-sm font-bold text-primary" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/about"
              hash="support"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
            >
              ادعم البرنامج
            </Link>
            {isEditor && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground"
              >
                <LayoutDashboard size={15} /> لوحة الإدارة
              </Link>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}
