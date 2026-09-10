import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight, Compass } from "lucide-react";

type Step = { target: string; title: string; body: string };

const STEPS: Step[] = [
  { target: "[data-tour='nav']", title: "قائمة الأقسام", body: "تنقّل بين الحلقات والاقتراحات وبنك الأسئلة والرسائل. الأرقام الحمراء تعني عناصر جديدة تنتظر مراجعتك." },
  { target: "[data-tour='stats']", title: "المؤشرات السريعة", body: "لمحة فورية عن حالة الموقع: المنشور والمسودّات والوارد الجديد. اضغط أي بطاقة للانتقال لقسمها." },
  { target: "[data-tour='activity']", title: "أحدث النشاطات", body: "آخر ما وصلك من رسائل واقتراحات وآخر ما أضفته من حلقات، مرتّبة بالأحدث." },
  { target: "[data-tour='quick']", title: "إجراءات سريعة", body: "اختصارات لأكثر ما تفعله يومياً: إضافة حلقة، تعديل نصوص الموقع، ومعاينة الموقع كما يراه الزوّار." },
  { target: "[data-tour='palette']", title: "البحث السريع", body: "اضغط Ctrl+K (أو ⌘K) في أي لحظة للقفز إلى أي قسم دون استخدام الفأرة." },
];

const KEY = "nas-irbid-admin-tour-v1";

export function AdminTour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const handler = () => { setI(0); setOpen(true); };
    window.addEventListener("admin-tour:start", handler);
    return () => window.removeEventListener("admin-tour:start", handler);
  }, []);

  const measure = useCallback(() => {
    const step = STEPS[i];
    const el = step ? document.querySelector(step.target) : null;
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setRect(el.getBoundingClientRect());
  }, [i]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const id = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, measure]);

  const finish = () => {
    localStorage.setItem(KEY, "done");
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowLeft") setI((v) => Math.min(STEPS.length - 1, v + 1));
      if (e.key === "ArrowRight") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  const step = STEPS[i];
  const pad = 8;
  const top = rect ? rect.top - pad : window.innerHeight / 2 - 60;
  const left = rect ? rect.left - pad : 24;
  const width = rect ? rect.width + pad * 2 : 0;
  const height = rect ? rect.height + pad * 2 : 0;

  // Card placement: below the highlight when there's room, otherwise above.
  const belowSpace = typeof window !== "undefined" ? window.innerHeight - (top + height) : 0;
  const cardBelow = belowSpace > 220 || !rect;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" onClick={finish} />

      {rect && (
        <div
          className="absolute rounded-2xl border-2 border-primary pointer-events-none transition-all duration-300 ease-out"
          style={{
            top, left, width, height,
            boxShadow: "0 0 0 9999px hsl(var(--background) / 0.72), 0 0 40px hsl(var(--primary) / 0.35)",
          }}
        />
      )}

      <div
        className="absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-primary/40 bg-card p-5 shadow-deep transition-all duration-300"
        style={{
          top: cardBelow ? top + height + 14 : Math.max(16, top - 200),
          left: Math.min(Math.max(16, left), (typeof window !== "undefined" ? window.innerWidth : 400) - 360),
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-primary" />
            <h3 className="font-display text-lg text-foreground">{step.title}</h3>
          </div>
          <button onClick={finish} aria-label="إغلاق الجولة" className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.body}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-primary" : "w-1.5 bg-border"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs">
                <ArrowRight size={12} /> السابق
              </button>
            )}
            {i < STEPS.length - 1 ? (
              <button onClick={() => setI(i + 1)} className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                التالي <ArrowLeft size={12} />
              </button>
            ) : (
              <button onClick={finish} className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                تمام، فهمت
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function startAdminTour() {
  window.dispatchEvent(new Event("admin-tour:start"));
}
