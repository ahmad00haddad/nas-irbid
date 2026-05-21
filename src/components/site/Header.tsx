import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/episodes", label: "الحلقات" },
  { to: "/suggest", label: "اقترح حكاية" },
  { to: "/memories", label: "ذاكرتنا" },
  { to: "/about", label: "عن البرنامج" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { isEditor } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
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

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm font-semibold text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
